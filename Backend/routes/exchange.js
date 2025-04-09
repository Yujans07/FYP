const express = require('express');
const router = express.Router();

const {
    createExchangeRequest,
    getAllExchangeRequests,
    myExchangeRequests,
    updateExchangeStatus,
    deleteExchangeRequest
} = require('../controllers/exchangeController');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// User routes
router.route('/exchange/new').post(isAuthenticatedUser, createExchangeRequest);
router.route('/exchanges/me').get(isAuthenticatedUser, myExchangeRequests);
router.route('/exchange/:id').delete(isAuthenticatedUser, deleteExchangeRequest);

// Admin routes
router.route('/admin/exchanges').get(isAuthenticatedUser, authorizeRoles('admin'), getAllExchangeRequests);
router.route('/admin/exchange/:id').put(isAuthenticatedUser, authorizeRoles('admin'), updateExchangeStatus);

module.exports = router; 