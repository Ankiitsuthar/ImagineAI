const crypto = require('crypto');
const Order = require('../models/Order');
const User = require('../models/User');
const { sendPaymentSuccessEmail } = require('../utils/emailService');

const PAYU_MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY;
const PAYU_SALT = process.env.PAYU_SALT;
const PAYU_MODE = process.env.PAYU_MODE || 'TEST';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// PayU base URLs
const PAYU_BASE_URL = PAYU_MODE === 'LIVE'
    ? 'https://secure.payu.in/_payment'
    : 'https://test.payu.in/_payment';

// Credit packages (INR pricing)
const creditPackages = {
    starter: { credits: 10, price: 199, name: 'Starter Pack' },    // ₹199
    popular: { credits: 50, price: 999, name: 'Popular Pack' },     // ₹999
    premium: { credits: 100, price: 1999, name: 'Premium Pack' }    // ₹1999
};

// Generate PayU hash
// Formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt)
const generateHash = (params) => {
    const hashString = `${params.key}|${params.txnid}|${params.amount}|${params.productinfo}|${params.firstname}|${params.email}|${params.udf1 || ''}|${params.udf2 || ''}|${params.udf3 || ''}|${params.udf4 || ''}|${params.udf5 || ''}||||||${PAYU_SALT}`;
    return crypto.createHash('sha512').update(hashString).digest('hex');
};

// Verify PayU response hash
// Formula: sha512(salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
const verifyHash = (params) => {
    const hashString = `${PAYU_SALT}|${params.status}||||||${params.udf5 || ''}|${params.udf4 || ''}|${params.udf3 || ''}|${params.udf2 || ''}|${params.udf1 || ''}|${params.email}|${params.firstname}|${params.productinfo}|${params.amount}|${params.txnid}|${PAYU_MERCHANT_KEY}`;
    return crypto.createHash('sha512').update(hashString).digest('hex');
};

