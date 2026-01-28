const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const User = require('../models/User');

// Credit packages
const creditPackages = {
    starter: { credits: 10, price: 999, name: 'Starter Pack' }, // $9.99
    popular: { credits: 50, price: 3999, name: 'Popular Pack' }, // $39.99
    premium: { credits: 100, price: 6999, name: 'Premium Pack' } // $69.99
};

// @desc    Create payment intent
// @route   POST /api/orders/create
// @access  Private
const createOrder = async (req, res) => {
    try {
        const { packageType } = req.body;

        if (!creditPackages[packageType]) {
            return res.status(400).json({ message: 'Invalid package type' });
        }

        const package = creditPackages[packageType];

        // Create Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: package.price,
            currency: 'usd',
            metadata: {
                userId: req.user._id.toString(),
                packageType,
                credits: package.credits
            }
        });

        // Create order record
        const order = await Order.create({
            user: req.user._id,
            packageName: package.name,
            credits: package.credits,
            amount: package.price / 100, // Convert cents to dollars
            currency: 'usd',
            paymentIntentId: paymentIntent.id,
            status: 'pending'
        });

        res.status(201).json({
            clientSecret: paymentIntent.client_secret,
            orderId: order._id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Webhook for Stripe payment confirmation
// @route   POST /api/orders/webhook
// @access  Public (Stripe)
const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;

        try {
            // Find the order
            const order = await Order.findOne({ paymentIntentId: paymentIntent.id });

            if (order && order.status === 'pending') {
                // Update order status
                order.status = 'completed';
                await order.save();

                // Add credits to user
                const user = await User.findById(order.user);
                if (user) {
                    user.credits += order.credits;
                    await user.save();
                }
            }
        } catch (error) {
            console.error('Error processing webhook:', error);
        }
    }

    res.json({ received: true });
};

// @desc    Get user's order history
// @route   GET /api/orders
// @access  Private
const getUserOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Order.countDocuments({ user: req.user._id });

        res.json({
            orders,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all orders (Admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const status = req.query.status;

        const query = status ? { status } : {};

        const orders = await Order.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Order.countDocuments(query);

        // Calculate total revenue
        const revenueData = await Order.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
        ]);

        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

        res.json({
            orders,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            total,
            totalRevenue
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get credit packages
// @route   GET /api/orders/packages
// @access  Public
const getCreditPackages = async (req, res) => {
    try {
        const packages = Object.keys(creditPackages).map(key => ({
            type: key,
            ...creditPackages[key],
            priceDisplay: `$${(creditPackages[key].price / 100).toFixed(2)}`
        }));

        res.json(packages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createOrder,
    handleWebhook,
    getUserOrders,
    getAllOrders,
    getCreditPackages
};
