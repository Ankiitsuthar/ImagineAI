const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Image = require('../models/Image');
const Template = require('../models/Template');
const { generateAIImage } = require('../utils/aiService');

exports.generateImage = async (req, res) => {
    try {
        const { templateId } = req.body;
        // req.user is populated by authentication middleware
        const user = await User.findById(req.user.id);
        const template = await Template.findById(templateId);

        if (!template) {
            return res.status(404).json({ error: "Template not found" });
        }

        // 1. Check Credits
        if (user.credits < template.creditCost) {
            return res.status(400).json({ error: "Insufficient credits" });
        }

        // 2. Handle File Upload (Multer stores it in /uploads/inputs)
        if (!req.file) {
            return res.status(400).json({ error: "No image file provided" });
        }
        const originalPath = req.file.path;
        const fullOriginalPath = path.join(__dirname, '..', originalPath);

        // 3. AI Generation with Gemini
        console.log('Starting AI generation with Gemini...');
        console.log('Template:', template.name);
        console.log('Prompt:', template.basePrompt);

        const result = await generateAIImage(fullOriginalPath, template.basePrompt);

        if (!result.success) {
            console.error('AI Generation failed:', result.error);
            return res.status(500).json({ error: result.error || "AI generation failed" });
        }

        const generatedPath = result.imagePath;

        // 4. Deduct Credits & Save History
        user.credits -= template.creditCost;
        await user.save();

        const newImage = await Image.create({
            userId: user.id,
            templateId: template.id,
            originalImagePath: originalPath,
            generatedImagePath: generatedPath
        });

        console.log('Image generated successfully:', generatedPath);

        res.json({ success: true, image: newImage, remainingCredits: user.credits });

    } catch (err) {
        console.error('Generation error:', err);
        res.status(500).json({ error: "Generation failed: " + err.message });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const images = await Image.find({ userId: req.user.id })
            .populate('templateId')
            .sort({ createdAt: -1 });
        res.json({ success: true, images });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch history" });
    }
};
