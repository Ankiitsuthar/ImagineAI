const Transaction = require('../models/Transaction');
const User = require('../models/User');

exports.createTransaction = async (req, res) => {
    try {
        const { amount, creditsPurchased, paymentId } = req.body;

        const transaction = await Transaction.create({
            userId: req.user.id,
            amount,
            creditsPurchased,
            paymentStatus: 'completed', // In real app, this waits for webhook
            paymentId
        });

        // Add credits to user
        const user = await User.findById(req.user.id);
        user.credits += creditsPurchased;
        await user.save();

        res.json({ success: true, transaction, credits: user.credits });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Transaction failed" });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, transactions });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch transactions" });
    }
};
