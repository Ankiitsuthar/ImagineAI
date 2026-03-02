const express = require('express');
const router = express.Router();
const {
    getCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    uploadCollectionIcon
} = require('../controllers/collectionController');
const { protect, admin } = require('../middleware/auth');
const { uploadCollectionIcon: uploadCollectionIconMiddleware } = require('../config/upload');

// Public
router.get('/', getCollections);

// Admin only
router.post('/upload-icon', protect, admin, uploadCollectionIconMiddleware.single('icon'), uploadCollectionIcon);
router.post('/', protect, admin, createCollection);
router.put('/:id', protect, admin, updateCollection);
router.delete('/:id', protect, admin, deleteCollection);

module.exports = router;
