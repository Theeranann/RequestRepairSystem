let express = require('express');
let router = express.Router();
let dbCon = require('../lib/db');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// display add type page
router.get('/add', (req, res, next) => {
  res.render('add_type', {
      name: ''
  })
})

// display book page
router.get("/repair_list", (req, res, next) => {
    let query =
      "SELECT repair.*, repair_type.type_name, repair_status.status_name, repair_type.id AS repair_type_id, repair_status.id AS repair_status_id " +
      "FROM repair " +
      "JOIN repair_type ON repair_type_id = repair_type.id " +
      "JOIN repair_status ON repair_status_id = repair_status.id " +
      "ORDER BY repair.id ASC;";
    dbCon.query(query, (err, rows) => {
      if (err) {
        req.flash("error", err);
        res.render("admin", { data: "" });
      } else {
        res.render("admin", { data: rows });
      }
    });
  });

// add a new type
router.post('/add', (req, res, next) => {
  let name = req.body.name;
  let errors = false;

  if (name.length === 0) {
      errors = true;
      // set flash message
      req.flash('error', 'Please enter name');
      // render to add.ejs with flash message
      res.render('add_type', {
          name: name
      })
  }

  // if no error
  if (!errors) {
      let form_data = {
          name: name
      }

      // insert query
      dbCon.query('INSERT INTO repair_type SET ?', form_data, (err, result) => {
          if (err) {
              req.flash('error', err)

              res.render('add_type', {
                  name: form_data.name
              })
          } else {
              req.flash('success', 'successfully added');
              res.redirect('/');
          }
      })
  }
})

module.exports = router;
