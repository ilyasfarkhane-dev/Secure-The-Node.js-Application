const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const csurf = require("csurf");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true },
  })
);
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(csurf({ cookie: true }));

// Routes
app.get("/", (req, res) => {
  res.render("index", { csrfToken: req.csrfToken() });
});
async function hashPassword(password) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  } catch (err) {
    console.log(err);
  }
}

app.post(
  "/login",
  [
    body("username")
      .notEmpty()
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim()
      .escape(),
    body("password").notEmpty().isLength({ min: 5 }).trim().escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("username or password form is inccorect", errors);
      return res.redirect("/");
    }

    const { username, password } = req.body;
    const myHash = await hashPassword("Admin");


    if (username === "username") {
      bcrypt.compare(password, myHash, (err, result) => {
        if (result) {
          console.log("hi");
          req.session.regenerate(() => {
            req.session.isAuthenticated = true;
            return res.redirect("/dashboard");
          });
        } else {
          console.log(err);
          return res.redirect("/");
        }
      });
    } else {
      console.log("Somthings wrong!!!!!");
    }
  }
);

app.get("/dashboard", (req, res) => {
  // Secure the dashboard route to only allow authenticated users
  if (req.session.isAuthenticated) {
    res.render("dashboard");
  } else {
    return res.redirect("/");
  }
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
