const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');

// Lazy initialization - only create client when needed
let ai = null;
const getAIClient = () => {
    if (!ai && process.env.GEMINI_API_KEY) {
        ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return ai;
};

/**
 * Generate AI image using Google Gemini
 * @param {string} userImagePath - Path to the user's uploaded image
 * @param {string} templatePrompt - The template prompt for image generation
 * @returns {Object} - Result with success status and image path or error
 */
const generateAIImageWithGemini = async (userImagePath, templatePrompt) => {
    try {
        // Validate API key
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
            throw new Error('GEMINI_API_KEY is not configured. Please add your API key to .env file.');
        }

        // Read the user's uploaded image
        const imageData = fs.readFileSync(userImagePath);
        const base64Image = imageData.toString('base64');

        // Determine MIME type based on file extension
        const ext = path.extname(userImagePath).toLowerCase();
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.webp': 'image/webp',
            '.gif': 'image/gif'
        };
        const mimeType = mimeTypes[ext] || 'image/jpeg';

        // Prepare the prompt with image
        const contents = [
            { text: templatePrompt },
            {
                inlineData: {
                    mimeType: mimeType,
                    data: base64Image,
                },
            },
        ];

        console.log('Sending request to Gemini API...');
        console.log('Template prompt:', templatePrompt);

        // Get the AI client (lazy initialization)
        const client = getAIClient();
        if (!client) {
            throw new Error('GEMINI_API_KEY is not configured.');
        }

        // Generate content with Gemini
        // Using gemini-1.5-flash for better free tier support
        const response = await client.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: contents,
        });

        // Process the response
        if (response.candidates && response.candidates[0] && response.candidates[0].content) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    // Save the generated image
                    const timestamp = Date.now();
                    const filename = `generated-${timestamp}.png`;
                    const savePath = path.join(__dirname, '../uploads/generated-images', filename);

                    // Ensure directory exists
                    const dir = path.dirname(savePath);
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true });
                    }

                    // Decode and save the image
                    const imageBuffer = Buffer.from(part.inlineData.data, 'base64');
                    fs.writeFileSync(savePath, imageBuffer);

                    console.log('Image generated and saved:', filename);

                    return {
                        success: true,
                        imagePath: `/uploads/generated-images/${filename}`
                    };
                }
            }
        }

        // If no image in response, throw error
        throw new Error('No image generated in Gemini response');

    } catch (error) {
        console.error('Gemini AI Generation Error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

module.exports = {
    generateAIImageWithGemini
};
