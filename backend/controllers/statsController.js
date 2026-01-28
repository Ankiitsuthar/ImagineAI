const User = require('../models/User');
const Template = require('../models/Template');
const Order = require('../models/Order');
const Image = require('../models/Image');

// @desc    Get admin dashboard statistics
// @route   GET /api/stats/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        // Get counts in parallel for efficiency
        const [
            totalUsers,
            totalTemplates,
            totalOrders,
            totalGenerations,
            revenueData,
            recentUsers,
            ordersByStatus
        ] = await Promise.all([
            User.countDocuments(),
            Template.countDocuments(),
            Order.countDocuments(),
            Image.countDocuments(),
            Order.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
            ]),
            User.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select('name email createdAt'),
            Order.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ])
        ]);

        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

        // Format order stats
        const orderStats = {
            pending: 0,
            completed: 0,
            failed: 0,
            refunded: 0
        };
        ordersByStatus.forEach(item => {
            if (orderStats.hasOwnProperty(item._id)) {
                orderStats[item._id] = item.count;
            }
        });

        res.json({
            stats: {
                totalUsers,
                totalTemplates,
                totalOrders,
                totalGenerations,
                totalRevenue
            },
            orderStats,
            recentUsers
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getDashboardStats
};
