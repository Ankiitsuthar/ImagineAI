const mongoose = require('mongoose');

// models/Template.js [cite: 43]
const templateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    basePrompt: { type: String, required: true },
    creditCost: { type: Number, required: true, default: 1 },
    category: { type: String, required: true }, // 'Business', 'Artistic', 'Lifestyle', 'Events'
    collectionId: { type: String, required: true }, // 'professional', 'ghibli', 'creative', etc.
    collectionTitle: { type: String, required: true }, // Display name for collection
    collectionIcon: { type: String, default: '✨' }, // Emoji icon
    collectionColor: { type: String, default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    popular: { type: Boolean, default: false }
});

module.exports = mongoose.model('Template', templateSchema);
