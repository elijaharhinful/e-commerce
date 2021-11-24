let mongoose = require('mongoose');

// Analytics Schema
let AnalyticsSchema = mongoose.Schema({

    title: {
        type: String
    },
    count: {
        type: Number
    }

});

let Analytics = module.exports = mongoose.model('Analytics', AnalyticsSchema);
