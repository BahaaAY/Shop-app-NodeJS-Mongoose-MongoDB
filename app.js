const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const username = require("./util/credentials").username;
const password = require("./util/credentials").password;

const errorController = require("./controllers/error");

const User = require("./models/user");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findById("64ee14bdea224dad6ff2d658")
    .then((user) => {
      if (user) {
        console.log("User: ", user);
        user = new User(user.username, user.email, user.cart, user._id);
        req.user = user;
        next();
      } else {
        const user = new User("Bahaa", "bahaa@gmail.com");
        user.save();
        req.user = user;
        next();
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
  .connect(
    `mongodb+srv://${username}:${password}@cluster0.o8mxmhh.mongodb.net/shop?retryWrites=true&w=majority`
  )
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
