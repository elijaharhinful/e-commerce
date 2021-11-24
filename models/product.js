let mongoose = require('mongoose');

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
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        review: String
    }],
    ratings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        rating: String
    }],
    quantity: {
        type: Number,
        required: true
    },
    discount: {
        type: Number
    },createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },createdAt: {
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

