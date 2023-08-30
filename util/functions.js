const calculateTotal = (products) => {
  let total = 0;
  products.forEach((product) => {
    total += product.price * product.cartItem.quantity;
  });

  return total;
};

exports.calculateTotal = calculateTotal;
