require('dotenv').config();
const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Get Users model
let User = require('../models/user');

// Get Tokens model
let Token = require('../models/token');

/*
 * GET register
 */
router.get('/register', function (req, res) {

    res.render('register', {
        title: 'Register'
    });

});

/*
 * POST register
 */
router.post('/register', function (req, res) {

    let name = req.body.name;
    let email = req.body.email;
    let username = req.body.username;
    let password = req.body.password;
    let password2 = req.body.password2;

    req.checkBody('name', 'Name is required!').notEmpty();
    req.checkBody('email', 'Email is required!').isEmail();
    req.checkBody('username', 'Username is required!').notEmpty();
    req.checkBody('password', 'Password is required!').notEmpty();
    req.checkBody('password2', 'Passwords do not match!').equals(password);

    let errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors: errors,
            user: null,
            title: 'Register'
        });
    } else {
        User.findOne({
            username: username
        }, function (err, user) {
            if (err)
                console.log(err);

            if (user) {
                req.flash('danger', 'Username exists, choose another!');
                res.redirect('/users/register');
            } else {
                let user = new User({
                    name: name,
                    email: email,
                    username: username,
                    password: password,
                    admin: 0
                });

                bcrypt.genSalt(10, function (err, salt) {
                    bcrypt.hash(user.password, salt, function (err, hash) {
                        if (err)
                            console.log(err);

                        user.password = hash;

                        user.save(function (err) {
                            if (err) {
                                console.log(err);
                            } else {
                                crypto.randomBytes(16, function (err, buf) {

                                    if (err) console.log(err);

                                    let token = new Token({
                                        _userId: user.id,
                                        token: buf.toString('hex')
                                    });

                                    token.save(function (err) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            async function main() {
                                                //let testAccount = await nodemailer.createTestAccount();

                                            // create reusable transporter object using the default SMTP transport
                                            let transporter = nodemailer.createTransport({
                                                service: 'gmail',
                                                auth: {
                                                    type: 'OAuth2',
                                                    user: process.env.MAIL_USERNAME, // generated ethereal user
                                                    pass: process.env.MAIL_PASSWORD,
                                                    clientId: process.env.CLIENT_ID,
                                                    clientSecret: process.env.CLIENT_SECRET,
                                                    refreshToken: process.env.REFRESH_TOKEN
                                                },
                                            });

                                            // send mail with defined transport object
                                            let info = await transporter.sendMail({
                                                from: '"My Website 👻"elijaharhinful8@gmail.com', // sender address
                                                to: user.email, // list of receiver (s)
                                                subject: "Verify your My Website email", // Subject line
                                                text: 'Hello ' + user.username + ',\n\n' +

                                                    'Thanks for signing up with My Website! Before you get started, we need you to confirm your email address. Please click the link below to complete your signup.\n\n' +
                                                    'http://' + req.headers.host + '/users/confirm-email/' + token.token + '\n\n' +

                                                    'If you have any trouble clicking the link, please copy and paste the URL into your prefered web browser.\n\n' +

                                                    'If you did not request this, please ignore this email.\n' // html body
                                            });

                                            // console.log("Message sent: %s", info.messageId);
                                            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

                                            // Preview only available when sending through an Ethereal account
                                            // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
                                            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
                                            
                                            
                                            req.flash('info', 'A verification e-mail has been sent to ' + user.email + ' with further instructions.');
                                            res.redirect('/users/register-token')
                                            }
                                            main().catch(console.error);
                                            
                                        }
                                    });
                                    
                                });
                            }
                        });
                    });
                });
            }
        });
    }

});

/*
 * GET Register token page
 */
router.get('/register-token', function(req,res) {
    res.render('register-token',{
        title: 'Verify Account'
    })
})

/*
 * GET confirm email
 */
router.get('/confirm-email', function(req,res) {
    res.render('confirm-email',{
        title: 'Confirm email'
    })
})

/*
 * GET confirm email token
 */
