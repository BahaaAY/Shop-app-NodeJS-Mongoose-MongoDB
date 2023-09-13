const calculateTotal = (cartItems) => {
  let total = 0;
  cartItems.forEach((cartItem) => {
    total += cartItem.product.price * cartItem.quantity;
  });

  return total;
};

const getProductErrorMsg = (errors) => {
  let errorMsg = "";
  if (errors.array().length > 0) {
    errors.array().forEach((error) => {
      switch (error.path) {
        case "title":
          errorMsg += "Title must be at least 3 characters long";
          break;
        case "imageUrl":
          errorMsg += "Image URL must be a valid URL";
          break;
        case "price":
          errorMsg += "Price must be a number";
          break;
        case "description":
          errorMsg += "Description must be at least 5 characters long";
          break;
        default:
          errorMsg += "Invalid product data";
      }
      errorMsg += "<br>";
    });
    return errorMsg;
  } else {
    return null;
  }
};

const throwError = (err, status, next) => {
  const error = new Error(err);
  error.httpStatusCode = status;
  return next(error);
};

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

exports.fileFilter = fileFilter;
exports.throwError = throwError;
exports.getProductErrorMsg = getProductErrorMsg;
exports.calculateTotal = calculateTotal;
