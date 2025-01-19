const mongoose = require("mongoose");



const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique:true
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Seller", "Buyer"],
      required: true,
    },
    profile: { type: mongoose.Schema.Types.ObjectId, ref: "profile"},
    cart: [
      {
        //reason the cart is not a reference to the product is cos each service should be autonomous and independent. If the Customer Service references the Product model directly, it creates a hard dependency on the Product Service.
        //hence following rules of microservice architecture
        product: {
          _id: { type: String, require: true },
          name: { type: String },
          desc: { type: String,default:'' },          
          img: { type: String },
          type: { type: String ,default:''},
          stock: { type: String ,default:''},
          price: { type: Number },
          available: { type: Boolean ,default:true},

          seller: { type: String ,default:''},
          
        },
        amount: { type: Number, require: true },
      },
    ],
    wishlist:  [
      {

        product: {
          _id: { type: String, require: true },
          name: { type: String },
          desc: { type: String,default:'' },          
          img: { type: String },
          type: { type: String ,default:''},
          stock: { type: String ,default:''},
          price: { type: Number },
          available: { type: Boolean ,default:true},

          seller: { type: String ,default:''},
          
        },
        amount: { type: Number, require: true },
      },
    ],
    orders: [
      {
        _id: { type: String, required: true },
        amount: { type: String },
        date: { type: Date, default: Date.now() },
      },
    ],
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.password;

        delete ret.__v;
      },
    },
    timestamps: true,
  }
);

module.exports = mongoose.model("user", userSchema);