router.get('/confirm-email/:token', function (req, res) {
    Token.findOne({
        token: req.params.token
    }, function (err, token) {
        if (err) console.log(err);

        if (!token) {
            req.flash('danger', 'Token is invalid or may have expired!');
            res.redirect('/users/login');
        } else {
            if (token) {
                User.findById(token._userId, function (err, user) {
                    if (err) console.log(err);

                    if (!user) {
                        req.flash('danger', 'We are unable to find a user for this token!');
                        res.redirect('/users/register');
                    } else if (user.isVerified) {
                        req.flash('danger', 'This user has already been verified. Please login to continue!');
                        res.redirect('/users/login');
                    } else {
                        user.isVerified = true;
                        user.save(function (err) {
                            if (err) console.log(err);

                            req.flash('success', 'This account has been verified. Please login to continue!');
                            res.redirect('/users/confirm-email');
                        })
                    }
                })
            }
        }


    })
});

/*
 * GET token resend for registration confirmation
 */
router.get('/token-resend', function (req, res) {
    res.render('token-resend',{
        title: 'Token Resend'
    })
});

/*
 * POST token resend for registration
 */
router.post('/token-resend', function (req, res) {
    let email = req.body.email;
    
   req.checkBody('email', 'Email is not valid!').isEmail();
   req.checkBody('email', 'Email is required!').notEmpty();
   
    let errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors: errors,
            user: null,
            title: 'token-resend'
        });
    } else {
        User.findOne({email : email}, function (err, user) {

            if (err) console.log(err);

            if (!user){
                req.flash('danger','We are unable to find a user with this email!');
                res.redirect('/users/register');
            } else if (user.isVerified){
                req.flash('danger','This user has already been verified. Please login to continue!');
                res.redirect('/users/login');
            } else{
                crypto.randomBytes(16, function (err, buf) {

                    if (err) console.log(err);

                    let token = new Token({
                        _userId: user.id,
                        token: buf.toString('hex')
                    });

                    token.save(function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            async function main() {
                                //let testAccount = await nodemailer.createTestAccount();

                            // create reusable transporter object using the default SMTP transport
                            let transporter = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {
                                    type: 'OAuth2',
                                    user: process.env.MAIL_USERNAME, // generated ethereal user
                                    pass: process.env.MAIL_PASSWORD,
                                    clientId: process.env.CLIENT_ID,
                                    clientSecret: process.env.CLIENT_SECRET,
                                    refreshToken: process.env.REFRESH_TOKEN
                                },
                            });

                            // send mail with defined transport object
                            let info = await transporter.sendMail({
                                from: '"My Website 👻" elijaharhinful8@gmail.com', // sender address
                                to: user.email, // list of receiver (s)
                                subject: "Verify your My Website email", // Subject line
                                text: 'Hello ' + user.username + ',\n\n' +

                                    'Thanks for signing up with My Website! Before you get started, we need you to confirm your email address. Please click the link below to complete your signup.\n\n' +
                                    'http://' + req.headers.host + '/users/confirm-email/' + token.token + '\n\n' +

                                    'If you have any trouble clicking the link, please copy and paste the URL into your prefered web browser.\n\n' +

                                    'If you did not request this, please ignore this email.\n' // html body
                            });

                            // console.log("Message sent: %s", info.messageId);
                            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

                            // Preview only available when sending through an Ethereal account
                            // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
                            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
                            
                            
                            req.flash('info', 'A verification e-mail has been sent to ' + user.email + ' with further instructions.');
                            res.redirect('/users/register-token')
                            }
                            main().catch(console.error);
                            
                        }
                    });
                    
                });
            }
        })
    }
   
});

/*
 * GET login
 */
router.get('/login', function (req, res) {

    if (res.locals.user) res.redirect('/');

    res.render('login', {
        title: 'Log in'
    });

});

/*
 * POST login
 */
router.post('/login', function (req, res, next) {

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        isVerified: '/users/login',
        failureFlash: true
    })(req, res, next);

});

