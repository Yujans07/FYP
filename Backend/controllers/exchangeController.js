const Exchange = require('../models/exchange');
const Product = require('../models/product');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const cloudinary = require('cloudinary');
const sendEmail = require('../utils/sendEmail');

// Create a new exchange request => /api/v1/exchange/new
exports.createExchangeRequest = catchAsyncErrors(async (req, res, next) => {
    const { desiredProductId, exchangeProduct, additionalPayment } = req.body;

    // Upload images to cloudinary
    let imagesLinks = [];
    
    if (req.body.images) {
        for (let i = 0; i < req.body.images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(req.body.images[i], {
                folder: 'exchanges'
            });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url
            });
        }
    }

    const exchangeRequest = await Exchange.create({
        user: req.user._id,
        desiredProduct: desiredProductId,
        exchangeProduct: {
            ...exchangeProduct,
            images: imagesLinks
        },
        additionalPayment
    });

    res.status(201).json({
        success: true,
        exchangeRequest
    });
});

// Get all exchange requests (admin) => /api/v1/admin/exchanges
exports.getAllExchangeRequests = catchAsyncErrors(async (req, res, next) => {
    const exchanges = await Exchange.find()
        .populate('user', 'name email')
        .populate('desiredProduct', 'name price');

    res.status(200).json({
        success: true,
        exchanges
    });
});

// Get user's exchange requests => /api/v1/exchanges/me
exports.myExchangeRequests = catchAsyncErrors(async (req, res, next) => {
    const exchanges = await Exchange.find({ user: req.user._id })
        .populate('desiredProduct', 'name price images');

    res.status(200).json({
        success: true,
        exchanges
    });
});

// Update exchange request status (admin) => /api/v1/admin/exchange/:id
exports.updateExchangeStatus = catchAsyncErrors(async (req, res, next) => {
    const exchange = await Exchange.findById(req.params.id)
        .populate('user', 'name email')
        .populate('desiredProduct', 'name');

    if (!exchange) {
        return next(new ErrorHandler('Exchange request not found', 404));
    }

    if (exchange.status === 'Completed') {
        return next(new ErrorHandler('You cannot update a completed exchange', 400));
    }

    const oldStatus = exchange.status;
    exchange.status = req.body.status;

    await exchange.save();

    // Send email notification based on the status
    let emailSubject = '';
    let emailMessage = '';

    if (req.body.status === 'Approved') {
        emailSubject = 'Your Exchange Request has been Approved!';
        emailMessage = `
            <h1>Exchange Request Approved</h1>
            <p>Dear ${exchange.user.name},</p>
            <p>Great news! Your exchange request for ${exchange.desiredProduct.name} has been approved.</p>
            <p>Exchange Details:</p>
            <ul>
                <li>Your Device: ${exchange.exchangeProduct.name}</li>
                <li>Desired Product: ${exchange.desiredProduct.name}</li>
                <li>Additional Payment: $${exchange.additionalPayment}</li>
            </ul>
            <p>Please visit our store with your device to complete the exchange process.</p>
            <p>Best regards,<br>Mobile Hub Team</p>
        `;
    } else if (req.body.status === 'Rejected') {
        emailSubject = 'Your Exchange Request Status Update';
        emailMessage = `
            <h1>Exchange Request Update</h1>
            <p>Dear ${exchange.user.name},</p>
            <p>We regret to inform you that your exchange request for ${exchange.desiredProduct.name} has been rejected.</p>
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p>Best regards,<br>Mobile Hub Team</p>
        `;
    }

    if (emailSubject && emailMessage) {
        try {
            await sendEmail({
                email: exchange.user.email,
                subject: emailSubject,
                message: emailMessage
            });
        } catch (error) {
            console.error('Error sending email:', error);
            // Don't throw error, just log it - the status update was successful
        }
    }

    res.status(200).json({
        success: true,
        exchange
    });
});

// Delete exchange request => /api/v1/exchange/:id
exports.deleteExchangeRequest = catchAsyncErrors(async (req, res, next) => {
    const exchange = await Exchange.findById(req.params.id);

    if (!exchange) {
        return next(new ErrorHandler('Exchange request not found', 404));
    }

    // Check if the user is the owner of the exchange request or an admin
    if (exchange.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new ErrorHandler('You are not authorized to delete this exchange request', 403));
    }

    // Delete images from cloudinary
    for (let i = 0; i < exchange.exchangeProduct.images.length; i++) {
        await cloudinary.v2.uploader.destroy(exchange.exchangeProduct.images[i].public_id);
    }

    await exchange.remove();

    res.status(200).json({
        success: true,
        message: 'Exchange request deleted successfully'
    });
}); 