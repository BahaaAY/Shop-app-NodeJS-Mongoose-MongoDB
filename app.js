const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const username = require("./util/credentials").username;
const password = require("./util/credentials").password;

const errorController = require("./controllers/error");

const User = require("./models/user");

const app = express();

const MONGODB_URI = `mongodb+srv://${username}:${password}@cluster0.o8mxmhh.mongodb.net/shop`;

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    store: store,
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
  })
);

// app.use((req, res, next) => {
//   console.log("Url:", req.url);
//   User.findById("64f17e9f4d00f5d3f3c37754")
//     .then((user) => {
//       // console.log("User: ", user);
//       req.user = user;
//       next();
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// });

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    return User.findOne();
  })
  .then((user) => {
    if (!user) {
      const user = new User({
        username: "Bahaa",
        email: "Bahaa@email.com",
        cart: { items: [] },
      });
      return user.save();
    } else {
      return user;
    }
  })
  .then((result) => {
    console.log("Connected!");
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
