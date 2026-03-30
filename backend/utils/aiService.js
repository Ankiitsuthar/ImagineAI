/**
 * AI Service - Image Generation
 * Priority: OpenAI (DALL-E 3) → Gemini → Hugging Face (Stable Diffusion XL)
 */

const { generateAIImageWithOpenAI } = require('./openaiService');
const { generateAIImageWithGemini } = require('./geminiService');
const { generateAIImageWithHuggingFace } = require('./huggingfaceService');

/**
 * Generate AI image - tries OpenAI first, falls back to Gemini, then Hugging Face
 * @param {string} userImagePath - Path to the user's uploaded image
 * @param {string} templatePrompt - The template prompt for image generation
 * @returns {Object} - Result with success status and image path or error
 */
const generateAIImage = async (userImagePath, templatePrompt) => {
    const errors = [];

    // 1. Try OpenAI DALL-E 3 (primary)
    console.log('🚀 Attempting to generate image with OpenAI DALL-E 3...');
    const openaiResult = await generateAIImageWithOpenAI(userImagePath, templatePrompt);

    if (openaiResult.success) {
        console.log('✅ OpenAI succeeded!');
        return openaiResult;
    }

    console.log('⚠️ OpenAI failed:', openaiResult.error);
    errors.push(`OpenAI: ${openaiResult.error}`);

    // 2. Try Gemini (first fallback)
    console.log('🔄 Falling back to Gemini...');
    const geminiResult = await generateAIImageWithGemini(userImagePath, templatePrompt);

    if (geminiResult.success) {
        console.log('✅ Gemini succeeded!');
        return geminiResult;
    }

    console.log('⚠️ Gemini failed:', geminiResult.error);
    errors.push(`Gemini: ${geminiResult.error}`);

    // 3. Try Hugging Face (last fallback)
    console.log('🔄 Falling back to Hugging Face...');
    const hfResult = await generateAIImageWithHuggingFace(userImagePath, templatePrompt);

    if (hfResult.success) {
        console.log('✅ Hugging Face succeeded!');
        return hfResult;
    }

    console.log('❌ All AI providers failed.');
    errors.push(`Hugging Face: ${hfResult.error}`);

    return {
        success: false,
        error: `All AI providers failed. ${errors.join(' | ')}`
    };
};

module.exports = {
    generateAIImage
};
