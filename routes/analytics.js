const express = require('express');
const router = express.Router();
const auth = require('../config/auth');
const isAdmin = auth.isAdmin;

// Get Page model
let Page = require('../models/page');
// Get Order model
let Order = require('../models/order');
// Get Analytics model
let Analytics = require('../models/analytics');
// Get Requests Model
let RequestLog = require('../models/request');


(async () => {
    let getTotalRequests = RequestLog.count();
    let getStatsPerRoute = RequestLog.aggregate([
        {
            $group: {
                _id: { url: '$url', method: '$method' },
                responseTime: { $avg: '$response_time' },
                numberOfRequests: { $sum: 1 },
            }
        }
    ]);

    let getRequestsPerDay = RequestLog.aggregate([
        {
            $group: {
                _id: '$day',
                numberOfRequests: { $sum: 1 }
            }
        },
        { $sort: { numberOfRequests: 1 } }
    ]);

    let getRequestsPerHour = RequestLog.aggregate([
        {
            $group: {
                _id: '$hour',
                numberOfRequests: { $sum: 1 }
            }
        },
        { $sort: { numberOfRequests: 1 } }
    ]);

    let getAverageResponseTime = RequestLog.aggregate([
        {
            $group: {
                _id: null,
                averageResponseTime: { $avg: '$responseTime' }
            }
        }
    ]);

    const results = await Promise.all([
        getAverageResponseTime,
        getStatsPerRoute,
        getRequestsPerDay,
        getRequestsPerHour,
        getTotalRequests
    ]);
    return {
        averageResponseTime: results[0][0].averageResponseTime,
        statsPerRoute: results[1],
        requestsPerDay: results[2],
        requestsPerHour: results[3],
        totalRequests: results[4],
    };

})()
 
 


// Exports
module.exports = router;