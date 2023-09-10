const express = require("express");
const { query } = require("express-validator");

const { body } = require("express-validator");
const authController = require("../controllers/auth");

const User = require("../models/user");

const router = express.Router();
router.get("/signup", authController.getSignup);

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email!")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Email already exists!");
          }
        });
      }),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Please enter a valid password!"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords have to match!");
      }
      return true;
    }),
  ],

  authController.postSignup
);

router.get("/login", authController.getLogin);

router.post("/login", authController.postLogin);

router.post("/logout", authController.postLogout);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

module.exports = router;
