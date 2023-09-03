exports.get404 = (req, res, next) => {
  res.status(404).render("404", {
    isLoggedIn: req.session.isLoggedIn,
    pageTitle: "Page Not Found",
    path: "/404",
  });
};
