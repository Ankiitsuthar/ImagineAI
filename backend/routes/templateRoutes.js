const express = require('express');
const router = express.Router();
const {
    getTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getCollections,
    getTemplatesByCollection
} = require('../controllers/templateController');
const { protect, admin } = require('../middleware/auth');
const { uploadTemplateThumbnail } = require('../config/upload');

// Public routes
router.get('/', getTemplates);
router.get('/collections', getCollections);
router.get('/by-collection/:collectionId', getTemplatesByCollection);
router.get('/:id', getTemplateById);

// Admin routes
router.post('/', protect, admin, uploadTemplateThumbnail.single('thumbnail'), createTemplate);
router.put('/:id', protect, admin, uploadTemplateThumbnail.single('thumbnail'), updateTemplate);
router.delete('/:id', protect, admin, deleteTemplate);

module.exports = router;

