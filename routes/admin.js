let express = require("express");
let router = express.Router();
let dbCon = require("../lib/db");

// display Repair List page
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
            res.render("admin", { data: "" });
        } else {
            res.render("admin", { data: rows });
        }
    });
});

// admin eidt
// display edit page
router.get("/edit/(:id)", (req, res, next) => {
    let id = req.params.id;

    dbCon.query("SELECT * FROM repair JOIN repair_type ON repair_type_id = repair_type.id WHERE repair.id = " + id, (err, rows, fields) => {
        if (rows.length <= 0) {
            req.flash("error", "not found with id = " + id);
            res.redirect("/admin");
        } else {
            dbCon.query("SELECT * FROM repair_status", (err, repairStatus, fields) => {
                if (err) throw err;

                res.render("admin/edit", {
                    title: "Edit repair",
                    id: rows[0].id,
                    type_name: rows[0].type_name,
                    details: rows[0].detail,
                    location: rows[0].location,
                    name: rows[0].name,
                    email: rows[0].email,
                    repairStatus: repairStatus,
                    selectedRepairType: rows[0].type_name
                });
            });
        }
    });
});

// update page
router.post('/update_status/:id', (req, res, next) => {
    let id = req.params.id;
    let status_type = req.body.status_type;
    let errors = false;

    if (status_type.length === 0) {
        errors = true;
        req.flash('error', 'Please enter name and author');
        res.render('admin/edit', {
            id: req.params.id,
        })
    }
    // if no error
    if (!errors) {
        let form_data = {
            repair_status_id: status_type
        }
        // update query
        dbCon.query("UPDATE books SET ? WHERE id = " + id, form_data, (err, result) => {
            if (err) {
                req.flash('error', err);
                res.render('books/edit', {
                    id: req.params.id,
                    repair_status_id: form_data.repair_status_id,
                })
            } else {
                req.flash('success', 'successfully updated');
                res.redirect('/admin')
            }
        })
    }
})

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