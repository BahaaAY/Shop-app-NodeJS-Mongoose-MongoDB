const calculateTotal = require("../util/functions").calculateTotal;

const Product = require("../models/product");
const User = require("../models/user");
// const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
        isLoggedIn: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log("Error Fetch All:", err));
};

exports.getProduct = (req, res, next) => {
  const productID = req.params.productID;
  Product.findById(productID)
    .then((product) => {
      res.render("shop/product-detail", {
        pageTitle: product.title,
        path: "/products",
        product: product,
        isLoggedIn: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log("Error Fetch One:", err));
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        isLoggedIn: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log("Error Fetch All:", err));
};

exports.getCart = (req, res, next) => {
  User.findById(req.session.user.userId)
    .then((user) => {
      if (!user) {
        res.redirect("/login");
      } else {
        user
          .getCart()
          .then((cart) => {
            // console.log("Cart Items: ", cart.items);
            res.render("shop/cart", {
              path: "/cart",
              pageTitle: "Your Cart",
              cartItems: cart.items,
              cartTotal: calculateTotal(cart.items),
              isLoggedIn: req.session.isLoggedIn,
            });
          })
          .catch((err) => {
            console.log("Error Getting Cart!: ", err);
          });
      }
    })
    .catch((err) => console.log(err));
};

exports.postAddToCart = (req, res, next) => {
  const productID = req.body.productID;
  const user = req.user;
  Product.findById(productID)
    .then((product) => {
      return user.addToCart(product);
    })
    .then((result) => {
      console.log("Product Added to Cart!");
      res.redirect("/cart");
    })
    .catch((err) => console.log("Product Not Found: ", err));
};

exports.postDeleteCartItem = (req, res, next) => {
  const productId = req.body.productId;
  console.log("ProductID del: ", productId);
  req.user
    .removeFromCart(productId)
    .then((result) => {
      console.log("Product Deleted from Cart!: ", productId);
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log("Error: ", err);
    });
};

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders()
    .then((orders) => {
      console.log("Orders:adssda ", orders[0].items[0]);
      res.render("shop/orders", {
        isLoggedIn: req.session.isLoggedIn,
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
      });
    })
    .catch((err) => {
      console.log("Error: ", err);
    });
};

exports.postOrder = (req, res, next) => {
  let user = req.user; // Get User
  user
    .addOrder()
    .then((result) => {
      console.log("Order Added!");
      res.redirect("/orders");
    })
    .catch((err) => {
      console.log("Error: ", err);
    });
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout",
  });
};
