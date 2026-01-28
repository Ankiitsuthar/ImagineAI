const mongoose = require('mongoose');

// models/Transaction.js [cite: 53]
const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    creditsPurchased: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' }, // [cite: 55]
    paymentId: { type: String } // Gateway ID
});

module.exports = mongoose.model('Transaction', transactionSchema);
