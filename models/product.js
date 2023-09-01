const mongoose = require("mongoose");
const Schemma = mongoose.Schema;

const productSchema = new Schemma({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
});
module.exports = mongoose.model("Product", productSchema);

// const mongodb = require("mongodb");
// const getDb = require("../util/database").getDb;
// class Product {
//   constructor(title, description, price, imageUrl, _id, userID) {
//     this._id = _id ? new mongodb.ObjectId(_id) : null;
//     this.title = title;
//     this.description = description;
//     this.price = price;
//     this.imageUrl = imageUrl;
//     this.userID = userID;
//   }
//   save() {
//     const db = getDb();
//     if (this._id) {
//       console.log("Updating Product: ", this._id);
//       //Update Existing Product
//       return db
//         .collection("products")
//         .updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: this });
//     } else {
//       //Add New Product
//       return db.collection("products").insertOne(this);
//     }
//   }
//   static findAll() {
//     const db = getDb();
//     return db.collection("products").find().toArray();
//   }
//   static findById(productID) {
//     const db = getDb();
//     return db.collection("products").findOne({
//       _id: new mongodb.ObjectId(productID),
//     });
//   }
//   static deleteById(productID) {
//     const db = getDb();
//     return db.collection("products").deleteOne({
//       _id: new mongodb.ObjectId(productID),
//     });
//   }
// }

// module.exports = Product;
