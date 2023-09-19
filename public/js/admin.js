const deleteProduct = (btn) => {
  const prodId = btn.parentNode.querySelector("[name=productID]").value;
  const csrf = btn.parentNode.querySelector("[name=csrfToken]").value;

  console.log("Delete Product: ", prodId);
  console.log("CSRF Token: ", csrf);

  fetch("/admin/product/" + prodId, {
    method: "DELETE",
    headers: {
      "csrf-token": csrf,
    },
  })
    .then((result) => {
      return result.json();
    })
    .then((data) => {
      console.log(data);
      const productElement = btn.closest("article");
      productElement.parentNode.removeChild(productElement);
    })
    .catch((err) => {
      console.log(err);
    });
};