/*
 * GET logout
 */
router.get('/logout', function (req, res) {

    req.logout();

    req.flash('success', 'You are logged out!');
    res.redirect('/users/login');

});

/*
 * GET forgot password
 */
router.get('/forgot', function (req, res) {

    res.render('forgot', {
        title: 'Forgot Password'
    });

});

/*
 * POST forgot password
 */
router.post('/forgot', function (req, res) {
    let email = req.body.email;

    req.checkBody('email', 'Email is required!').isEmail();

    let errors = req.validationErrors();

    if (errors) {
        res.render('forgot', {
            errors: errors,
            user: null,
            title: 'Forgot Password'
        });
    } else {

        User.findOne({
            email: email
        }, function (err, user) {
            if (err)
                console.log(err);

            if (!user) {
                req.flash('danger', 'Email does not exist, enter correct email!');
                res.redirect('/users/forgot');
            } else {
                
                crypto.randomBytes(3, function (err, buf) {
                    let token = buf.toString('hex');
                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 3600000; //one hour
                    user.save(function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            async function main() {
                                //let testAccount = await nodemailer.createTestAccount();

                            // create reusable transporter object using the default SMTP transport
                            let transporter = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {
                                    type: 'OAuth2',
                                    user: process.env.MAIL_USERNAME, // generated ethereal user
                                    pass: process.env.MAIL_PASSWORD,
                                    clientId: process.env.CLIENT_ID,
                                    clientSecret: process.env.CLIENT_SECRET,
                                    refreshToken: process.env.REFRESH_TOKEN
                                },
                            });

                            // send mail with defined transport object
                            let info = await transporter.sendMail({
                                from: '"My Website 👻"elijaharhinful8@gmail.com', // sender address
                                to: user.email, // list of receiver (s)
                                subject: "Verify your My Website email", // Subject line
                                text: 'Hello ' + user.username + ',\n\n' +

                                    'Please use the code below to reset your password.\n\n' +
                                     token + '\n\n' +
                                    'The code expirese in an hour. \n\n'+
                                    'If you did not request a password reset, please ignore this email and your password will be intact.\n' 
                            });

                            console.log("Message sent: %s", info.messageId);
                            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

                            // Preview only available when sending through an Ethereal account
                            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
                            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
                            
                            
                            req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                            res.render('token', {
                                title: "Token",
                                user: null,
                                user_id: user.id,
                                token: token
                            });
                            }
                            main().catch(console.error);
                        }
                    });
                });

            };
        });
    }

});


/*
 * GET forgot password resend
 */
router.get('/forgot-resend', function (req, res) {

    res.render('forgot_resend', {
        title: 'Forgot Password'
    });

});


/*
 * POST forgot-resend password reset token
 */
router.post('/forgot-resend', function (req, res) {
    let email = req.body.email;

    req.checkBody('email', 'Email is required!').isEmail();

    let errors = req.validationErrors();

    if (errors) {
        res.render('forgot_resend', {
            errors: errors,
            user: null,
            title: 'Resend Password Token'
        });
    } else {
        User.findOne({
            email: email
        }, function (err, user) {
            if (err)
                console.log(err);

            if (!user) {
                req.flash('danger', 'Email does not exist, enter correct email!');
                res.redirect('/users/forgot_resend');
            } else {
                
                crypto.randomBytes(3, function (err, buf) {
                    let token = buf.toString('hex');
                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 3600000; //one hour
                    user.save(function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            async function main() {
                                //let testAccount = await nodemailer.createTestAccount();

                            // create reusable transporter object using the default SMTP transport
                            let transporter = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {
                                    type: 'OAuth2',
                                    user: process.env.MAIL_USERNAME, // generated ethereal user
                                    pass: process.env.MAIL_PASSWORD,
                                    clientId: process.env.CLIENT_ID,
                                    clientSecret: process.env.CLIENT_SECRET,
                                    refreshToken: process.env.REFRESH_TOKEN
                                },
                            });

                            // send mail with defined transport object
                            let info = await transporter.sendMail({
                                from: '"My Website 👻"elijaharhinful8@gmail.com', // sender address
                                to: user.email, // list of receiver (s)
                                subject: "Verify your My Website email", // Subject line
                                text: 'Hello ' + user.username + ',\n\n' +

                                    'Please use the code below to reset your password.\n\n' +
                                     token + '\n\n' +
                                    'The code expirese in an hour. \n\n'+
                                    'If you did not request a password reset, please ignore this email and your password will be intact.\n' 
                            });

                            // console.log("Message sent: %s", info.messageId);
                            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

                            // Preview only available when sending through an Ethereal account
                            // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
                            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
                            
                            
                            req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                            res.render('token', {
                                title: "Token",
                                user: null,
                                user_id: user.id,
                                token: token
                            });
                            }
                            main().catch(console.error);
                        }
                    });
                });

            };
        });
    }

});



