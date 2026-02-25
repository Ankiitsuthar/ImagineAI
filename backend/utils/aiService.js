/**
 * AI Service - Image Generation
 * Uses Hugging Face (Stable Diffusion XL) as primary, with Gemini and GetImg.ai as fallbacks
 */

const { generateAIImageWithHuggingFace } = require('./huggingfaceService');
const { generateAIImageWithGemini } = require('./geminiService');
const { generateAIImageWithGetImg } = require('./getimgService');

/**
 * Generate AI image - tries Hugging Face first, falls back to Gemini, then GetImg.ai
 * @param {string} userImagePath - Path to the user's uploaded image
 * @param {string} templatePrompt - The template prompt for image generation
 * @returns {Object} - Result with success status and image path or error
 */
const generateAIImage = async (userImagePath, templatePrompt) => {
    // 1. Try Hugging Face (primary)
    console.log('🚀 Attempting to generate image with Hugging Face...');
    const hfResult = await generateAIImageWithHuggingFace(userImagePath, templatePrompt);

    if (hfResult.success) {
        return hfResult;
    }

    console.log('⚠️ Hugging Face failed:', hfResult.error);

    // 2. Try Gemini (first fallback)
    console.log('🔄 Falling back to Gemini...');
    const geminiResult = await generateAIImageWithGemini(userImagePath, templatePrompt);

    if (geminiResult.success) {
        return geminiResult;
    }

    console.log('⚠️ Gemini failed:', geminiResult.error);

    // 3. Try GetImg.ai (last fallback)
    console.log('🔄 Falling back to GetImg.ai...');
    return await generateAIImageWithGetImg(userImagePath, templatePrompt);
};

module.exports = {
    generateAIImage
};
