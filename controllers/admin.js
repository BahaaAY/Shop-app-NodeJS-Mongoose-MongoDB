const { validationResult } = require("express-validator");

const Product = require("../models/product");

const getProductErrorMsg = require("../util/functions").getProductErrorMsg;
//Done with MongoDB
exports.getAddProduct = (req, res, next) => {
  res.render("admin/add-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    formsCSS: true,
    productCSS: true,
    activeAddProduct: true,
    oldInput: {
      title: "",
      imageUrl: "",
      price: "",
      description: "",
    },
    errorMessage: null,
    validationErrors: [],
  });
};
//Done with MongoDB
exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Errors: ", errors.array());
    return res.status(422).render("admin/add-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      formsCSS: true,
      productCSS: true,
      activeAddProduct: true,
      oldInput: {
        title: title,
        imageUrl: imageUrl,
        price: price,
        description: description,
      },
      errorMessage: getProductErrorMsg(errors),
      validationErrors: errors.array(),
    });
  } else {
    // Data is valid
    console.log("No Errors!");

    let product = new Product({
      title: title,
      description: description,
      price: price,
      imageUrl: imageUrl,
      userId: req.user,
    });
    product
      .save()
      .then((result) => {
        console.log("Product Created!");
        res.redirect("/admin/products");
      })
      .catch((err) => {
        console.log("Error Creating Proudct: ", err);
      });
  }
};

exports.getEditProduct = (req, res, next) => {
  const productID = req.query.productID;
  if (productID) {
    console.log("Product ID: ", productID);
    Product.findById(productID)
      .then((product) => {
        if (product) {
          res.render("admin/edit-product", {
            pageTitle: "Edit Product",
            path: "/admin/edit-product",
            formsCSS: true,
            productCSS: true,
            oldInput: {
              _id: product._id,
              title: product.title,
              imageUrl: product.imageUrl,
              price: product.price,
              description: product.description,
            },
            errorMessage: null,
            validationErrors: [],
          });
        } else {
          res.redirect("/");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    res.redirect("/");
  }
};

exports.postEditProduct = (req, res, next) => {
  console.log("PostEdit");
  const productID = req.body.productID;
  const newTitle = req.body.title;
  const newImgUrl = req.body.imageUrl;
  const newPrice = req.body.price;
  const newDesc = req.body.description;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Errors: ", errors.array());
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      formsCSS: true,
      productCSS: true,
      oldInput: {
        _id: productID,
        title: newTitle,
        imageUrl: newImgUrl,
        price: newPrice,
        description: newDesc,
      },
      errorMessage: getProductErrorMsg(errors),
      validationErrors: errors.array(),
    });
  } else {
    Product.findById(productID)
      .then((product) => {
        if (product.userId.toString() !== req.user._id.toString()) {
          return res.redirect("/");
        } else {
          product.title = newTitle;
          product.imageUrl = newImgUrl;
          product.price = newPrice;
          product.description = newDesc;
          return product.save().then((result) => {
            console.log("Product Updated!");
            res.redirect("/admin/products");
          });
        }
      })

      .catch((err) => {
        console.log(err);
      });
  }
};

exports.postDeleteProduct = (req, res, next) => {
  const productID = req.body.productID;
  console.log("deletion id: ", productID);
  Product.deleteOne({ _id: productID, userId: req.user._id })
    .then((result) => {
      console.log("Product Deleted!: ", result);
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProducts = (req, res, next) => {
  Product.find({
    userId: req.user._id,
  })
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
        isLoggedIn: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