/*
 * GET token
 */
router.get('/token', function (req, res) {
    res.render('token', {
        title: 'Token'
    });

});

/*
 * POST token
 */
router.post('/token', function (req, res) {

    let token = req.body.token;

    req.checkBody('token', 'Token is required!').isString();

    let errors = req.validationErrors();

    if (errors) {
        User.findById(id, function (err, user) {
            if (err) console.log(err);
            console.log(user._id)
            res.render('reset', {
                errors: errors,
                user: null,
                title: 'Enter Token',
                user_id: user.id
            });
        });
    } else {
        User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: {
                $ne: Date.now()
            }
        }, function (err, user) {
            if (err)
                console.log(err);

            if (!user) {
                req.flash('danger', 'Token is invalid or has expired!');
                res.redirect('/users/token');
            } else {
                if (err)
                    console.log(err);

                req.flash('success', 'Token verified successfully! Reset your password now!');
                res.render('reset', {
                    title: "Reset Password",
                    user: null,
                    user_id: user.id
                });
            };
        });
    }

});

/*
 * GET reset password
 */
router.get('/reset', function (req, res) {

    res.render('reset', {
        title: 'Reset Password'
    });

});

/*
 * POST reset password
 */
router.post('/reset/:id', function (req, res) {

    let password = req.body.password;
    let password1 = req.body.password1;

    req.checkBody('password', 'Password is required!').notEmpty();
    req.checkBody('password1', 'Passwords do not match!').equals(password);

    let id = req.params.id;

    let errors = req.validationErrors();

    if (errors) {
        User.findById(id, function (err, user) {

            if (err) console.log(err);

            res.render('reset', {
                errors: errors,
                title: "Reset Token",
                user: null,
                user_id: user.id
            });
        })


    } else {
        User.findById(id, function (err, user) {
            if (user) {
                bcrypt.compare(password, user.password, function (err, isMatch) {
                    if (err) console.log(err)

                    if (isMatch) {
                        req.flash('danger', 'Password same as old one, use a new one or Login to continue!');
                        res.render('reset', {
                            title: "Password Reset",
                            user: null,
                            user_id: user.id
                        });
                    } else {
                        if (err) console.log(err);

                        bcrypt.genSalt(10, function (err, salt) {
                            bcrypt.hash(password, salt, function (err, hash) {
                                if (err)
                                    console.log(err);

                                user.password = hash;

                                user.save(function (err) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        req.flash('success', 'Password reset successful. Login to continue!');
                                        res.redirect('/users/login')
                                    }
                                });
                            });
                        });


                    }

                })
            }
        });
    }

});


/*
 * GET user profile details
 */
router.get('/:id', function (req, res) {
    if (!res.locals.user) res.redirect('/users/login');

    let userID = req.params.id;

    User.findById(userID,

        function (err, user) {
            if (err)
                console.log(err);

            res.render('profile', {
                title: "User Profile",
                user: user
            });
        });

});

