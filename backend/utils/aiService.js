/**
 * AI Service - Image Generation
 * Uses Google Gemini API, with GetImg.ai as fallback
 */

const { generateAIImageWithGemini } = require('./geminiService');
const { generateAIImageWithGetImg } = require('./getimgService');

/**
 * Generate AI image - tries Gemini first, falls back to GetImg.ai
 * @param {string} userImagePath - Path to the user's uploaded image
 * @param {string} templatePrompt - The template prompt for image generation
 * @returns {Object} - Result with success status and image path or error
 */
const generateAIImage = async (userImagePath, templatePrompt) => {
    console.log('🚀 Attempting to generate image with Gemini...');
    const geminiResult = await generateAIImageWithGemini(userImagePath, templatePrompt);
    
    // If Gemini succeeds, return result
    if (geminiResult.success) {
        return geminiResult;
    }
    
    // If Gemini fails due to quota, try GetImg.ai
    if (geminiResult.error && geminiResult.error.includes('quota')) {
        console.log('⚠️ Gemini quota exceeded, falling back to GetImg.ai...');
        return await generateAIImageWithGetImg(userImagePath, templatePrompt);
    }
    
    // For other Gemini errors, still try GetImg as fallback
    console.log('⚠️ Gemini failed, attempting GetImg.ai as fallback...');
    return await generateAIImageWithGetImg(userImagePath, templatePrompt);
};

module.exports = {
    generateAIImage
};
