const express = require('express');
const router = express.Router();
const { getDashboardStats, getRevenueAnalytics } = require('../controllers/statsController');
const { protect, admin } = require('../middleware/auth');

// @desc    Get admin dashboard statistics
// @route   GET /api/stats/dashboard
// @access  Private/Admin
router.get('/dashboard', protect, admin, getDashboardStats);

// @desc    Get revenue analytics
// @route   GET /api/stats/revenue
// @access  Private/Admin
router.get('/revenue', protect, admin, getRevenueAnalytics);

module.exports = router;
