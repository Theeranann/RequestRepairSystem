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
