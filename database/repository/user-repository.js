const Address = require("../models/Address");
const User = require("../models/User");

class UserRepository {
  async CreateUser({ email, password, phone, role }) {
    const user = new User({
      email,
      password,
      phone,
      role,
    });

    const newUser = await user.save();
    return newUser;
  }

  async CreateAddress({ _id, street, postalCode, city, country }) {
    const profile = await User.findById(_id);

    if (profile) {
      const newAddress = new Address({
        street,
        postalCode,
        city,
        country,
      });

      await newAddress.save();

      profile.address.push(newAddress);
    }

    return await profile.save();
  }

  async FindUser({ email }) {
    const existingUser = await User.findOne({ email });
    return existingUser;
  }

  async FindUserById({ id }) {
    const existingUser = await User.findById(id).populate("address");

    return existingUser;
  }

  async Wishlist(userId) {
    const user = await User.findById(userId);

    return user.wishlist;
  }

  async AddWishlistItem(
    userId,
    { _id, name, desc, price, available, banner }
  ) {
    const product = {
      _id,
      name,
      desc,
      price,
      available,
      banner,
    };

    const profile = await User.findById(userId);

    if (profile) {
      let wishlist = profile.wishlist;

      if (wishlist.length > 0) {
        let isExist = false;
        wishlist.map((item) => {
          if (item._id.toString() === product._id.toString()) {
            const index = wishlist.indexOf(item);
            wishlist.splice(index, 1);
            isExist = true;
          }
        });

        if (!isExist) {
          wishlist.push(product);
        }
      } else {
        wishlist.push(product);
      }

      profile.wishlist = wishlist;
    }

    const profileResult = await profile.save();

    return profileResult.wishlist;
  }

  async AddCartItem(userId, { _id, name, price, banner }, qty, isRemove) {
    const profile = await User.findById(userId);

    if (profile) {
      const cartItem = {
        product: { _id, name, price, banner },
        unit: qty,
      };

      let cartItems = profile.cart;

      if (cartItems.length > 0) {
        let isExist = false;
        cartItems.map((item) => {
          if (item.product._id.toString() === _id.toString()) {
            if (isRemove) {
              cartItems.splice(cartItems.indexOf(item), 1);
            } else {
              item.unit = qty;
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

      profile.cart = cartItems;

      return await profile.save();
    }

    throw new Error("Unable to add to cart!");
  }

  async AddOrderToProfile(userId, order) {
    const profile = await User.findById(userId);

    if (profile) {
      if (profile.orders == undefined) {
        profile.orders = [];
      }
      profile.orders.push(order);

      profile.cart = [];

      const profileResult = await profile.save();

      return profileResult;
    }

    throw new Error("Unable to add to order!");
  }
}

module.exports = UserRepository;
