const express = require('express');
const router = express.Router();
const auth = require('../config/auth');
const isAdmin = auth.isAdmin;

// Get Page model
let Coupon = require('../models/coupon');

// Get Product model
const Product = require('../models/product');

/*
 * GET coupons index
 */
router.get('/', isAdmin, function (req, res) {
    res.render('admin/dashboard');
});

/*
 * GET coupons page
 */
router.get('/coupons', isAdmin, function (req, res) {
    Coupon.find(function (err, coupons) {
        if (err){
            return console.log(err);
        }
            res.render('admin/coupons',{
            coupons: coupons
        });
    });
    
});


/*
 * GET add coupons page
 */
router.get('/add-coupon', isAdmin, function (req, res) {

    let title = "";
    let discount = "";
    let expirationTime = "";

    res.render('admin/add_coupon', {
        title: title,
        discount: discount,
        expirationTime: expirationTime
    });

});

/*
 * POST add coupon page
 */
router.post('/add-coupon', function (req, res) {

    req.checkBody('title', 'Title must have a value!').notEmpty();
    req.checkBody('discount', 'Discount must be a number!').isNumeric();

    let title = req.body.title;
    let discount = req.body.discount;
    let expirationTime = req.body.expirationTime;
    let status;
    if (req.body.status === "active"){
        status = true;
    }else{
        status = false;
    }
    

    let errors = req.validationErrors();

    if (errors) {
        res.render('admin/add_coupon', {
            errors: errors,
            title: title,
            discount: discount,
            expirationTime: expirationTime
        });
    } else {
        Coupon.findOne({
            title: title
        }, function (err, coupon) {
            if (coupon) {
                req.flash('danger', 'Coupon exists, choose another!');
                res.render('admin/coupons', {
                    title: title,
                    discount: discount,
                    expirationTime: expirationTime
                });
            } else {
                let coupon = new Coupon({
                    title: title,
                    discount: discount,
                    expirationTime: expirationTime,
                    status: status
                });

                coupon.save(function (err) {
                    if (err)
                        return console.log(err);

                    req.flash('success', 'Coupon added successfully!');
                    res.redirect('/admin/dashboard/coupons');
                });
            }
        });
    }

});


/*
 * GET edit coupon page
 */
router.get('/edit-coupon/:id', isAdmin, function (req, res) {

    Coupon.findById(req.params.id, function (err, coupon) {
        if (err)
            return console.log(err);

        res.render('admin/edit_coupon', {
            id: coupon.id,
            coupon:coupon
        });
    });

});

/*
 * POST edit coupon page
 */
router.post('/edit-coupon/:id', function (req, res) {

    req.checkBody('title', 'Title must have a value!').notEmpty();
    req.checkBody('discount', 'Discount must be a number!').isNumeric();

    let title = req.body.title;
    let discount = req.body.discount;
    let expirationTime = req.body.expirationTime;
    let status;
    if (req.body.status === "active"){
        status = true;
    }else{
        status = false;
    }
    let id = req.params.id;
    

    let errors = req.validationErrors();

    if (errors) {
        res.render('admin/add_coupon', {
            id: id,
            errors: errors,
            title: title,
            discount: discount,
            expirationTime: expirationTime
        });
    } else {
        Coupon.findOne({
            title: title,
            _id: {
                '$ne': id
            }
        }, function (err, coupon) {
            if (coupon) {
                req.flash('danger', 'Coupon exists, choose another!');
                res.render('admin/coupons', {
                    id: id,
            errors: errors,
            title: title,
            discount: discount,
            expirationTime: expirationTime
                });
            } else {
                Coupon.findById(id, function (err, coupon) {
                    if (err)
                        return console.log(err);

                        coupon.title= title,
                        coupon.discount= discount,
                        coupon.expirationTime= expirationTime,
                        coupon.status= status

                    coupon.save(function (err) {
                        if (err)
                            return console.log(err);


                        req.flash('success', 'Coupon edited!');
                        res.redirect('/admin/dashboard/edit-coupon/' + id);
                    });

                });
            }
        });
    }

});

/*
 * GET delete Coupon
 */
router.get('/delete-coupon/:id', isAdmin, function (req, res) {
    Coupon.findByIdAndRemove(req.params.id, function (err) {
        if (err)
            return console.log(err);

        Coupon.find({}).sort({
            sorting: 1
        }).exec(function (err, coupons) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.coupons = coupons;
            }
        });

        req.flash('success', 'Coupon deleted!');
        res.redirect('/admin/dashboard/poupons/');
    });
});


// Exports
module.exports = router;