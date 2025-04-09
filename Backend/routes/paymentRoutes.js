const express = require('express');
const { processKhaltiPayment, checkKhaltiPaymentStatus } = require('../controllers/paymentController');
const { isAuthenticatedUser } = require('../middlewares/auth');

const router = express.Router();

// Khalti payment routes
router.post('/khalti/process', isAuthenticatedUser, processKhaltiPayment);
router.get('/khalti/status/:orderId', isAuthenticatedUser, checkKhaltiPaymentStatus);

module.exports = router; 