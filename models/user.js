let mongoose = require('mongoose');

// User Schema
let UserSchema = mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    number: {
        type: Number
    },
    address: {
        type: String
    },
    admin: {
        type: Boolean,
        required:true,
        default: false
    },
    date :{
        type : Date,
        default : Date.now
    },
    isVerified : {
        type: Boolean,
        default : false
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

let User = module.exports = mongoose.model('User', UserSchema);
