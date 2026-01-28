const express = require('express');
const router = express.Router();
const {
    generateImage,
    getGenerationStatus,
    getGenerationHistory,
    downloadGeneratedImage
} = require('../controllers/generationController');
const { protect } = require('../middleware/auth');
const { uploadUserImage } = require('../config/upload');

router.post('/', protect, uploadUserImage.single('image'), generateImage);
router.get('/', protect, getGenerationHistory);
router.get('/:id', protect, getGenerationStatus);
router.get('/:id/download', protect, downloadGeneratedImage);

module.exports = router;
