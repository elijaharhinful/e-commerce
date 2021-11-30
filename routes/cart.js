const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const router = express.Router();



// Get Product model
const Product = require('../models/product');

// Get Page model
let Coupon = require('../models/coupon');

// Get Order model
let Order = require('../models/order');


/*
 * GET add product to cart
 */
router.get('/add/:product', function (req, res) {

    let slug = req.params.product;

    Product.findOne({
        slug: slug
    }, function (err, p) {
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
 * GET update products in cart
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
 * GET checkout page
 */
router.get('/checkout', function (req, res) {

    if (req.session.cart && req.session.cart.length == 0) {
        delete req.session.cart;
        res.redirect('/cart/checkout');
    } else {
        res.render('checkout', {
            title: 'Checkout',
            cart: req.session.cart,
            coupon: {
                title: null,
                discount: null
            }
        });
    }

});

/*
 * POST coupon code form
 */
router.post('/coupon', function (req, res) {
    let coupon = req.body.coupon;

    Coupon.findOne({
        title: coupon
    }, function (err, coupon) {
        if (coupon) {
            req.flash('success', 'Coupon applied successfully! You will receive ' + coupon.discount + '% off your purchase when you place your order!');
            res.render('checkout', {
                title: 'Checkout',
                user: req.user,
                cart: req.session.cart,
                coupon: coupon
            });
        } else {
            req.flash('danger', 'This coupon is not valid!');
            res.render('checkout', {
                title: 'Checkout',
                user: req.user,
                cart: req.session.cart,
                coupon: {
                    title: null,
                    discount: null
                }
            });
        }
    });

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
            Authorization: 'Bearer ' + process.env.PAYSTACK_SECRET_KEY,
            'Content-Type': 'application/json'
        }
    }
    // this is to create an incomplete order. 
    // Move this to the paymwnt-complete GET request and change isPaid to true to make a complete order and also add transaction date to paidAt
    let order = new Order({
        user: req.user,
        cart: req.session.cart,
        total: req.body.total,
        name: req.body.firstname + " " + req.body.lastname,
        shipping: {
            country: req.body.country,
            address: req.body.address,
            city: req.body.city,
            number: req.body.phone,
            email: req.body.email,
            postalCode: req.body.city
        },
        payment: {
            paymentMethod: 'mobile_money',
            payerId: 12345,
            paymentId: new_ref,
            reference: ref,
            discount: req.body.discount
        }
    });
    order.save(function (err) {
        if (err) throw err;
    })


    if (typeof req.session.ref == "undefined") {
        req.session.ref = [];
        req.session.ref.push({
            ref: new_ref
        });
    } else {
        req.session.ref.push({
            ref: new_ref
        });
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
 * GET payment complete page
 */
// router.get('/payment-complete', async function (req, res) {
//     if (err) console.log(err);
//     res.render('payment_complete', {
//         title: "Payment Complete"
//     });
// });
/*
 * GET payment complete page
 */

router.get('/payment-complete', async function (req, res) {
    console.log(req.query)

let config = {
        port: 443,
        headers: {
            Authorization: 'Bearer ' + process.env.PAYSTACK_SECRET_KEY
        },
        params:{reference: req.query.reference}
    }

    if (res.locals.user){
        await axios.get('https://api.paystack.co/transaction/verify/${ref}',config)
        .then(function (response) {
            console.log(response.data)
            res.render('payment_complete',{
                user : req.user,
                title : "Payment Complete"
            });
            // res.redirect(response.data.data.authorization_url)
        })
        .catch(function (error) {
            console.log(error);
        });
        
    }else{
        res.render('payment_complete',{
            title : "Payment Complete"
        });
    }
});

// Exports
module.exports = router;
