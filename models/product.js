let mongoose = require('mongoose');

//review Schema
let reviewSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        default: 0
    },
    comment: {
        type: String,
        required: true
    },
    timeCreated: {
        type: Date,
        required: true,
        default: Date.now
    }
});

// Product Schema
let ProductSchema = mongoose.Schema({

    title: {
        type: String,
        required: true
    },
    slug: {
        type: String
    },
    desc: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    initialPrice : {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String
    },
    discount: {
        type: Number
    },
    rating: {
        type: Number,
        default: 0,
        required: true
    },
    numReviews: {
        type: Number,
        default: 0,
        required: true
    },
    reviews: [reviewSchema],
    quantity: {
        type: Number,
        required: true,
        default: 100
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        required: true,
        default: Date.now
    }

});

let Product = module.exports = mongoose.model('Product', ProductSchema);