// @desc    Create order and return PayU payment params
// @route   POST /api/orders/create
// @access  Private
const createOrder = async (req, res) => {
    try {
        const { packageType } = req.body;

        if (!creditPackages[packageType]) {
            return res.status(400).json({ message: 'Invalid package type' });
        }

        const pkg = creditPackages[packageType];
        const txnid = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

        // Create order record
        const order = await Order.create({
            user: req.user._id,
            packageName: pkg.name,
            credits: pkg.credits,
            amount: pkg.price,
            currency: 'INR',
            transactionId: txnid,
            status: 'pending'
        });

        // PayU payment params
        const payuParams = {
            key: PAYU_MERCHANT_KEY,
            txnid: txnid,
            amount: pkg.price.toFixed(2),
            productinfo: pkg.name,
            firstname: req.user.name || 'User',
            email: req.user.email,
            phone: req.body.phone || '',
            udf1: order._id.toString(),       // Store orderId in udf1
            udf2: pkg.credits.toString(),      // Store credits in udf2
            udf3: '',
            udf4: '',
            udf5: '',
            surl: `${BACKEND_URL}/api/orders/payment/success`,
            furl: `${BACKEND_URL}/api/orders/payment/failure`,
        };

        // Generate hash
        payuParams.hash = generateHash(payuParams);
        payuParams.payuBaseUrl = PAYU_BASE_URL;

        res.status(201).json({
            payuParams,
            orderId: order._id
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Price per credit in INR
const PRICE_PER_CREDIT = 10;

// @desc    Create custom order with user-specified credits
// @route   POST /api/orders/create-custom
// @access  Private
const createCustomOrder = async (req, res) => {
    try {
        const { credits } = req.body;
        const creditCount = parseInt(credits);

        if (!creditCount || creditCount < 1 || creditCount > 10000) {
            return res.status(400).json({ message: 'Credits must be between 1 and 10,000' });
        }

        const amount = creditCount * PRICE_PER_CREDIT;
        const txnid = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

        // Create order record
        const order = await Order.create({
            user: req.user._id,
            packageName: `${creditCount} Credits`,
            credits: creditCount,
            amount: amount,
            currency: 'INR',
            transactionId: txnid,
            status: 'pending'
        });

        // PayU payment params
        const payuParams = {
            key: PAYU_MERCHANT_KEY,
            txnid: txnid,
            amount: amount.toFixed(2),
            productinfo: `${creditCount} Credits - ImagineAI`,
            firstname: req.user.name || 'User',
            email: req.user.email,
            phone: req.body.phone || '',
            udf1: order._id.toString(),
            udf2: creditCount.toString(),
            udf3: '',
            udf4: '',
            udf5: '',
            surl: `${BACKEND_URL}/api/orders/payment/success`,
            furl: `${BACKEND_URL}/api/orders/payment/failure`,
        };

        // Generate hash
        payuParams.hash = generateHash(payuParams);
        payuParams.payuBaseUrl = PAYU_BASE_URL;

        res.status(201).json({
            payuParams,
            orderId: order._id
        });
    } catch (error) {
        console.error('Error creating custom order:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Handle PayU payment success callback
// @route   POST /api/orders/payment/success
// @access  Public (PayU callback)
const handlePaymentSuccess = async (req, res) => {
    try {
        const payuResponse = req.body;
        console.log('PayU Success Callback:', payuResponse.txnid, payuResponse.status);

        // Verify the response hash
        const expectedHash = verifyHash(payuResponse);

        if (expectedHash !== payuResponse.hash) {
            console.error('Hash verification failed for txn:', payuResponse.txnid);
            return res.redirect(`${FRONTEND_URL}/payment/failure?reason=hash_mismatch`);
        }

        // Find and update the order
        const order = await Order.findOne({ transactionId: payuResponse.txnid });

        if (!order) {
            console.error('Order not found for txn:', payuResponse.txnid);
            return res.redirect(`${FRONTEND_URL}/payment/failure?reason=order_not_found`);
        }

        if (order.status === 'pending') {
            order.status = 'completed';
            order.payuMihpayid = payuResponse.mihpayid; // PayU payment ID
            await order.save();

            // Add credits to user
            const user = await User.findById(order.user);
            if (user) {
                user.credits += order.credits;
                await user.save();

                // Send payment confirmation email (fire-and-forget)
                sendPaymentSuccessEmail(user, {
                    credits: order.credits,
                    amount: order.amount,
                    transactionId: payuResponse.txnid,
                    newBalance: user.credits
                }).catch(err => console.error('Email send error:', err.message));
            }
        }

        // Redirect to frontend success page
        res.redirect(`${FRONTEND_URL}/payment/success?txnid=${payuResponse.txnid}&credits=${order.credits}&amount=${order.amount}`);
    } catch (error) {
        console.error('Error handling payment success:', error);
        res.redirect(`${FRONTEND_URL}/payment/failure?reason=server_error`);
    }
};

// @desc    Handle PayU payment failure callback
// @route   POST /api/orders/payment/failure
// @access  Public (PayU callback)
const handlePaymentFailure = async (req, res) => {
    try {
        const payuResponse = req.body;
        console.log('PayU Failure Callback:', payuResponse.txnid, payuResponse.status);

        // Update order status
        const order = await Order.findOne({ transactionId: payuResponse.txnid });

        if (order && order.status === 'pending') {
            order.status = 'failed';
            await order.save();
        }

        // Redirect to frontend failure page
        res.redirect(`${FRONTEND_URL}/payment/failure?txnid=${payuResponse.txnid || ''}&reason=${payuResponse.error_Message || 'payment_failed'}`);
    } catch (error) {
        console.error('Error handling payment failure:', error);
        res.redirect(`${FRONTEND_URL}/payment/failure?reason=server_error`);
    }
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
// @route   GET /api/orders/all
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
            priceDisplay: `₹${creditPackages[key].price}`
        }));

        res.json(packages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Export orders as CSV
// @route   GET /api/orders/export
// @access  Private/Admin
const exportOrders = async (req, res) => {
    try {
        const status = req.query.status;
        const query = status ? { status } : {};

        const orders = await Order.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        // CSV header
        const csvRows = [
            ['Order ID', 'Customer Name', 'Customer Email', 'Package', 'Amount (INR)', 'Credits', 'Status', 'Transaction ID', 'Date'].join(',')
        ];

        // CSV rows
        orders.forEach(order => {
            const row = [
                order._id,
                `"${(order.user?.name || 'Unknown').replace(/"/g, '""')}"`,
                `"${(order.user?.email || 'N/A').replace(/"/g, '""')}"`,
                `"${(order.packageName || 'N/A').replace(/"/g, '""')}"`,
                order.amount || 0,
                order.credits || 0,
                order.status || 'pending',
                order.transactionId || 'N/A',
                order.createdAt ? new Date(order.createdAt).toISOString() : 'N/A'
            ];
            csvRows.push(row.join(','));
        });

        const csvContent = csvRows.join('\n');
        const filename = `orders_report_${new Date().toISOString().slice(0, 10)}.csv`;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(csvContent);
    } catch (error) {
        console.error('Export orders error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createOrder,
    createCustomOrder,
    handlePaymentSuccess,
    handlePaymentFailure,
    getUserOrders,
    getAllOrders,
    getCreditPackages,
    exportOrders
};
