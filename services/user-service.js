const UserRepository = require("../database/repository/user-repository");
const Profile = require("../database/models/Profile");
const {
  FormatData,
  GeneratePassword,
  GenerateSignature,
  ValidatePassword,
} = require("../utils");
const print = console.log;
const User = require("../database/models/User");
const { CreateChannel, PublishMessage } = require("../utils");

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
    print("USER INPUTS", email, password, phone, role);

    let userPassword = await GeneratePassword(password);

    const newUser = new User({
      email,
      password: userPassword,
      phone,
      role,
    });

    const savedUser = await newUser.save();
    print("SAVED USER", savedUser);

    const newProfile = new Profile({
      userId: savedUser._id,
      name: "New user",
      img: "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg",
      gender: "Male",
      street: "Prime wood road",
      postalCode: "64673",
      city: "Accra",
      country: "Ghana",
      about: "I am new here",
    });

    const savedProfile = await newProfile.save();
    savedUser.profile = savedProfile._id;
    await savedUser.save();

    console.log("User and profile created successfully!");
    console.log("User:", savedUser);
    console.log("Profile:", savedProfile);

    const token = await GenerateSignature({
      email: email,
      _id: savedUser._id,
      role: role,
    });
    return FormatData({ id: savedUser._id, token, role });
  }

  async EditProfile(_id, profileData) {
    const {
      name = "untouched name",
      img = "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg",
      gender = "untouched gender",
      street = "untouched street",
      postalCode = "untouched postcode",
      city = "untouched city",
      country = "untouched country",
      about = "untouched about",
    } = profileData;

    const updatedProfile = await this.repository.EditProfile({
      _id,
      name,
      img,
      gender,
      street,
      postalCode,
      city,
      country,
      about,
    });

    return FormatData(updatedProfile);
  }

  async GetUser(id) {
    const user = await User.findById(id).populate("profile");

    return user;
  }

  async AddToWishlist(userId, product) {
    const wishlistItem = await this.repository.AddWishlistItem(userId, product);
    return FormatData(wishlistItem);
  }

  async ManageCart(userId, product, qty, isRemove = false) {
    const cartResult = await this.repository.AddCartItem(
      userId,
      product,
      qty,
      isRemove
    );
    return FormatData(cartResult);
  }
  async EditWishlist(userId, product, qty, isRemove) {
    const wishlistResult = await this.repository.AddWishlistItem(
      userId,
      product,
      qty,
      isRemove
    );

    print("operation doneeee");
    print("result", wishlistResult);
    print("result", wishlistResult.wishlist[0]);
    return FormatData(wishlistResult);
  }

  async ManageOrder(userId, order) {
    const user = await User.findById(userId);
    

    order.forEach((item) => {

      const orderItem = {
        _id: item.orderId,
        amount: item.amount,
      };
  
      user.orders.push(orderItem);
      print("is it even pshing?",user.orders)
    });
    return await user.save();
  }

  async GetSellerId(id) {
    const seller = await User.findById(id);
    print("GOTTEN SELLER", seller.profile);
    const channel = await CreateChannel();

    PublishMessage(
      channel,
      process.env.PRODUCT_BINDING_KEY,
      JSON.stringify({
        event: "RECEIVE_SELLER_PROFILE",
        profile: seller.profile,
      })
    );
  }

  async SubscribeEvents(payload) {
    payload = JSON.parse(payload);
    console.log(payload);

    const { event, data = { dummy: 8989 } } = payload;
    console.log("EVENT AND DATA", event, data);
    const { userId, product, order, qty } = data;

    console.log(userId, product, "PRODUCT orderrr?????????", order, qty);

    switch (event) {
      case "ADD_TO_WISHLIST": {
        const { userId, product, amount, isRemove } = data;
        print("see the data", data);
        print(
          "IN ADD TO WISHLIST EVENT?????????",
          userId,
          product,
          amount,
          isRemove
        );
        await this.EditWishlist(userId, product, amount, isRemove);
        break;
      }

      case "REMOVE_FROM_WISHLIST": {
        const { userId, product, amount } = data;

        await this.EditWishlist(userId, product, amount, true);
        break;
      }
      case "ADD_TO_CART": {
        const { userId, product, amount, isRemove } = data;
        print(
          "IN ADD TO CART EVENT?????????",
          userId,
          product,
          amount,
          isRemove
        );
        await this.ManageCart(userId, product, amount, isRemove);
        break;
      }
      case "REMOVE_FROM_CART":
        {
          const { userId, product, amount } = data;
          await this.ManageCart(userId, product, amount, true);
        }

        break;
      case "CREATE_ORDER":
        console.log("in create order event");
        console.log(data.userId, order);
        await this.ManageOrder(data.userId, order);
        break;

      default:
        break;
    }
  }
}

module.exports = UserService;
