require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const config = require('./config/database')
const session = require('express-session')
const expressValidator = require('express-validator');
const fileUpload = require('express-fileupload');
const passport = require('passport');


//conect to database
main().catch(err => console.log(err));

async function main() {
  if (process.env.NODE_ENV === "development") {
    await mongoose.connect(config.database)
    console.log('Connected to MongoDB local')
  } else {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true
    })

    console.log('Connected to MongoDB atlas')
  }
}
  


//init app
let app = express();

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//set public folder
//app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));


//set global errors variable
app.locals.errors = null;

// Get Page Model
let Page = require('./models/page');

// Get all pages to pass to header.ejs
Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
    if (err) {
        console.log(err);
    } else {
        app.locals.pages = pages;
    }
});

// Get Category Model
let Category = require('./models/category');

// Get all categories to pass to header.ejs
Category.find(function (err, categories) {
    if (err) {
        console.log(err);
    } else {
        app.locals.categories = categories;
    }
});

// Express fileUpload middleware
app.use(fileUpload());

//body parser middleware
app.use(express.urlencoded({ extended: false}))
app.use(express.json());

// Express Session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
  //  cookie: { secure: true }
}));

// Express Validator middleware
app.use(expressValidator({
  errorFormatter: function (param, msg, value) {
    let namespace = param.split('.'),
      root = namespace.shift(),
      formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  },
  customValidators: {
    isImage: function (value, filename) {
      let extension = (path.extname(filename)).toLowerCase();
      switch (extension) {
        case '.jpg':
          return '.jpg';
        case '.jpeg':
          return '.jpeg';
        case '.png':
          return '.png';
        case '':
          return '.jpg';
        default:
          return false;
      }
    }
  }
}));


//Express Messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Passport Config
require('./config/passport')(passport);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req,res,next) {
  res.locals.cart = req.session.cart;
  res.locals.user = req.user || null;
  next();
});

// Set routes 
const pages = require('./routes/pages.js');
const products = require('./routes/products.js');
const cart = require('./routes/cart.js');
const users = require('./routes/users.js');
const adminPages = require('./routes/admin_pages.js');
const adminCategories = require('./routes/admin_categories.js');
const adminProducts = require('./routes/admin_products.js');

app.use('/admin/pages', adminPages);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);
app.use('/products', products);
app.use('/cart', cart);
app.use('/users', users);
app.use('/', pages);

app.use(function (req, res) {
  res.status(404);
  res.render('404');
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

//start the server
let PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log('App is running on http://localhost:' + PORT);
});
``