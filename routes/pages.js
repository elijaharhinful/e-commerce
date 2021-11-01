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

            let perPage = 12;
            let pageNumber = (req.query.page == null) ? 1 : req.query.page;
            let startFrom = (pageNumber - 1) * perPage;
        
            Product
                .find({})
                .skip(startFrom)
                .limit(perPage)
                .exec(function (err, products) {
                    Product.count().exec(function (err, count) {
                        if (err) console.log(err);
                        let pagesNeeded = Math.ceil(count / perPage);
                        
                        res.render('index', {
                            title: page.title,
                            content: page.content,
                            products: products,
                            pageNumber: pageNumber,
                            pagesNeeded: pagesNeeded
                        });
                    })
                })
        // Product.find(function (err, products) {
        //     if (err)
        //         console.log(err);

        //     res.render('index', {
        //         title: page.title,
        //         content: page.content,
        //         products: products
        //     });
        // });
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
