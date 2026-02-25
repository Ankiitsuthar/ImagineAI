const { InferenceClient } = require('@huggingface/inference');
const fs = require('fs');
const path = require('path');

// Lazy initialization - only create client when needed
let hfClient = null;
const getHFClient = () => {
    if (!hfClient && process.env.HF_TOKEN) {
        hfClient = new InferenceClient(process.env.HF_TOKEN);
    }
    return hfClient;
};

/**
 * Optionally describe the uploaded image using OpenAI GPT-4 Vision.
 * Returns null if OpenAI is not configured.
 */
const describeImageWithVision = async (userImagePath) => {
    try {
        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
            return null;
        }

        const OpenAI = require('openai');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const imageData = fs.readFileSync(userImagePath);
        const base64Image = imageData.toString('base64');

        const ext = path.extname(userImagePath).toLowerCase();
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.webp': 'image/webp',
            '.gif': 'image/gif'
        };
        const mimeType = mimeTypes[ext] || 'image/jpeg';
        const dataUrl = `data:${mimeType};base64,${base64Image}`;

        console.log('📸 Analyzing uploaded image with GPT-4 Vision for Hugging Face prompt...');

        const visionResponse = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: 'Describe this image in detail. Focus on: the main subject, their appearance (age, gender, clothing, pose), the setting/background, lighting, colors, and overall mood. Be concise but specific. This description will be used to recreate a similar image.'
                        },
                        {
                            type: 'image_url',
                            image_url: { url: dataUrl }
                        }
                    ]
                }
            ],
            max_tokens: 500
        });

        return visionResponse.choices[0]?.message?.content || null;
    } catch (error) {
        console.warn('⚠️ GPT-4 Vision analysis failed, proceeding with template prompt only:', error.message);
        return null;
    }
};

/**
 * Generate AI image using Hugging Face Inference API (Stable Diffusion XL via Replicate)
 * @param {string} userImagePath - Path to the user's uploaded image
 * @param {string} templatePrompt - The template prompt for image generation
 * @returns {Object} - Result with success status and image path or error
 */
const generateAIImageWithHuggingFace = async (userImagePath, templatePrompt) => {
    try {
        // Validate API key
        if (!process.env.HF_TOKEN || process.env.HF_TOKEN === 'your_hugging_face_token_here') {
            throw new Error('HF_TOKEN is not configured. Please add your Hugging Face API token to .env file.');
        }

        // Get the HF client (lazy initialization)
        const client = getHFClient();
        if (!client) {
            throw new Error('HF_TOKEN is not configured.');
        }

        // Try to describe the user image with GPT-4 Vision for a better prompt
        const imageDescription = await describeImageWithVision(userImagePath);

        let finalPrompt;
        if (imageDescription) {
            finalPrompt = `Based on the following reference image description, apply the given style transformation.

Reference Image: ${imageDescription}

Style/Transformation to apply: ${templatePrompt}

Create a high-quality, photorealistic image that applies the requested transformation to the subject described above. Maintain the person's core features and identity while applying the style changes.`;
            console.log('🎨 Using enriched prompt with image description');
        } else {
            finalPrompt = templatePrompt;
            console.log('🎨 Using template prompt directly (no Vision analysis available)');
        }

        console.log('🚀 Sending request to Hugging Face (Stable Diffusion XL via Replicate)...');
        console.log('Prompt:', finalPrompt.substring(0, 200) + '...');

        // Generate image using Hugging Face Inference API
        const image = await client.textToImage({
            provider: 'replicate',
            model: 'Qwen/Qwen-Image',
            inputs: finalPrompt,
            parameters: { num_inference_steps: 50 },
        });

        // The result is a Blob - convert to Buffer
        const arrayBuffer = await image.arrayBuffer();
        const imageBuffer = Buffer.from(arrayBuffer);

        if (!imageBuffer || imageBuffer.length === 0) {
            throw new Error('No image data returned from Hugging Face API');
        }

        // Save the generated image
        const timestamp = Date.now();
        const filename = `generated-${timestamp}.png`;
        const savePath = path.join(__dirname, '../uploads/generated-images', filename);

        // Ensure directory exists
        const dir = path.dirname(savePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Save the image
        fs.writeFileSync(savePath, imageBuffer);

        console.log('✅ Image generated and saved via Hugging Face:', filename);

        return {
            success: true,
            imagePath: `/uploads/generated-images/${filename}`
        };

    } catch (error) {
        console.error('Hugging Face Image Generation Error:', error);

        let errorMessage = error.message;

        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
            errorMessage = 'Invalid Hugging Face API token. Please check your HF_TOKEN in .env file.';
        } else if (error.message?.includes('429') || error.message?.includes('rate')) {
            errorMessage = 'Hugging Face rate limit exceeded. Please try again in a moment.';
        } else if (error.message?.includes('503') || error.message?.includes('loading')) {
            errorMessage = 'Model is loading on Hugging Face. Please try again in a few seconds.';
        }

        return {
            success: false,
            error: errorMessage
        };
    }
};

module.exports = {
    generateAIImageWithHuggingFace
};
