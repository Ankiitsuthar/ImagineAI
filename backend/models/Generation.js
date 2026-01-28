const mongoose = require('mongoose');

const generationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    template: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Template',
        required: true
    },
    originalImage: {
        type: String,
        required: [true, 'Original image path is required']
    },
    generatedImage: {
        type: String,
        default: null
    },
    creditsUsed: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['processing', 'completed', 'failed'],
        default: 'processing'
    },
    errorMessage: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Index for faster queries
generationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Generation', generationSchema);
