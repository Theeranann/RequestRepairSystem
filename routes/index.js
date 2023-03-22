let express = require("express");
let router = express.Router();
let dbCon = require("../lib/db");
var bodyParser = require("body-parser");
var session = require("express-session");
var flash = require("connect-flash");
var bcrypt = require("bcrypt");
var app = express();


/* GET home page. */
router.get("/", function (req, res, next) {
  res.redirect("/dashboard", { title: "Express" });
});

// Login and Register
router.get("/login", function (req, res) {
  res.render("login", { message: req.flash("error") });
});

router.post("/login", function (req, res) {
  var email = req.body.email;
  var password = req.body.password;

  dbCon.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    function (error, results, fields) {
      if (error) {
        console.log(error);
      } else {
        if (results.length > 0) {
          bcrypt.compare(password, results[0].password, function (err, result) {
            if (result) {
              req.session.loggedin = true;
              req.session.email = email;
              req.session.role = results[0].role;
              res.redirect("/dashboard");
            } else {
              req.flash("error", "Invalid email or password");
              res.redirect("/login");
            }
          });
        } else {
          req.flash("error", "Invalid email or password");
          res.redirect("/login");
        }
      }
    }
  );
});

router.get("/register", function (req, res) {
  res.render("register", { message: req.flash("error") });
});

router.post("/register", function (req, res) {
  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;
  var role = req.body.role;

  bcrypt.hash(password, 10, function (err, hash) {
    dbCon.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hash, role],
      function (error, results, fields) {
        if (error) {
          console.log(error);
          req.flash("error", "Registration failed");
          res.redirect("/register");
        } else {
          req.flash("success", "Registration successful");
          res.redirect("/login");
        }
      }
    );
  });
});

router.get("/dashboard", function (req, res) {
  if (req.session.loggedin) {
    if (req.session.role == "user") {
      res.render("user-dashboard", {
        email: req.session.email,
        title: "Express",
      });
    } else if (req.session.role == "admin") {
      res.render("admin-dashboard", {
        email: req.session.email,
        title: "Express",
      });
    } else {
      req.flash("error", "Invalid user role");
      res.redirect("/login");
    }
  } else {
    req.flash("error", "Please login first");
    res.redirect("/login");
  }
});

router.get("/logout", function (req, res) {
  req.session.loggedin = false;
  req.session.email = null;
  req.session.role = null;
  res.redirect("/login");
});

// display add type page
router.get("/add", (req, res, next) => {
  res.render("add_type", {
    name: "",
  });
});

// add a new type
router.post("/add", (req, res, next) => {
  let name = req.body.name;
  let errors = false;

  if (name.length === 0) {
    errors = true;
    // set flash message
    req.flash("error", "Please enter name");
    // render to add.ejs with flash message
    res.render("add_type", {
      name: name,
    });
  }

  // if no error
  if (!errors) {
    let form_data = {
      name: name,
    };

    // insert query
    dbCon.query("INSERT INTO repair_type SET ?", form_data, (err, result) => {
      if (err) {
        req.flash("error", err);

        res.render("add_type", {
          name: form_data.name,
        });
      } else {
        req.flash("success", "successfully added");
        res.redirect("/");
      }
    });
  }
});

module.exports = router;
