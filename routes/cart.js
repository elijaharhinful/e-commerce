const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const router = express.Router();



// Get Product model
const Product = require('../models/product');

/*
 * GET add product to cart
 */
router.get('/add/:product', function (req, res) {

    let slug = req.params.product;

    Product.findOne({slug: slug}, function (err, p) {
        if (err)
            console.log(err);

        if (typeof req.session.cart == "undefined") {
            req.session.cart = [];
            req.session.cart.push({
                title: slug,
                qty: 1,
                price: parseFloat(p.price).toFixed(2),
                image: '/product_images/' + p._id + '/' + p.image
            });
        } else {
            let cart = req.session.cart;
            let newItem = true;

            for (let i = 0; i < cart.length; i++) {
                if (cart[i].title == slug) {
                    cart[i].qty++;
                    newItem = false;
                    break;
                }
            }

            if (newItem) {
                cart.push({
                    title: slug,
                    qty: 1,
                    price: parseFloat(p.price).toFixed(2),
                    image: '/product_images/' + p._id + '/' + p.image
                });
            }
        }

//        console.log(req.session.cart);
        req.flash('success', 'Product added!');
        res.redirect('back');
    });

});

/*
 * GET shopping cart
 */
router.get('/my_cart', function (req, res) {

    if (req.session.cart && req.session.cart.length == 0) {
        delete req.session.cart;
        res.redirect('/cart/my_cart');
    } else {
        res.render('my_cart', {
            title: 'Shopping Cart',
            cart: req.session.cart
        });
    }

});

/*
 * GET checkout page
 */
router.get('/checkout', function (req, res) {

    if (req.session.cart && req.session.cart.length == 0) {
        delete req.session.cart;
        res.redirect('/cart/checkout');
    } else {
        res.render('checkout', {
            title: 'Checkout',
            cart: req.session.cart
        });
    }

});

/*
 * POST checkout form
 */
router.post('/checkout', function (req, res) {
    let ref = req.body.ref;
    let buf = crypto.randomBytes(8);

    let new_ref = ref + buf.toString('hex')

    let params = JSON.stringify({
        "email": req.body.email,
        "amount": req.body.total * 100,
        "currency": "GHS",
        "reference": new_ref,
        "channels": ['card', 'mobile_money'],
        "callback_url": 'https://elisales.herokuapp.com/cart/payment-complete'
    })

    let options = {
        port: 443,
        headers: {
            Authorization: 'Bearer sk_test_3ea89404901938dd63eab962eda8b22986d2aa48',
            'Content-Type': 'application/json'
        }
    }

    axios.post('https://api.paystack.co/transaction/initialize', params, options)
        .then(function (response) {
            res.redirect(response.data.data.authorization_url)
        })
        .catch(function (error) {
            console.log(error);
        });

});

/*
 * GET update product
 */
router.get('/update/:product', function (req, res) {

    let slug = req.params.product;
    let cart = req.session.cart;
    let action = req.query.action;

    for (let i = 0; i < cart.length; i++) {
        if (cart[i].title == slug) {
            switch (action) {
                case "add":
                    cart[i].qty++;
                    break;
                case "remove":
                    cart[i].qty--;
                    if (cart[i].qty < 1)
                        cart.splice(i, 1);
                    break;
                case "clear":
                    cart.splice(i, 1);
                    if (cart.length == 0)
                        delete req.session.cart;
                    break;
                default:
                    console.log('update problem');
                    break;
            }
            break;
        }
    }

    req.flash('success', 'Cart updated!');
    res.redirect('/cart/my_cart');

});

/*
 * GET clear cart
 */
router.get('/clear', function (req, res) {

    delete req.session.cart;
    
    req.flash('success', 'Cart cleared!');
    res.redirect('/cart/my_cart');

});

/*
 * GET payment complete page
 */
router.get('/payment-complete', function (req, res) {
    
    if (res.locals.user){
        res.render('payment_complete',{
            user : req.user,
            title : "Payment Complete"
        });
    }else{
        res.render('payment_complete',{
            title : "Payment Complete"
        });
    }
});

// Exports
module.exports = router;


