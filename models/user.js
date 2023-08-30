const mongodb = require("mongodb");
const getDb = require("../util/database").getDb;

const Cart = require("./cart");

class User {
  constructor(username, email, cart, id) {
    this.username = username;
    this.email = email;
    this.cart = cart;
    this._id = id ? new mongodb.ObjectId(id) : null;
  }
  save() {
    const db = getDb();
    return db.collection("users").insertOne(this);
  }
  addToCart(product) {
    const db = getDb();
    this.cart = this.cart ? this.cart : { items: [] };
    const updatedCartItems = [...this.cart.items];
    const cartProductIndex = this.cart.items.findIndex((cartProduct) => {
      return cartProduct.productID.toString() === product._id.toString();
    });
    if (cartProductIndex >= 0) {
      //Product Exists in Cart
      updatedCartItems[cartProductIndex].quantity += 1;
    } else {
      //Product Does Not Exist in Cart
      updatedCartItems.push({
        productID: new mongodb.ObjectId(product._id),
        quantity: 1,
      });
    }
    const updatedCart = { items: updatedCartItems };

    return db
      .collection("users")
      .updateOne(
        { _id: new mongodb.ObjectId(this._id) },
        { $set: { cart: updatedCart } }
      );
  }

  deleteCartItem(productID) {
    const db = getDb();
    var updatedCartItems = [...this.cart.items];
    updatedCartItems = updatedCartItems.filter((item) => {
      return item.productID.toString() !== productID.toString();
    });
    this.cart.items = updatedCartItems;
    return db
      .collection("users")
      .updateOne(
        { _id: new mongodb.ObjectId(this._id) },
        { $set: { cart: this.cart } }
      );
  }

  getCart() {
    const db = getDb();
    // Get Products in Cart
    const productsIDs = this.cart.items.map((item) => {
      return item.productID;
    });
    return db
      .collection("products")
      .find({ _id: { $in: productsIDs } })
      .toArray()
      .then((products) => {
        var total = 0;

        // map products to cart items: Product ==> CarItem{Product{_id,title,description,price,imgUrl}, Quantity}
        let cartProducts = products.map((product) => {
          return {
            ...product,
            quantity: this.cart.items.find((item) => {
              return item.productID.toString() === product._id.toString();
            }).quantity,
          };
        });

        // calculate total price
        cartProducts.forEach((product) => {
          total += product.price * product.quantity;
        });
        return new Cart(cartProducts, total);
      })
      .catch((err) => console.log("Error Getting Cart Products: ", err));
  }
  addOrder() {
    const db = getDb();
    let order = {
      user: { _id: new mongodb.ObjectId(this._id), username: this.username },
      items: [],
      totalPrice: 0,
    };
    return this.getCart()
      .then((cart) => {
        order.items = cart.items;
        order.totalPrice = cart.totalPrice;
        return db.collection("orders").insertOne(order);
      })
      .then((result) => {
        this.cart = { items: [] };
        return db
          .collection("users")
          .updateOne(
            { _id: new mongodb.ObjectId(this._id) },
            { $set: { cart: this.cart } }
          );
      })
      .catch((err) => console.log("Error Adding Order: ", err));
  }
  getOrders() {
    const db = getDb();
    return db
      .collection("orders")
      .find({ "user._id": new mongodb.ObjectId(this._id) })
      .toArray();
  }

  static findById(userID) {
    const db = getDb();
    return db
      .collection("users")
      .findOne({ _id: new mongodb.ObjectId(userID) });
  }
}
module.exports = User;
