const express = require('express');
const router = express.Router();
const {
    getCollections,
    createCollection,
    updateCollection,
    deleteCollection
} = require('../controllers/collectionController');
const { protect, admin } = require('../middleware/auth');

// Public
router.get('/', getCollections);

// Admin only
router.post('/', protect, admin, createCollection);
router.put('/:id', protect, admin, updateCollection);
router.delete('/:id', protect, admin, deleteCollection);

module.exports = router;
