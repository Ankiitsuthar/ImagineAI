const express = require('express');
const router = express.Router();
const {
    submitContactForm,
    getAllContactSubmissions,
    updateContactStatus
} = require('../controllers/contactController');
const { protect, admin } = require('../middleware/auth');

// Public route
router.post('/', submitContactForm);

// Admin routes
router.get('/all', protect, admin, getAllContactSubmissions);
router.put('/:id/status', protect, admin, updateContactStatus);

module.exports = router;
