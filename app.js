const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const MongoDBStore = require("connect-mongodb-session")(session);

const csrfSync = require("csrf-sync").csrfSync;

const { csrfSynchronisedProtection } = csrfSync({
  getTokenFromRequest: (req) => req.body.csrfToken,
});
const username = require("./util/credentials").username;
const password = require("./util/credentials").password;

const errorController = require("./controllers/error");
const throwError = require("./util/functions").throwError;

const User = require("./models/user");

const app = express();

const MONGODB_URI = `mongodb+srv://${username}:${password}@cluster0.o8mxmhh.mongodb.net/shop`;

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    store: store,
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(csrfSynchronisedProtection);

app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken(true);

  next();
});
app.use(flash());
app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});
app.use((req, res, next) => {
  console.log("Url:", req.url);
  // console.log("Session:", req.session);
  if (req.session.isLoggedIn) {
    User.findById(req.session.user._id)
      .then((user) => {
        if (!user) {
          return next();
        }
        req.user = user;
        next();
      })
      .catch((err) => {
        return throwError(err, 500, next);
      });
  } else {
    next();
  }
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);
app.use((error, req, res, next) => {
  console.log("Error:", error);
  res.status(500).render("500", {
    pageTitle: "Page Not Found",
    path: "/404",
  });
});
mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    console.log("Connected!");
    app.listen(3000);
  })
  .catch((err) => {
    return throwError(err, 500, next);
  });
