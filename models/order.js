let mongoose = require('mongoose');

// Order Schema
let OrderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    cart: {
        type: Object,
        required: true
    },
    total:{
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    shipping: {
        country: String,
        address: String,
        city: String,
        number: Number,
        email: String,
        postalCode: String
    },
    payment: {
        paymentMethod: String,
        payerId: String,
        paymentId: String,
        reference: String,
        transactionId: String,
        discount: String
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false
    },
    paidAt:Date,
    isDelivered: {
        type: Boolean,
        required: true,
        default: false
    }

});

let Order = module.exports = mongoose.model('Order', OrderSchema);
