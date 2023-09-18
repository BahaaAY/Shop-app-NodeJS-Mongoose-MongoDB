const calculateTotal = require("../util/functions").calculateTotal;
const path = require("path");

const fs = require("fs");

const PDFDocument = require("pdfkit");

const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");

const PRODUCTS_PER_PAGE = 2;

const throwError = require("../util/functions").throwError;
// const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let productsCount = 0;
  Product.find()
    .countDocuments()
    .then((numProducts) => {
      productsCount = numProducts;
      return Product.find()
        .skip((page - 1) * PRODUCTS_PER_PAGE)
        .limit(PRODUCTS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
        currentPage: page,
        hasNextPage: PRODUCTS_PER_PAGE * page < productsCount,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(productsCount / PRODUCTS_PER_PAGE),
      });
    })
    .catch((err) => throwError(err, 500, next));
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
    .catch((err) => throwError(err, 500));
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let productsCount = 0;
  Product.find()
    .countDocuments()
    .then((numProducts) => {
      productsCount = numProducts;
      return Product.find()
        .skip((page - 1) * PRODUCTS_PER_PAGE)
        .limit(PRODUCTS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        currentPage: page,
        hasNextPage: PRODUCTS_PER_PAGE * page < productsCount,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(productsCount / PRODUCTS_PER_PAGE),
      });
    })
    .catch((err) => throwError(err, 500, next));
};

exports.getCart = (req, res, next) => {
  let user = req.user;
  user
    .getCart()
    .then((cart) => {
      // console.log("Cart Items: ", cart.items);
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        cartItems: cart.items,
        cartTotal: calculateTotal(cart.items),
      });
    })
    .catch((err) => {
      return throwError(err, 500, next);
    });
};
exports.postAddToCart = (req, res, next) => {
  const productID = req.body.productID;
  const user = req.user;
  Product.findById(productID)
    .then((product) => {
      console.log("Product Found: ", product);
      return user.addToCart(product);
    })
    .then((result) => {
      console.log("Product Added to Cart!");
      res.redirect("/cart");
    })
    .catch((err) => throwError(err, 500));
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
      return throwError(err, 500, next);
    });
};

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders()
    .then((orders) => {
      if (orders.length <= 0) {
        res.render("shop/orders", {
          path: "/orders",
          pageTitle: "Your Orders",
          orders: [],
        });
      } else {
        console.log("Orders:adssda ", orders[0].items[0]);
        res.render("shop/orders", {
          path: "/orders",
          pageTitle: "Your Orders",
          orders: orders,
        });
      }
    })
    .catch((err) => {
      return throwError(err, 500, next);
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
      return throwError(err, 500, next);
    });
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout",
  });
};

exports.getInvoice = (req, res, next) => {
  const orderID = req.params.orderID;
  Order.findById(orderID)
    .then((order) => {
      if (!order) {
        return throwError("No order found", 404, next);
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return throwError("Unauthorized", 403, next);
      } else {
        const invoiceName = `invoice-${orderID}.pdf`;
        const invoicePath = path.join("data", "invoices", invoiceName);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `inline; filename="${invoiceName}"`
        );
        var doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(invoicePath));
        doc.pipe(res);
        doc.fontSize(26).text("Invoice", {
          underline: true,
        });
        doc.fontSize(14).text("Order ID: #" + orderID, {});
        doc.fontSize(20).text("-----------------------");

        order.items.forEach((item) => {
          doc.text(
            item.product.title +
              " - " +
              item.quantity +
              " x " +
              item.product.price +
              "$"
          );
        });
        doc.fontSize(20).text("-----------------------");
        doc.fontSize(18).text("Total: $" + order.totalPrice);

        return doc.end();

        // fs.readFile(invoicePath, (err, data) => {
        //   if (err) {
        //     return throwError(err, 500, next);
        //   } else {
        //     res.setHeader("Content-Type", "application/pdf");
        //     res.setHeader(
        //       "Content-Disposition",
        //       `inline; filename="${invoiceName}"`
        //     );
        //     return res.send(data);
        //   }
        // });
        // const file = fs.createReadStream(invoicePath); //steam file instead of preloading it

        // return file.pipe(res);
      }
    })
    .catch((err) => {
      return throwError(err, 500, next);
    });
};
