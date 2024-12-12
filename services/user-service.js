const UserRepository = require("../database/repository/user-repository");
const {
  FormatData,
  GeneratePassword,
  GenerateSignature,
  ValidatePassword,
} = require("../utils");

class UserService {
  constructor() {
    this.repository = new UserRepository();
  }

  async SignIn(userInputs) {
    const { email, password } = userInputs;

    const user = await this.repository.FindUser({ email });

    if (user) {
      const validPassword = await ValidatePassword(password, user.password);
      if (validPassword) {
        const token = await GenerateSignature({
          email: user.email,
          _id: user._id,
          role: user.role,
        });
        return FormatData({ id: user._id, token, role: user.role });
      }
    }

    return FormatData(null);
  }

  async SignUp(userInputs) {
    const { email, password, phone, role } = userInputs;

    let userPassword = await GeneratePassword(password);

    const user = await this.repository.CreateUser({
      email,
      password: userPassword,
      phone,
      role,
    });

    const token = await GenerateSignature({
      email: email,
      _id: user._id,
      role: role,
    });
    return FormatData({ id: user._id, token, role });
  }

  async AddNewAddress(_id, userInputs) {
    const { street, postalCode, city, country } = userInputs;

    const addressResult = await this.repository.CreateAddress({
      _id,
      street,
      postalCode,
      city,
      country,
    });

    return FormatData(addressResult);
  }

  async GetProfile(id) {
    const user = await this.repository.FindUserById({ id });
    return FormatData(user);
  }

  async GetCart(id) {
    const user = await this.repository.FindUserById({ id });
    return FormatData(user.cart);
  }

  async GetShoppingDetails(id) {
    const user = await this.repository.FindUserById({ id });

    if (user) {
      return FormatData(user);
    }
    return FormatData({ msg: "Error" });
  }

  async GetWishList(userId) {
    const wishListItems = await this.repository.Wishlist(userId);
    return FormatData(wishListItems);
  }

  async AddToWishlist(userId, product) {
    const wishlistResult = await this.repository.AddWishlistItem(
      userId,
      product
    );
    return FormatData(wishlistResult);
  }

  async ManageCart(userId, product, qty, isRemove) {
    const cartResult = await this.repository.AddCartItem(
      userId,
      product,
      qty,
      isRemove
    );
    return FormatData(cartResult);
  }

  async ManageOrder(userId, order) {
    const orderResult = await this.repository.AddOrderToProfile(
      userId,
      order
    );
    return FormatData(orderResult);
  }

  async SubscribeEvents(payload) {

    payload = JSON.parse(payload);
    console.log(payload);

    const { event, data } = payload;
    console.log("EVENT AND DATA", event, data);

    const { userId, product, order, qty } = data;

    switch (event) {
      case "ADD_TO_WISHLIST":
      case "REMOVE_FROM_WISHLIST":
        this.AddToWishlist(userId, product);
        break;
      case "ADD_TO_CART":
        this.ManageCart(userId, product, qty, false);
        break;
      case "REMOVE_FROM_CART":
        this.ManageCart(userId, product, qty, true);
        break;
      case "CREATE_ORDER":
        this.ManageOrder(userId, order);
        break;
      case "TEST":
        console.log("User service up and running man");
        break;
      default:
        break;
    }
  }
}

module.exports = UserService;
