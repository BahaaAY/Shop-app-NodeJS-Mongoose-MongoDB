const calculateTotal = (cartItems) => {
  let total = 0;
  cartItems.forEach((cartItem) => {
    total += cartItem.productId.price * cartItem.quantity;
  });

  return total;
};

exports.calculateTotal = calculateTotal;
