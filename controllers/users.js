// controllers/users.js
const User = require('../models/user'); // Ensure this path is correct
const catchAsync = require('../utils/catchAsync'); // Ensure this path is correct


module.exports.renderRegister = (req, res) => {
    res.render('users/register');
};

module.exports.register = catchAsync(async (req, res, next) => {
    console.log("Registering user:", req.body);
    const { email, username, password } = req.body;

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        console.log("Email already exists:", email);
        req.flash('error', 'Email is already registered.');
        return res.redirect('/register');
    }

    try {
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        console.log("User registered:", registeredUser);

        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        });
    } catch (err) {
        console.error("Registration error:", err);
        req.flash('error', 'Registration failed.');
        res.redirect('/register');
    }
});



module.exports.renderLogin = (req, res) => {
    res.render('users/login');
};

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = res.locals.returnTo || '/campgrounds'; // Redirect to returnTo or default
    res.redirect(redirectUrl);
};
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            console.error("Logout error:", err);
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/');
    });
};