/*
 * GET edit profile
 */
router.get('/edit_profile/:id', function (req, res) {

    if (!res.locals.user) res.redirect('/users/login');
    let userID = req.params.id;

    User.findById(userID,

        function (err, user) {
            if (err)
                console.log(err);

            res.render('edit_profile', {
                title: "Edit User Profile",
                user: user
            });
        });

});


/*
 * POST edit profile
 */
router.post('/edit_profile/:id', function (req, res) {
    let name = req.body.name;
    let email = req.body.email;
    let username = req.body.username;
    let number = req.body.number;
    let address = req.body.address;

    req.checkBody('name', 'Name is required!').notEmpty();
    req.checkBody('email', 'Email is required!').isEmail();
    req.checkBody('username', 'Username is required!').notEmpty();
    req.checkBody('number', 'Phone number is required!').notEmpty();
    req.checkBody('address', 'Billing Address is required!').notEmpty();


    email = email.replace(/\s+/g, '-').toLowerCase();

    let id = req.params.id;

    let errors = req.validationErrors();

    if (errors) {
        res.render('users/edit_profile/' + id, {
            errors: errors,
            title: "Edit Profile",
            id: id
        });
    } else {
        User.findOne({
            username: username,
            _id: {
                '$ne': id
            }
        }, function (err, user) {
            if (user) {
                req.flash('danger', 'Username exists, choose another.');
                res.render('users/edit_profile/' + id, {
                    title: "Edit Profile",
                    id: id
                });
            } else {

                User.findById(id, function (err, user) {
                    if (err)
                        return console.log(err);

                    user.name = name;
                    user.email = email;
                    user.username = username;
                    user.number = number;
                    user.address = address;

                    user.save(function (err) {
                        if (err)
                            return console.log(err);

                        User.find(function (err, user) {
                            if (err) {
                                console.log(err);
                            } else {
                                req.app.locals.user = user;
                            }
                        });


                        req.flash('success', 'Profile edited!');
                        res.redirect('/users/' + id);
                    });

                });


            }
        });
    }

});


/*
 * POST change password
 */
router.post('/password/:id', function (req, res) {

    let password = req.body.password;
    let password1 = req.body.password1;
    let password2 = req.body.password2;

    req.checkBody('password', 'Please enter your old password!').notEmpty();
    req.checkBody('password2', 'Passwords do not match!').equals(password1);

    let id = req.params.id;

    let errors = req.validationErrors();

    if (errors) {
        User.findById(id, function (err, user) {

            if (err) console.log(err);

            res.render('profile', {
                errors: errors,
                title: "Profile",
                user: user
            });
        })

    } else {
        User.findById(id, function (err, user) {
            if (user) {
                bcrypt.compare(password, user.password, function (err, isMatch) {
                    if (err) console.log(err);

                    if (isMatch) {
                        bcrypt.compare(password1, user.password, function (err, isMatch) {
                            if (err) console.log(err);

                            if (isMatch) {
                                req.flash('danger', 'New Password same as old one, use a new one!');
                                res.render('profile', {
                                    errors: errors,
                                    title: "Profile",
                                    user: user
                                });
                            } else {
                                if (err) console.log(err);

                                bcrypt.genSalt(10, function (err, salt) {
                                    bcrypt.hash(password1, salt, function (err, hash) {
                                        if (err)
                                            console.log(err);

                                        user.password = hash;

                                        user.save(function (err) {
                                            if (err) console.log(err);

                                            req.logout();

                                            req.flash('success', 'Password change successful. Login to continue!');
                                            res.redirect('/users/login')

                                        });
                                    });
                                });


                            }
                        })

                    } else {
                        if (err) console.log(err);

                        req.flash('danger', 'Old Password entered does not match your account. Please enter the correct one.');
                        res.render('edit_profile', {
                            errors: errors,
                            title: "Edit Profile",
                            user: user
                        });
                    }

                })
            }
        });
    }

});





// Exports
module.exports = router;
