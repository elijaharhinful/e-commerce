const express = require('express');
const router = express.Router();

// Get Page model
let Page = require('../models/page');

// Get Product model
const Product = require('../models/product');

// Get Category model
const Category = require('../models/category');

// Get Users model
let User = require('../models/user');

/*
 * GET /
 */
router.get('/', function (req, res) {

    Page.findOne({
        slug: 'home'
    }, function (err, page) {
        if (err)
            console.log(err);
        Product.find(function (err, products) {
            if (err)
                console.log(err);

            res.render('index', {
                title: page.title,
                content: page.content,
                products: products
            });
        });
    });

});

/*
 * GET a page
 */
router.get('/:slug', function (req, res) {

    let slug = req.params.slug;

    Page.findOne({
        slug: slug
    }, function (err, page) {
        if (err)
            console.log(err);

        if (!page) {
            res.redirect('/');
        } else {
            res.render('created_page', {
                title: page.title,
                content: page.content
            });
        }
    });


});

// Exports
module.exports = router;