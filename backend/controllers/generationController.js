const Generation = require('../models/Generation');
const Template = require('../models/Template');
const User = require('../models/User');
const { generateAIImage } = require('../utils/aiService');
const path = require('path');
const fs = require('fs');

// @desc    Generate AI image
// @route   POST /api/generate
// @access  Private
const generateImage = async (req, res) => {
    try {
        const { templateId } = req.body;

        // Check if image was uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        // Get template
        const template = await Template.findById(templateId);
        if (!template || !template.isActive) {
            return res.status(404).json({ message: 'Template not found or inactive' });
        }

        // Check user credits
        const user = await User.findById(req.user._id);
        if (user.credits < template.creditCost) {
            return res.status(400).json({
                message: 'Insufficient credits',
                required: template.creditCost,
                available: user.credits
            });
        }

        const userImagePath = `/uploads/user-images/${req.file.filename}`;
        const fullUserImagePath = path.join(__dirname, '..', userImagePath);

        // Create generation record
        const generation = await Generation.create({
            user: req.user._id,
            template: templateId,
            originalImage: userImagePath,
            creditsUsed: template.creditCost,
            status: 'processing'
        });

        // Deduct credits immediately
        user.credits -= template.creditCost;
        await user.save();

        // Generate AI image asynchronously
        generateAIImage(fullUserImagePath, template.prompt)
            .then(async (result) => {
                if (result.success) {
                    generation.generatedImage = result.imagePath;
                    generation.status = 'completed';
                } else {
                    generation.status = 'failed';
                    generation.errorMessage = result.error;
                    // Refund credits on failure
                    user.credits += template.creditCost;
                    await user.save();
                }
                await generation.save();
            })
            .catch(async (error) => {
                console.error('Generation error:', error);
                generation.status = 'failed';
                generation.errorMessage = error.message;
                await generation.save();
                // Refund credits on error
                user.credits += template.creditCost;
                await user.save();
            });

        // Return immediately with processing status
        res.status(201).json({
            message: 'Image generation started',
            generationId: generation._id,
            status: 'processing',
            creditsRemaining: user.credits
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get generation status
// @route   GET /api/generations/:id
// @access  Private
const getGenerationStatus = async (req, res) => {
    try {
        const generation = await Generation.findById(req.params.id)
            .populate('template', 'name category');

        if (!generation) {
            return res.status(404).json({ message: 'Generation not found' });
        }

        // Check if user owns this generation
        if (generation.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(generation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get user's generation history
// @route   GET /api/generations
// @access  Private
const getGenerationHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const generations = await Generation.find({ user: req.user._id })
            .populate('template', 'name category')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Generation.countDocuments({ user: req.user._id });

        res.json({
            generations,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Download generated image
// @route   GET /api/generations/:id/download
// @access  Private
const downloadGeneratedImage = async (req, res) => {
    try {
        const generation = await Generation.findById(req.params.id);

        if (!generation) {
            return res.status(404).json({ message: 'Generation not found' });
        }

        // Check if user owns this generation
        if (generation.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (generation.status !== 'completed' || !generation.generatedImage) {
            return res.status(400).json({ message: 'Image not ready for download' });
        }

        const imagePath = path.join(__dirname, '..', generation.generatedImage);

        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({ message: 'Image file not found' });
        }

        res.download(imagePath);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    generateImage,
    getGenerationStatus,
    getGenerationHistory,
    downloadGeneratedImage
};
