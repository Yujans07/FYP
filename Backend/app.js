const express = require("express");
const axios = require("axios");
const app = express();

const router = express.Router();

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const path = require("path");

const session = require("express-session");
const passport = require("passport");
const OAuth2Strategy = require("passport-google-oauth2").Strategy;
const User = require("./models/user");
const { isAuthenticatedUser } = require("./middlewares/auth");
const errorMiddleware = require("./middlewares/error");

require("dotenv").config(); // Use dotenv to load environment variables

// Middleware setup
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload());

// Setting up routes
const products = require("./routes/product");
const auth = require("./routes/auth");
const payment = require("./routes/payment");
const order = require("./routes/order");
const cart = require("./routes/cart");
const exchange = require('./routes/exchange');

app.use("/api/v1", products);
app.use("/api/v1", auth);
app.use("/api/v1", payment);
app.use("/api/v1", order);
app.use("/api/v1", cart);
app.use("/api/v1", exchange);

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Store in .env file for security
    resave: false,
    saveUninitialized: true,
  })
);

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new OAuth2Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = new User({
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
            image: profile.photos[0].value,
          });

          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Google OAuth routes
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "http://localhost:3000/", // Redirect to home on success
    failureRedirect: "http://localhost:3000/api/v1/login", // Redirect to login page on failure
  })
);

// User Profile Route
app.get("/api/v1/me", isAuthenticatedUser, (req, res) => {
  res.status(200).json({ user: req.user });
});

// Payment success route
router.route("/payment/success").get((req, res) => {
  res.redirect("/success");
});

// Serve static files if in production
if (process.env.NODE_ENV === "PRODUCTION") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
  });
}

// Use error handling middleware
app.use(errorMiddleware);

module.exports = app;
