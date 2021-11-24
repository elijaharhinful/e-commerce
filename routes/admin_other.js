const express = require('express');
const router = express.Router();
const auth = require('../config/auth');
const isAdmin = auth.isAdmin;

// Get User model
let User = require('../models/user');
// Get Category model
let Order = require('../models/order');

/*
 * GET Dashboard index
 */
router.get('/', isAdmin,  function (req, res) {
        res.render('admin/dashboard');
});

/*
 * GET customer page
 */
router.get('/customers', isAdmin,  function (req, res) {
    User.find(function (err, customers) {
        if (err)
            return console.log(err);

        res.render('admin/customers', {
            customers: customers
        });
    });
});

/*
 * GET order page
 */
router.get('/orders', isAdmin,  function (req, res) {
    Order.find(function (err, orders) {
        if (err)
            return console.log(err);
        res.render('admin/orders', {
            orders: orders
        });
    });
});


router.get('/order/:id', isAdmin,  function (req, res) {
    let orderId = req.params.id;
    let cartOrder;
    
    Order.findById(orderId,function (err, order) {
        cartOrder = order.cart;
        if (err)
            return console.log(err);
        res.render('admin/order_details', {
            order: order,
            cartOrder: cartOrder
        });
    });
});








// Exports
module.exports = router;


