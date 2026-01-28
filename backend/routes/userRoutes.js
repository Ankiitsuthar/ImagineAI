const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    updateUserProfile,
    getAllUsers,
    getUserById,
    updateUserCredits,
    toggleUserStatus,
    updateUser
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

// User routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// Admin routes
router.get('/', protect, admin, getAllUsers);
router.get('/:id', protect, admin, getUserById);
router.put('/:id', protect, admin, updateUser);
router.put('/:id/credits', protect, admin, updateUserCredits);
router.put('/:id/toggle-status', protect, admin, toggleUserStatus);

module.exports = router;
