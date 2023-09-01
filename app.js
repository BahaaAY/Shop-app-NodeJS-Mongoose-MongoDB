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
  User.findById("64f17e9f4d00f5d3f3c37754")
    .then((user) => {
      console.log("User: ", user);
      req.user = user;
      next();
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
    return User.findOne();
  })
  .then((user) => {
    if (!user) {
      const user = new User({
        username: "Bahaa",
        email: "Bahaa@email.com",
        cart: { items: [] },
      });
      user.save();
    }
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
