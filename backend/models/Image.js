const mongoose = require('mongoose');

// models/Image.js 
const imageSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template' },
    originalImagePath: { type: String, required: true }, // Uploaded by user [cite: 76]
    generatedImagePath: { type: String, required: true }, // AI Result [cite: 77]
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Image', imageSchema);
