const mongoose = require('mongoose');

const exchangeRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    desiredProduct: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true
    },
    exchangeProduct: {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        condition: {
            type: String,
            required: true,
            enum: ['Like New', 'Good', 'Fair', 'Poor']
        },
        images: [{
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }],
        originalPurchaseDate: {
            type: Date,
            required: true
        }
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
        default: 'Pending'
    },
    additionalPayment: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Exchange', exchangeRequestSchema); 