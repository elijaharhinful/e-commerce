const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const auth = require('../config/auth');
const isUser = auth.isUser;

// Get Product model
const Product = require('../models/product');

// Get Category model
const Category = require('../models/category');

/*
 * GET all products
 */
router.get('/', function (req, res) {

    Product.find(function (err, products) {
        if (err)
            console.log(err);

        res.render('all_products', {
            title: 'All products',
            products: products
        });
    });

});


/*
 * GET products by category
 */
router.get('/:category', function (req, res) {

    let categorySlug = req.params.category;

    Category.findOne({
        slug: categorySlug
    }, function (err, c) {
        Product.find({
            category: categorySlug
        }, function (err, products) {
            if (err)
                console.log(err);

            res.render('cat_products', {
                title: c.title,
                products: products
            });
        });
    });

});

/*
 * GET product details
 */
router.get('/:category/:product', function (req, res) {

    let galleryImages = null;
    let tab_href_array = [];
    let tab_id_array = [];
    let loggedIn = (req.isAuthenticated()) ? true : false;

    Product.findOne({
        slug: req.params.product
    }, function (err, product) {
        if (err) {
            console.log(err);
        } else {

            let categorySlug = req.params.category;

            Category.findOne({
                slug: categorySlug
            }, function (err, c) {
                Product.find({
                    category: categorySlug
                }, function (err, products) {
                    if (err)
                        console.log(err);

                    let galleryDir = 'public/product_images/' + product._id + '/gallery';
                    fs.readdir(galleryDir, function (err, files) {
                        if (err) {
                            console.log(err);
                        } else {
                            galleryImages = files;

                            for (let i = 0; i < galleryImages.length; i++) {
                                if (galleryImages[i] == "thumbs") {
                                    continue;
                                }

                                let tab_href = "";
                                let tab_increment = i + 1
                                tab_href = "#tabs-" + tab_increment.toString()
                                tab_id = "tabs-" + tab_increment.toString()
                                tab_href_array.push(tab_href);
                                tab_id_array.push(tab_id);

                            }

                            res.render('product', {
                                title: product.title,
                                p: product,
                                galleryImages: galleryImages,
                                tab_href_array: tab_href_array,
                                tab_id_array: tab_id_array,
                                loggedIn: loggedIn,
                                c_title: c.title,
                                products: products
                            });
                        }
                    });
                });
            });



        }
    });

});

// Exports
module.exports = router;
