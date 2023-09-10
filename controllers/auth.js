const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const { validationResult } = require("express-validator");

const User = require("../models/user");

const mailTrapUsername = require("../util/credentials").mailTrapUsername;
const mailTrapPassword = require("../util/credentials").mailTrapPassword;
const transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 587,
  secure: false,
  auth: {
    user: mailTrapUsername,
    pass: mailTrapPassword,
  },
});
exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
  });
};
exports.postSignup = (req, res, next) => {
  const email = req.body.email.trim();
  const password = req.body.password.trim();
  const confirmPassword = req.body.confirmPassword.trim();

  const result = validationResult(req);
  if (!result.isEmpty()) {
    // Data is invalid
    const message = result.array()[0].msg;
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: message,
    });
  } else {
    // Data is valid
    return bcrypt
      .hash(password, 12)
      .then((hashedPassword) => {
        const user = new User({
          email: email,
          password: hashedPassword,
          cart: { items: [] },
        });
        return user.save();
      })
      .then((result) => {
        res.redirect("/login");
        return transporter.sendMail({
          to: email,
          from: "bahaa-ay-shop@email.com",
          subject: "Signup succeeded!",
          html: "<h1>You successfully signed up!</h1>",
        });
      })
      .catch((err) => {
        console.log("Error while hashing the password: ", err);
      });
  }
};
exports.getLogin = (req, res, next) => {
  let errorMessage = req.flash("error");
  if (errorMessage.length > 0) {
    errorMessage = errorMessage[0];
  } else {
    errorMessage = null;
  }
  let userMessage = req.flash("msg");
  if (userMessage.length > 0) {
    userMessage = userMessage[0];
  } else {
    userMessage = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: errorMessage,
    userMessage: userMessage,
  });
};
exports.postLogin = (req, res, next) => {
  const email = req.body.email.trim();
  const password = req.body.password.trim();

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid email or password.");
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.user = user;
            req.session.isLoggedIn = true;
            return req.session.save((err) => {
              console.log(err);
              res.redirect("/");
            });
          } else {
            req.flash("error", "Invalid email or password.");
            return res.redirect("/login");
          }
        })
        .catch((err) => {
          console.log(err);
          return res.redirect("/login");
        });
    })
    .catch((err) => {});
};
exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};
exports.postReset = (req, res, next) => {
  const email = req.body.email.trim();
  req.flash(
    "error",
    "If your email is correct, you will receive an email with a link to reset your password."
  );
  crypto.randomBytes(32, (err, buffer) => {
    // generate a random token
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex"); // convert the buffer to a string
    User.findOne({ email: email })
      .then((user) => {
        // find the user
        if (user) {
          user.resetToken = token; // set the token
          user.resetTokenExpiration = Date.now() + 3600000; // set the expiration date
          return user
            .save()
            .then((result) => {
              transporter.sendMail({
                to: email,
                from: "bahaa-ay-shop@email.com",
                subject: "Password Reset Request",
                html: `
              <p>You requested a password reset</p>
              <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
              <p>This link will expire in one hour.</p>
              <p>If you did not request a password reset, please ignore this email.</p>`,
              });
              res.redirect("/reset");
            })
            .catch((err) => {
              // save the user
              console.log(err);
            });
        } else {
          res.redirect("/reset");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
};
exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() }, // check if the token is not expired
  })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid token.");
        return res.redirect("/login");
      }
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      return res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        errorMessage: message,
        userId: user._id.toString(),
        token: token,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password.trim();
  const userId = req.body.userId.trim();
  const token = req.body.token.trim();
  let resetUser;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      if (resetUser) {
        resetUser.password = hashedPassword;
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpiration = undefined;
        req.flash("msg", "Password reset successfully!");
        return resetUser.save();
      } else {
        return req.flash("error", "Invalid token!");
      }
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => {});
};
