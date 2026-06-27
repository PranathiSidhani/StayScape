const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
  console.log("Signup route hit");
  return res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
  try {
    let { username, email, password } = req.body;

    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);

    console.log("User registered:", registeredUser);

    req.login(registeredUser, (err) => {
      if (err) {
        console.log("LOGIN ERROR:", err);
        return next(err);
      }

      console.log("User logged in successfully");

      req.flash("success", "Welcome to StayScape!");
      return res.redirect("/listings");
    });
  } catch (e) {
    console.log("SIGNUP ERROR:", e);

    req.flash("error", e.message);
    return res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back to StayScape!");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You're Logged out!");
    res.redirect("/listings");
  });
};
