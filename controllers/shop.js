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
      });
    })
    .catch((err) => console.log("Error Fetch All:", err));
};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then((cart) => {
      //console.log("UserCart: ", cart);
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        cartProducts: cart.items,
        cartTotal: cart.totalPrice,
      });
    })
    .catch((err) => {
      console.log("Error Getting Cart!: ", err);
    });
};

exports.postAddToCart = (req, res, next) => {
  const productID = req.body.productID;
  const user = new User(
    req.user.username,
    req.user.email,
    req.user.cart,
    req.user._id
  );
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
  const productID = req.body.productID;
  console.log("ProductID del: ", productID);
  req.user
    .deleteCartItem(productID)
    .then((result) => {
      console.log("Product Deleted from Cart!: ", productID);
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
      res.render("shop/orders", {
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
