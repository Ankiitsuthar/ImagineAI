const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true }, // For Google Auth
  email: { type: String, required: true, unique: true },
  name: { type: String },
  avatar: { type: String },
  credits: { type: Number, default: 5 }, // Default free credits
  role: { type: String, enum: ['user', 'admin'], default: 'user' }, // [cite: 42]
  isActive: { type: Boolean, default: true }, // Account active status
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
