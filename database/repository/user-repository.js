const Profile = require("../models/Profile");
const User = require("../models/User");
let print = console.log;
class UserRepository {
  async CreateUser({ email, password, phone, role, profileId }) {
    const user = new User({
      email,
      password,
      phone,
      role,
      profileId,
    });

    const newUser = await user.save();
    return newUser;
  }

  async EditProfile({
    _id,
    name,
    img,
    gender,
    street,
    postalCode,
    city,
    country,
    about
  }) {
    const profile = await Profile.find({ userId: _id });
    print("PROFILEEE", profile[0]);
    if (
      img !==
      "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
    ) {
      profile[0].img = img;
    }
    if (name !== "untouched name") {
      profile[0].name = name;
    }
    if (gender !== "untouched gender") {
      profile[0].gender = gender;
    }

    if (street !== "untouched street") {
      profile[0].street = street;
    }
    if (postalCode !== "untouched postcode") {
      profile[0].postalCode = postalCode;
    }
    if (city !== "untouched city") {
      profile[0].city = city;
    }
    if (country !== "untouched country") {
      profile[0].country = country;
    }
    if (about !== "untouched about") {
      profile[0].about = about;
    }

    await profile[0].save();

    return profile[0];
  }

  async FindUser({ email }) {
    const existingUser = await User.findOne({ email });
    return existingUser;
  }

  async AddWishlistItem(
    userId,
    {
      _id,
      name,
      desc,
      img,
      type,
      stock,
      price,
      available,
      sizes,
      colors,
      seller,
    },
    qty,
    isRemove
  ) {
    const user = await User.findById(userId);
    console.log("PARAMS", userId, qty, isRemove, colors);
    console.log(user);

    if (user) {
      const wishlistItem = {
        product: {
          _id,
          name,
          desc,
          img,
          type,
          stock,
          price,
          available,
          sizes,
          colors,
          seller,
        },
        amount: qty,
      };
      console.log("current user in add iwhslist item ", user.wishlist);
      console.log("the wishlist item to be added/removed ",wishlistItem)

      let wishlistItems = user.wishlist;

      if (wishlistItems.length > 0) {
        let isExist = false;
        wishlistItems.map((item) => {
          if (item.product._id.toString() === _id.toString()) {
            if (isRemove) {
              wishlistItems.splice(wishlistItems.indexOf(item), 1);
              user.wishlist = wishlistItems;
            } else {
              item.amount = qty;
            }
            isExist = true;
          }
        });

        if (!isExist) {
          wishlistItems.push(wishlistItem);
        }
      } else {
        wishlistItems.push(wishlistItem);
      }
      console.log("INSIDE USER ADD WISHLIST FUNCTION", wishlistItems);

      user.wishlist = wishlistItems;
      const updatedUser = await user.save();


      return updatedUser;
    }
  }

  async AddCartItem(
    userId,
    {
      _id,
      name,
      desc,
      img,
      type,
      stock,
      price,
      available,
      sizes,
      colors,
      seller,
    },
    qty,
    isRemove
  ) {
    const user = await User.findById(userId);
    console.log("PARAMS", userId, qty, isRemove);
    print(
      "PRODUCT DETAILS TO BE ENTERED ",
      name,
      desc,
      img,
      type,
      stock,
      price,
      available,
      sizes,
      colors,
      seller
    );
    if (user) {
      const cartItem = {
        product: {
          _id,
          name,
          desc,
          img,
          type,
          stock,
          price,
          sizes,
          colors,
          available,
          seller,
        },
        amount: qty,
      };
      print("AH CART ITEM????",cartItem)

      let cartItems = user.cart;
      print("THE CURRENT USRRR CART", cartItems);

      if (cartItems.length > 0) {
        let isExist = false;
        cartItems.map((item) => {

          if (item.product._id.toString() === _id.toString()) {
            if (isRemove) {
              cartItems.splice(cartItems.indexOf(item), 1);
              user.cart = cartItems;
            } else {
              item.amount = qty;
            }
            isExist = true;
          }
        });

        if (!isExist) {
          cartItems.push(cartItem);
        }
      } else {
        cartItems.push(cartItem);
      }
      console.log("INSIDE USER ADD CART FUNCTION", cartItems);

      user.cart = cartItems;

      return await user.save();
    }
  }
}

module.exports = UserRepository;
