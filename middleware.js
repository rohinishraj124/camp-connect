const { campgroundSchema, reviewSchema } = require('./Schemas.js');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground.js');
const Review = require('./models/review.js');

// Middleware for checking if the user is logged in
const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl; // Store the URL to return to after login
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

// Middleware for storing returnTo URL after login
const storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo; // Store returnTo in locals for later use
        delete req.session.returnTo; // Clear returnTo after storing it
    }
    next();
};

// Middleware for checking if the user is the author of the campground
const isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

// Middleware for validating campground data
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// Middleware for validating review data
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body.Review); // Adjust this line
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    next();
}

// Middleware for checking if the user is the author of the review
const isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

// Export all middleware in a single object
module.exports = { 
    isLoggedIn, 
    storeReturnTo, 
    isAuthor, 
    validateCampground, 
    validateReview, 
    isReviewAuthor 
};
