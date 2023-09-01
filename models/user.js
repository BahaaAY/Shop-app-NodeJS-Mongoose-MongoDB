const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Order = require("./order");
const { calculateTotal } = require("../util/functions");

const userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  cart: {
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  this.cart = this.cart ? this.cart : { items: [] };
  const updatedCartItems = [...this.cart.items];
  const cartProductIndex = this.cart.items.findIndex((cartProduct) => {
    return cartProduct.product.toString() === product._id.toString();
  });
  if (cartProductIndex >= 0) {
    //Product Exists in Cart
    updatedCartItems[cartProductIndex].quantity += 1;
  } else {
    //Product Does Not Exist in Cart
    updatedCartItems.push({
      product: product._id,
      quantity: 1,
    });
  }
  const updatedCart = { items: updatedCartItems };
  this.cart = updatedCart;

  return this.save();
};

userSchema.methods.getCart = function () {
  // Get Products in Cart
  return this.cart.populate("items.product");
};
userSchema.methods.removeFromCart = function (productId) {
  var updatedCartItems = [...this.cart.items];
  updatedCartItems = updatedCartItems.filter((item) => {
    return item.product.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.addOrder = function () {
  return this.cart
    .populate("items.product")
    .then((cart) => {
      let order = new Order({
        user: {
          userId: this,
          username: this.username,
        },
        items: cart.items,
        totalPrice: calculateTotal(cart.items),
      });

      console.log("Order :::::::: ", order);
      return order.save();
    })
    .then((result) => {
      return this.clearCart();
    })
    .catch((err) => console.log(err));
};
userSchema.methods.clearCart = function () {
  let updatedCart = { items: [] };
  this.cart = updatedCart;
  return this.save();
};
userSchema.methods.getOrders = function () {
  return Order.find({ "user.userId": this._id });
};
module.exports = mongoose.model("User", userSchema);

// const mongodb = require("mongodb");
// const getDb = require("../util/database").getDb;

// const Cart = require("./cart");

// class User {
//   constructor(username, email, cart, id) {
//     this.username = username;
//     this.email = email;
//     this.cart = cart;
//     this._id = id ? new mongodb.ObjectId(id) : null;
//   }
//   save() {
//     const db = getDb();
//     return db.collection("users").insertOne(this);
//   }
//   addToCart(product) {

//   }

//   deleteCartItem(productID) {
//     const db = getDb();
//     var updatedCartItems = [...this.cart.items];
//     updatedCartItems = updatedCartItems.filter((item) => {
//       return item.productID.toString() !== productID.toString();
//     });
//     this.cart.items = updatedCartItems;
//     return db
//       .collection("users")
//       .updateOne(
//         { _id: new mongodb.ObjectId(this._id) },
//         { $set: { cart: this.cart } }
//       );
//   }

//   getCart() {

//   }
//   addOrder() {
//     const db = getDb();
//     let order = {
//       user: { _id: new mongodb.ObjectId(this._id), username: this.username },
//       items: [],
//       totalPrice: 0,
//     };
//     return this.getCart()
//       .then((cart) => {
//         order.items = cart.items;
//         order.totalPrice = cart.totalPrice;
//         return db.collection("orders").insertOne(order);
//       })
//       .then((result) => {
//         this.cart = { items: [] };
//         return db
//           .collection("users")
//           .updateOne(
//             { _id: new mongodb.ObjectId(this._id) },
//             { $set: { cart: this.cart } }
//           );
//       })
//       .catch((err) => console.log("Error Adding Order: ", err));
//   }
//   getOrders() {
//     const db = getDb();
//     return db
//       .collection("orders")
//       .find({ "user._id": new mongodb.ObjectId(this._id) })
//       .toArray();
//   }

//   static findById(userID) {
//     const db = getDb();
//     return db
//       .collection("users")
//       .findOne({ _id: new mongodb.ObjectId(userID) });
//   }
// }
// module.exports = User;
