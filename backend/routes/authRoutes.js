const express = require('express');
const router = express.Router();
const passport = require('passport');
const { googleCallback, adminLogin } = require('../controllers/authController');

// @desc    Auth with Google
// @route   GET /api/auth/google
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'  // Always show account picker
}));

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    googleCallback
);

// @desc    Admin login with email
// @route   POST /api/auth/admin/login
router.post('/admin/login', adminLogin);

module.exports = router;
