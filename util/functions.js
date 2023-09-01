const calculateTotal = (cartItems) => {
  let total = 0;
  cartItems.forEach((cartItem) => {
    total += cartItem.product.price * cartItem.quantity;
  });

  return total;
};

exports.calculateTotal = calculateTotal;
