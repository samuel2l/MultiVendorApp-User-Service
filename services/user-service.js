const UserRepository = require("../database/repository/user-repository");
const Profile = require("../database/models/Profile");
const {
  FormatData,
  GeneratePassword,
  GenerateSignature,
  ValidatePassword,
  CreateChannel,
  PublishMessage,
} = require("../utils");
const print = console.log;
const User = require("../database/models/User");
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
    const channel = await CreateChannel();
    PublishMessage(
      channel,
      process.env.NOTIFICATION_BINDING_KEY,
      JSON.stringify({
        event: "SEND_WELCOME_MAIL",
        data: {
          email: email,
        },
      })
    );

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
      print("is it even pshing?", user.orders);
      user.cart = [];
    });
    return await user.save();
  }

  async updateCart(productId, name, desc, img, type, stock, price, available) {
    try {
      const users = await User.find({ "cart.product._id": productId });

      if (!users.length) {
        console.log("No users found with this product in their cart.");
        return;
      }

      await Promise.all(
        users.map(async (user) => {
          user.cart = user.cart.map((item) =>
            item.product._id.toString() === productId.toString()
              ? {
                  ...item,
                  product: {
                    ...item.product,
                    name,
                    desc,
                    img,
                    type,
                    stock,
                    price,
                    available,
                  },
                }
              : item
          );

          await User.updateOne(
            { _id: user._id },
            { $set: { cart: user.cart } }
          );
        })
      );

      console.log("Cart updated for all affected users.");
    } catch (error) {
      console.error("Error updating product in carts:", error);
    }
  }
  async updateWishlist(
    productId,
    name,
    desc,
    img,
    type,
    stock,
    price,
    available
  ) {
    try {
      const users = await User.find({ "cart.product._id": productId });

      if (!users.length) {
        console.log("No users found with this product in their cart.");
        return;
      }

      await Promise.all(
        users.map(async (user) => {
          user.wishlist = user.wishlist.map((item) =>
            item.product._id.toString() === productId.toString()
              ? {
                  ...item,
                  product: {
                    ...item.product,
                    name,
                    desc,
                    img,
                    type,
                    stock,
                    price,
                    available,
                  },
                }
              : item
          );

          await User.updateOne(
            { _id: user._id },
            { $set: { wishlist: user.wishlist } }
          );
        })
      );

      console.log("Cart updated for all affected users.");
    } catch (error) {
      console.error("Error updating product in carts:", error);
    }
  }

  async getEmails(userIds, product) {
    print(" GETTING EMAILS");
    const users = await User.find();
    let emails = [];
    for (var user of users) {
      print("chale user???", user._id.toString);
      if (userIds.includes(user._id.toString())) {
        emails.push(user.email);
      }
    }
    let payload = {};
    print("gotten emails", emails);
    if (emails.length !== 0) {
      payload = {
        event: "SEND_PRODUCT_UPDATE_MAIL",
        data: {
          emails: emails,
          product: product,
        },
      };
      const channel = await CreateChannel();

      PublishMessage(
        channel,
        process.env.NOTIFICATION_BINDING_KEY,
        JSON.stringify(payload)
      );
    }
  }
  async changeOrderStatus(status, buyerId) {
    const user = await User.findById(buyerId);

   const payload = {
      event: "SEND_ORDER_STATUS_CHANGE_EMAIL",
      data: {
        email: user.email,
        status
      },
    };
    const channel = await CreateChannel();

    PublishMessage(
      channel,
      process.env.NOTIFICATION_BINDING_KEY,
      JSON.stringify(payload)
    );
  }
  async SubscribeEvents(payload) {
    payload = JSON.parse(payload);

    console.log(payload);

    const { event, data = { dummy: 8989 } } = payload;
    console.log("EVENT AND DATA", event, data);
    const { userId, product, order, qty } = data;

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
      case "UPDATE_CART_PRODUCT":
        {
          print("received data in update cart event", data);
          await this.updateCart(
            data.productId,
            data.name,
            data.desc,
            data.img,
            data.type,
            data.stock,
            data.price,
            data.available
          );
          await this.updateWishlist(
            data.productId,
            data.name,
            data.desc,
            data.img,
            data.type,
            data.stock,
            data.price,
            data.available
          );
        }
        break;
      case "GET_USER_EMAILS":
        console.log("in get user emails event");
        print(data, "DATAAA");
        console.log(event, data.userIds, data.product);
        await this.getEmails(data.userIds, data.product);
        break;
      // PublishMessage(channel,process.env.CUSTOMER_BINDING_KEY, JSON.stringify({event:"SEND_ORDER_STATUS_CHANGE_MAIL",data:{
      //   buyerId:order.customerId,status
      case "SEND_ORDER_STATUS_CHANGE_MAIL":
        print("IN SEND ORDER STATUS MAIL EVENT");
        await this.changeOrderStatus(data.status,data.buyerId)
        break;

      default:
        break;
    }
  }
}

module.exports = UserService;
