let mongoose = require('mongoose');

// Requests Schema
let RequestLogSchema = mongoose.Schema({
    RequestLog: {
        url: String,
        method: String,
        responseTime: Number,
        day: String,
        hour: Number
    }

});

let RequestLog = module.exports = mongoose.model('RequestLog', RequestLogSchema);
