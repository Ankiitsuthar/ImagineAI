const User = require('../models/User');
const Image = require('../models/Image');

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user stats
        // Note: Strict Image schema doesn't have status, assuming all created are valid/completed or we count all.
        const totalGenerations = await Image.countDocuments({ userId: req.user._id });

        res.json({
            user,
            stats: {
                totalGenerations
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { name } = req.body;

        if (name) user.name = name;
        // Email is managed by Google Auth, usually not editable here.

        await user.save();
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';

        const query = search
            ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            }
            : {};

        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments(query);

        res.json({
            users,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get user by ID (Admin)
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user's generation history
        const generations = await Image.find({ userId: req.params.id })
            .populate('templateId', 'name')
            .sort({ createdAt: -1 })
            .limit(10);

        const totalGenerations = await Image.countDocuments({ userId: req.params.id });

        res.json({
            user,
            generations,
            totalGenerations
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update user credits (Admin)
// @route   PUT /api/admin/users/:id/credits
// @access  Private/Admin
const updateUserCredits = async (req, res) => {
    try {
        const { credits } = req.body;

        if (typeof credits !== 'number') {
            return res.status(400).json({ message: 'Please provide a valid credit amount' });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.credits = credits;
        await user.save();

        res.json({ message: 'Credits updated successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Toggle user active status (Admin)
// @route   PUT /api/users/:id/toggle-status
// @access  Private/Admin
const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent admin from disabling themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot modify your own status' });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.json({
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update user details (Admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { name, credits, role, isActive } = req.body;

        if (name !== undefined) user.name = name;
        if (credits !== undefined) user.credits = parseInt(credits);
        if (role !== undefined && ['user', 'admin'].includes(role)) user.role = role;
        if (isActive !== undefined) user.isActive = isActive;

        await user.save();

        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    getAllUsers,
    getUserById,
    updateUserCredits,
    toggleUserStatus,
    updateUser
};
