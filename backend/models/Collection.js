const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
    collectionId: { type: String, required: true, unique: true }, // URL-friendly slug
    title: { type: String, required: true },
    icon: { type: String, default: '✨' },
    color: { type: String, default: '#8B5CF6' },
    description: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Collection', collectionSchema);
