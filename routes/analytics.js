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




// Exports
module.exports = router;