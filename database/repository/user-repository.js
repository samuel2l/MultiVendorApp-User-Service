const Profile = require("../models/Profile");
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

  async CreateProfile({ _id,name,gender, street, postalCode, city, country }) {
    const user = await User.findById(_id);

    if (user) {
      const profile = new Profile({
        name,
        gender,
        street,
        postalCode,
        city,
        country,
      });

      const newProfile=await profile.save();
      
      user.profile=newProfile;
    
    }

    return await user.save();
  }

  async EditProfile({ _id,name,gender, street, postalCode, city, country }) {
    const user = await User.findById(_id);

    if (user && user.profile) {
      const profile = await Profile.findById(user.profile._id)
      console.log('PROFILEEEE',profile)
      profile.name=name
      profile.gender=gender
      profile.street=street
      profile.postalCode=postalCode
      profile.city=city
      profile.country=country
      await profile.save()


      
    }

    return user.populate('profile')
    

    
  }

  async FindUser({ email }) {
    const existingUser = await User.findOne({ email });
    return existingUser;
  }

  async FindUserById({ id }) {
    const existingUser = await User.findById(id).populate("profile");

    return existingUser;
  }


  async AddWishlistItem(userId, { _id, name,desc,img,type,stock, price,available,seller }, qty, isRemove) {
    const user = await User.findById(userId);
console.log("PARAMS",userId,qty)
console.log(user)
  if (user) {
    const wishlistItem = {
      product: { _id, name,desc,img,type,stock, price,available,seller},
      amount: qty,
    };
    console.log("current user in add iwhslist item ",user.wishlist)

    let wishlistItems = user.wishlist;

    if (wishlistItems.length > 0) {
      let isExist = false;
      wishlistItems.map((item) => {
        if (item.product._id.toString() === _id.toString()) {
          if (isRemove) {
            wishlistItems.splice(wishlistItems.indexOf(item), 1);
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
    //i
    console.log("INSIDE USER ADD WISHLIST FUNCTION", wishlistItems)

    user.wishlist = wishlistItems;
    const updatedUser=    await user.save()


    return updatedUser

  }    
  }

  async AddCartItem(userId, { _id, name,desc,img,type,stock, price,available,seller }, qty, isRemove) {
    const user = await User.findById(userId);
console.log("PARAMS",userId,qty)

  if (user) {
    const cartItem = {
      product: { _id, name,desc,img,type,stock, price,available,seller},
      amount: qty,
    };

    let cartItems = user.cart;

    if (cartItems.length > 0) {
      let isExist = false;
      cartItems.map((item) => {
        if (item.product._id.toString() === _id.toString()) {
          if (isRemove) {
            cartItems.splice(cartItems.indexOf(item), 1);
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
    console.log("INSIDE USER ADD CART FUNCTION", cartItems)

    user.cart = cartItems;

    return await user.save();

  }    
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
