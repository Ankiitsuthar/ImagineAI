const express = require('express');
const router = express.Router();
const {
    createOrder,
    handleWebhook,
    getUserOrders,
    getAllOrders,
    getCreditPackages
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.get('/packages', getCreditPackages);

// Webhook route (raw body needed for Stripe signature verification)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// User routes
router.post('/create', protect, createOrder);
router.get('/', protect, getUserOrders);

// Admin routes
router.get('/all', protect, admin, getAllOrders);

module.exports = router;
