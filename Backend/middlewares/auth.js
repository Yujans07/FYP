// middlewares/auth.js
const User = require('../models/user');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('./catchAsyncErrors');
const jwt = require('jsonwebtoken');

// Check if user is authenticated or not
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(new ErrorHandler('Login first to access this resource.', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Add debug logging
        console.log(`Looking for user with ID: ${decoded.id}`);
        
        const user = await User.findById(decoded.id);
        
        if (!user) {
            // Clear the invalid cookie
            res.cookie('token', null, {
                expires: new Date(Date.now()),
                httpOnly: true
            });
            
            return next(new ErrorHandler('User no longer exists. Please login again.', 401));
        }
        
        req.user = user;
        next();
    } catch (error) {
        // If token is invalid or expired
        console.error('JWT verification error:', error.message);
        
        // Clear the invalid cookie
        res.cookie('token', null, {
            expires: new Date(Date.now()),
            httpOnly: true
        });
        
        return next(new ErrorHandler('Invalid token. Please login again.', 401));
    }
});

// Handling user roles
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // Add debugging
        console.log("User role:", req.user.role);
        console.log("Authorized roles:", roles);
        
        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorHandler(`Role (${req.user.role}) is not allowed to access this resource`, 403)
            );
        }
        next();
    };
};
