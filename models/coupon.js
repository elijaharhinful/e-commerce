let mongoose = require('mongoose');

// Coupon Schema
let CouponSchema = mongoose.Schema({
   
    title: {
        type: String,
        min: 5,
        max: 15,
        required: true
    },
    productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    discount: {
        type: String,
        required: true,
        default: 0
    },
    status: {
        type: Boolean,
        required: true
    },
    originalPrice:{
        type: Number,
    },
    finalPrice:{
        type: Number,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    expirationTime: {
        type: String,
        required: true
    }
    
});

let Coupon = module.exports = mongoose.model('Coupon', CouponSchema);

