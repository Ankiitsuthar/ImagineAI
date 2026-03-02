const Collection = require('../models/Collection');
const Template = require('../models/Template');

// @desc    Get all collections with template counts
// @route   GET /api/collections
// @access  Public
const getCollections = async (req, res) => {
    try {
        // 1. Get all explicit collections from the Collection model
        const collections = await Collection.find({}).sort({ title: 1 }).lean();

        // 2. Get template counts per collectionId
        const templateCounts = await Template.aggregate([
            { $group: { _id: '$collectionId', count: { $sum: 1 } } }
        ]);
        const countMap = {};
        templateCounts.forEach(tc => { countMap[tc._id] = tc.count; });

        // 3. Build a map of explicit collections (keyed by collectionId)
        const collectionMap = {};
        collections.forEach(col => {
            collectionMap[col.collectionId] = {
                _id: col._id,
                id: col.collectionId,
                collectionId: col.collectionId,
                title: col.title,
                icon: col.icon,
                color: col.color,
                description: col.description || '',
                templateCount: countMap[col.collectionId] || 0,
                createdAt: col.createdAt,
                updatedAt: col.updatedAt
            };
        });

        // 4. Discover implicit collections from templates that don't have
        //    a matching Collection document
        const templateCollections = await Template.aggregate([
            { $match: { collectionId: { $exists: true, $ne: '' } } },
            {
                $group: {
                    _id: '$collectionId',
                    title: { $first: '$collectionTitle' },
                    icon: { $first: '$collectionIcon' },
                    color: { $first: '$collectionColor' },
                    count: { $sum: 1 }
                }
            }
        ]);

        templateCollections.forEach(tc => {
            if (!collectionMap[tc._id]) {
                collectionMap[tc._id] = {
                    _id: null,
                    id: tc._id,
                    collectionId: tc._id,
                    title: tc.title || tc._id,
                    icon: tc.icon || 'lucide:Sparkles',
                    color: tc.color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    description: '',
                    templateCount: tc.count,
                    createdAt: null,
                    updatedAt: null,
                    implicit: true
                };
            }
        });

        // 5. Return all collections sorted by title
        const allCollections = Object.values(collectionMap)
            .sort((a, b) => a.title.localeCompare(b.title));

        res.json(allCollections);
    } catch (error) {
        console.error('Error fetching collections:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create a new collection
// @route   POST /api/collections
// @access  Private/Admin
const createCollection = async (req, res) => {
    try {
        const { collectionId, title, icon, color, description } = req.body;

        if (!collectionId || !title) {
            return res.status(400).json({ message: 'collectionId and title are required' });
        }

        // Check for duplicate collectionId
        const existing = await Collection.findOne({ collectionId });
        if (existing) {
            return res.status(400).json({ message: 'A collection with this ID already exists' });
        }

        const collection = await Collection.create({
            collectionId,
            title,
            icon: icon || '✨',
            color: color || '#8B5CF6',
            description: description || ''
        });

        res.status(201).json(collection);
    } catch (error) {
        console.error('Error creating collection:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update a collection
// @route   PUT /api/collections/:id
// @access  Private/Admin
const updateCollection = async (req, res) => {
    try {
        const collection = await Collection.findById(req.params.id);

        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        const { title, icon, color, description } = req.body;
        const oldCollectionId = collection.collectionId;

        if (title !== undefined) collection.title = title;
        if (icon !== undefined) collection.icon = icon;
        if (color !== undefined) collection.color = color;
        if (description !== undefined) collection.description = description;

        await collection.save();

        // Also update all templates that reference this collection
        const updateFields = {};
        if (title !== undefined) updateFields.collectionTitle = title;
        if (icon !== undefined) updateFields.collectionIcon = icon;
        if (color !== undefined) updateFields.collectionColor = color;

        if (Object.keys(updateFields).length > 0) {
            await Template.updateMany(
                { collectionId: oldCollectionId },
                { $set: updateFields }
            );
        }

        res.json(collection);
    } catch (error) {
        console.error('Error updating collection:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete a collection
// @route   DELETE /api/collections/:id
// @access  Private/Admin
const deleteCollection = async (req, res) => {
    try {
        const collection = await Collection.findById(req.params.id);

        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        // Check if any templates reference this collection
        const templateCount = await Template.countDocuments({ collectionId: collection.collectionId });
        if (templateCount > 0) {
            return res.status(400).json({
                message: `Cannot delete: ${templateCount} template(s) still belong to this collection. Remove or reassign them first.`
            });
        }

        await collection.deleteOne();
        res.json({ message: 'Collection deleted successfully' });
    } catch (error) {
        console.error('Error deleting collection:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Upload a collection icon image
// @route   POST /api/collections/upload-icon
// @access  Private/Admin
const uploadCollectionIcon = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const iconUrl = `/uploads/collection-icons/${req.file.filename}`;
        res.json({ iconUrl });
    } catch (error) {
        console.error('Error uploading collection icon:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    uploadCollectionIcon
};
