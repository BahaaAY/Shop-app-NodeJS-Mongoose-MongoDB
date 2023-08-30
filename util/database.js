const mongodb = require("mongodb"); // import mongodb package
const MongoClient = mongodb.MongoClient; // create a client
const username = require("./credentials").username;
const password = require("./credentials").password;

let _db;
const mongoConnect = new Promise((resolve, reject) => {
  MongoClient.connect(
    `mongodb+srv://${username}:${password}@cluster0.o8mxmhh.mongodb.net/shop?retryWrites=true&w=majority`
  )
    .then((result) => {
      console.log("Connected!");
      _db = result.db();
      resolve();
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
});

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "No database found!";
};
exports.getDb = getDb;

exports.mongoConnect = mongoConnect;
