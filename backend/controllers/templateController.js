const Template = require('../models/Template');
const path = require('path');
const fs = require('fs');

// @desc    Get all active templates
// @route   GET /api/templates
// @access  Public
const getTemplates = async (req, res) => {
    try {
        const templates = await Template.find({}).sort({ name: 1 });
        res.json(templates);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get single template
// @route   GET /api/templates/:id
// @access  Public
const getTemplateById = async (req, res) => {
    try {
        const template = await Template.findById(req.params.id);

        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        res.json(template);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create template (Admin)
// @route   POST /api/admin/templates
// @access  Private/Admin
const createTemplate = async (req, res) => {
    try {
        const {
            name,
            basePrompt,
            creditCost,
            category,
            collectionId,
            collectionTitle,
            collectionIcon,
            collectionColor,
            popular
        } = req.body;

        // Validation
        if (!name || !basePrompt || !creditCost || !category || !collectionId || !collectionTitle) {
            return res.status(400).json({
                message: 'Please provide all required fields: name, basePrompt, creditCost, category, collectionId, collectionTitle'
            });
        }

        // Check if thumbnail was uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a thumbnail image' });
        }

        const thumbnailUrl = `/uploads/thumbnails/${req.file.filename}`;

        const template = await Template.create({
            name,
            thumbnailUrl,
            basePrompt,
            creditCost: parseInt(creditCost),
            category,
            collectionId,
            collectionTitle,
            collectionIcon: collectionIcon || '✨',
            collectionColor: collectionColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            popular: popular === 'true' || popular === true
        });

        res.status(201).json(template);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update template (Admin)
// @route   PUT /api/admin/templates/:id
// @access  Private/Admin
const updateTemplate = async (req, res) => {
    try {
        const template = await Template.findById(req.params.id);

        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        const {
            name,
            basePrompt,
            creditCost,
            category,
            collectionId,
            collectionTitle,
            collectionIcon,
            collectionColor,
            popular
        } = req.body;

        // Update fields if provided
        if (name !== undefined) template.name = name;
        if (basePrompt !== undefined) template.basePrompt = basePrompt;
        if (creditCost !== undefined) template.creditCost = parseInt(creditCost);
        if (category !== undefined) template.category = category;
        if (collectionId !== undefined) template.collectionId = collectionId;
        if (collectionTitle !== undefined) template.collectionTitle = collectionTitle;
        if (collectionIcon !== undefined) template.collectionIcon = collectionIcon;
        if (collectionColor !== undefined) template.collectionColor = collectionColor;
        if (popular !== undefined) template.popular = popular === 'true' || popular === true;

        // Update thumbnail if new one uploaded
        if (req.file) {
            // Delete old thumbnail
            const oldThumbnailPath = path.join(__dirname, '..', template.thumbnailUrl);
            if (fs.existsSync(oldThumbnailPath)) {
                fs.unlinkSync(oldThumbnailPath);
            }
            template.thumbnailUrl = `/uploads/thumbnails/${req.file.filename}`;
        }

        await template.save();
        res.json(template);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete template (Admin)
// @route   DELETE /api/admin/templates/:id
// @access  Private/Admin
const deleteTemplate = async (req, res) => {
    try {
        const template = await Template.findById(req.params.id);

        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        // Delete thumbnail file
        const thumbnailPath = path.join(__dirname, '..', template.thumbnailUrl);
        if (fs.existsSync(thumbnailPath)) {
            fs.unlinkSync(thumbnailPath);
        }

        await template.deleteOne();
        res.json({ message: 'Template deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all collections with template counts
// @route   GET /api/templates/collections
// @access  Public
const getCollections = async (req, res) => {
    try {
        const collections = await Template.aggregate([
            {
                $group: {
                    _id: '$collectionId',
                    title: { $first: '$collectionTitle' },
                    category: { $first: '$category' },
                    icon: { $first: '$collectionIcon' },
                    color: { $first: '$collectionColor' },
                    templateCount: { $sum: 1 }
                }
            },
            {
                $project: {
                    id: '$_id',
                    title: 1,
                    category: 1,
                    icon: 1,
                    color: 1,
                    templateCount: 1,
                    _id: 0
                }
            },
            { $sort: { title: 1 } }
        ]);

        res.json(collections);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get templates by collection ID
// @route   GET /api/templates/by-collection/:collectionId
// @access  Public
const getTemplatesByCollection = async (req, res) => {
    try {
        const templates = await Template.find({ collectionId: req.params.collectionId })
            .sort({ popular: -1, name: 1 });

        res.json(templates);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getCollections,
    getTemplatesByCollection
};

