const express = require('express');
const router = express.Router();
const {
    createOrder,
    createCustomOrder,
    handlePaymentSuccess,
    handlePaymentFailure,
    getUserOrders,
    getAllOrders,
    getCreditPackages,
    exportOrders
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.get('/packages', getCreditPackages);

// PayU callback routes (must accept POST with URL-encoded body)
router.post('/payment/success', express.urlencoded({ extended: true }), handlePaymentSuccess);
router.post('/payment/failure', express.urlencoded({ extended: true }), handlePaymentFailure);

// User routes
router.post('/create', protect, createOrder);
router.post('/create-custom', protect, createCustomOrder);
router.get('/', protect, getUserOrders);

// Admin routes
router.get('/all', protect, admin, getAllOrders);
router.get('/export', protect, admin, exportOrders);

module.exports = router;
