const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  console.log(req.session.isLoggedIn);
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isLoggedIn: req.session.isLoggedIn,
  });
};
exports.postLogin = (req, res, next) => {
  User.findById("64f17e9f4d00f5d3f3c37754")
    .then((user) => {
      req.session.user = {
        userId: user._id,
        username: user.username,
        email: user.email,
      };
      req.session.isLoggedIn = true;
      res.redirect("/");
    })
    .catch((err) => {});
};
exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
