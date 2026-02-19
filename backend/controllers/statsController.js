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

// @desc    Get revenue analytics
// @route   GET /api/stats/revenue
// @access  Private/Admin
const getRevenueAnalytics = async (req, res) => {
    try {
        // 1. Overall revenue stats
        const overallStats = await Order.aggregate([
            { $match: { status: 'completed' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$amount' },
                    totalOrders: { $sum: 1 },
                    totalCreditsSold: { $sum: '$credits' },
                    avgOrderValue: { $avg: '$amount' }
                }
            }
        ]);

        // 2. Monthly revenue for last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyRevenue = await Order.aggregate([
            { $match: { status: 'completed', createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    revenue: { $sum: '$amount' },
                    orders: { $sum: 1 },
                    creditsSold: { $sum: '$credits' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Format monthly data with month names
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedMonthly = monthlyRevenue.map(item => ({
            month: monthNames[item._id.month - 1],
            year: item._id.year,
            label: `${monthNames[item._id.month - 1]} ${item._id.year}`,
            revenue: item.revenue,
            orders: item.orders,
            creditsSold: item.creditsSold
        }));

        // 3. Top 5 purchasers
        const topPurchasers = await Order.aggregate([
            { $match: { status: 'completed' } },
            {
                $group: {
                    _id: '$user',
                    totalSpent: { $sum: '$amount' },
                    totalOrders: { $sum: 1 },
                    totalCredits: { $sum: '$credits' }
                }
            },
            { $sort: { totalSpent: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    _id: 1,
                    totalSpent: 1,
                    totalOrders: 1,
                    totalCredits: 1,
                    'user.name': 1,
                    'user.email': 1,
                    'user.avatar': 1
                }
            }
        ]);

        // 4. Recent 10 orders
        const recentOrders = await Order.find({ status: 'completed' })
            .populate('user', 'name email avatar')
            .sort({ createdAt: -1 })
            .limit(10);

        // 5. Package breakdown
        const packageBreakdown = await Order.aggregate([
            { $match: { status: 'completed' } },
            {
                $group: {
                    _id: '$packageName',
                    count: { $sum: 1 },
                    revenue: { $sum: '$amount' },
                    creditsSold: { $sum: '$credits' }
                }
            },
            { $sort: { revenue: -1 } }
        ]);

        const stats = overallStats.length > 0 ? overallStats[0] : {
            totalRevenue: 0,
            totalOrders: 0,
            totalCreditsSold: 0,
            avgOrderValue: 0
        };

        res.json({
            stats: {
                totalRevenue: stats.totalRevenue,
                totalOrders: stats.totalOrders,
                totalCreditsSold: stats.totalCreditsSold,
                avgOrderValue: Math.round(stats.avgOrderValue * 100) / 100
            },
            monthlyRevenue: formattedMonthly,
            topPurchasers,
            recentOrders,
            packageBreakdown
        });
    } catch (error) {
        console.error('Revenue analytics error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getRevenueAnalytics
};
