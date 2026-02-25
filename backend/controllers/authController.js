const { generateToken } = require('../middleware/auth');
const User = require('../models/User');

// @desc    Handle Google Auth Callback
// @route   GET /api/auth/google/callback
// @access  Public
const googleCallback = (req, res) => {
    try {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        // Block deactivated users from logging in
        if (req.user.isActive === false) {
            return res.redirect(`${frontendUrl}/auth/success?error=account_disabled`);
        }

        // req.user is populated by passport
        const token = generateToken(req.user._id);

        // Redirect to frontend with token
        res.redirect(`${frontendUrl}/auth/success?token=${token}`);
    } catch (error) {
        console.error(error);
        res.redirect('/login?error=auth_failed');
    }
};

// @desc    Admin Login with Email
// @route   POST /api/auth/admin/login
// @access  Public
const adminLogin = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if user is admin
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(403).json({ message: 'Account is disabled' });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            token,
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            credits: user.credits,
            avatar: user.avatar
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    googleCallback,
    adminLogin
};
