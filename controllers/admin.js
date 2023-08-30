const Product = require("../models/product");

//Done with MongoDB
exports.getAddProduct = (req, res, next) => {
  res.render("admin/add-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    formsCSS: true,
    productCSS: true,
    activeAddProduct: true,
  });
};
//Done with MongoDB
exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  let product = new Product(
    title,
    description,
    price,
    imageUrl,
    null,
    req.user._id
  );
  product
    .save()
    .then((result) => {
      console.log("Product Created!");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log("Error Creating Proudct: ", err);
    });
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
            product: product,
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
  const product = new Product(
    productID,
    newTitle,
    newDesc,
    newPrice,
    newImgUrl
  );
  product
    .save()
    .then((result) => {
      console.log("Product Updated!");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const productID = req.body.productID;
  console.log("deletion id: ", productID);
  Product.deleteById(productID)
    .then((result) => {
      console.log("Product Deleted!");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
