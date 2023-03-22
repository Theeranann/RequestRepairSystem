let express = require("express");
let router = express.Router();
let dbCon = require("../lib/db");

// display book page
router.get("/", (req, res, next) => {
  let query =
    "SELECT repair.*, repair_type.type_name, repair_status.status_name, repair_type.id AS repair_type_id, repair_status.id AS repair_status_id " +
    "FROM repair " +
    "JOIN repair_type ON repair_type_id = repair_type.id " +
    "JOIN repair_status ON repair_status_id = repair_status.id " +
    "ORDER BY repair.id ASC;";
  dbCon.query(query, (err, rows) => {
    if (err) {
      req.flash("error", err);
      res.render("repair", { data: "" });
    } else {
      res.render("repair", { data: rows });
    }
  });
});

// display add page
router.get("/add", (req, res, next) => {
  dbCon.query('SELECT * FROM repair_type', function(err, results) {
    if (err) throw err;
    // Pass the retrieved option values to an EJS template as a variable
    res.render('repair/add', 
    { options: results,
      repair_type: "",
      details: "",
      location: "",
      name: "",
      email: "" });
  });
});

// add a new
router.post("/add", (req, res, next) => {
  let repair_type = req.body.repair_type;
  let repair_status = "1";
  let details = req.body.details;
  let location = req.body.location;
  let name = req.body.name;
  let email = req.body.email;
  let errors = false;

  if (name.length === 0 || repair_type.length === 0) {
    errors = true;
    // set flash message
    req.flash("error", "Please enter");
    // render to add.ejs with flash message
    res.render("repair/add", {
      repair_type: repair_type,
      details: details,
      location: location,
      name: name,
      email: email,
    });
  }

  // if no error
  if (!errors) {
    let form_data = {
      repair_type_id: repair_type,
      repair_status_id: repair_status,
      detail: details,
      location: location,
      name: name,
      email: email,
    };

    // insert query
    dbCon.query("INSERT INTO repair SET ?", form_data, (err, result) => {
      if (err) {
        req.flash("error", err);

        res.render("repair/add", {
          repair_type: form_data.repair_type,
          details: form_data.details,
          location: form_data.location,
          name: form_data.name,
          email: form_data.email,
        });
      } else {
        req.flash("success", "successfully added");
        res.redirect("/repair");
      }
    });
  }
});

// display edit page
router.get("/edit/(:id)", (req, res, next) => {
  let id = req.params.id;

  dbCon.query("SELECT * FROM repair WHERE id = " + id, (err, rows, fields) => {
    if (rows.length <= 0) {
      req.flash("error", "Book not found with id = " + id);
      res.redirect("/repair");
    } else {
      dbCon.query("SELECT * FROM repair_type", (err, repairTypes, fields) => {
        if (err) throw err;

        res.render("repair/edit", {
          title: "Edit repair",
          id: rows[0].id,
          details: rows[0].detail,
          location: rows[0].location,
          name: rows[0].name,
          email: rows[0].email,
          repairTypes: repairTypes,
          selectedRepairType: rows[0].type_name
        });
      });
    }
  });
});

// update page
router.post("/update/:id", (req, res, next) => {
  let id = req.params.id;
  let repair_type = req.body.repair_type;
  let details = req.body.details;
  let location = req.body.location;
  let name = req.body.name;
  let email = req.body.email;
  let errors = false;
  console.log(req.body);

  if (name.length === 0) {
    errors = true;
    req.flash("error", "Please enter");
    res.render("repair/edit", {
      id: req.params.id,
    });
  }
  // if no error
  if (!errors) {
    let form_data = {
      repair_type_id: repair_type,
      detail: details,
      location: location,
      name: name,
      email: email,
    };
    // update query
    dbCon.query(
      "UPDATE repair SET ? WHERE id = " + id,
      form_data,
      (err, result) => {
        if (err) {
          req.flash("error", err);
          res.render("repair/edit", {
            id: req.params.id,
            repair_type: form_data.repair_type,
            details: form_data.details,
            location: form_data.location,
            name: form_data.name,
            email: form_data.email,
          });
        } else {
          req.flash("success", "successfully updated");
          res.redirect("/repair");
        }
      }
    );
  }
});

// delete book
router.get("/delete/(:id)", (req, res, next) => {
  let id = req.params.id;

  dbCon.query("DELETE FROM repair WHERE id = " + id, (err, result) => {
    if (err) {
      req.flash("error", err), res.redirect("/repair");
    } else {
      req.flash("success", "successfully deleted! ID = " + id);
      res.redirect("/repair");
    }
  });
});

module.exports = router;
