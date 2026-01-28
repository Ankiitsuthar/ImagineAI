const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// Lazy initialization - only create client when needed
let openai = null;
const getOpenAIClient = () => {
    if (!openai && process.env.OPENAI_API_KEY) {
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }
    return openai;
};

/**
 * Generate AI image using OpenAI DALL-E 3
 * @param {string} userImagePath - Path to the user's uploaded image
 * @param {string} templatePrompt - The template prompt for image generation
 * @returns {Object} - Result with success status and image path or error
 */
const generateAIImageWithOpenAI = async (userImagePath, templatePrompt) => {
    try {
        // Validate API key
        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
            throw new Error('OPENAI_API_KEY is not configured. Please add your API key to .env file.');
        }

        // Get the OpenAI client (lazy initialization)
        const client = getOpenAIClient();
        if (!client) {
            throw new Error('OPENAI_API_KEY is not configured.');
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
        const dataUrl = `data:${mimeType};base64,${base64Image}`;

        console.log('Analyzing uploaded image with GPT-4 Vision...');

        // Step 1: Use GPT-4 Vision to analyze the uploaded image
        const visionResponse = await client.chat.completions.create({
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
                            image_url: {
                                url: dataUrl
                            }
                        }
                    ]
                }
            ],
            max_tokens: 500
        });

        const imageDescription = visionResponse.choices[0]?.message?.content || '';
        console.log('Image description:', imageDescription);

        // Step 2: Combine the image description with the template prompt
        const combinedPrompt = `Based on the following reference image description, apply the given style transformation.

Reference Image: ${imageDescription}

Style/Transformation to apply: ${templatePrompt}

Create a high-quality, photorealistic image that applies the requested transformation to the subject described above. Maintain the person's core features and identity while applying the style changes.`;

        console.log('Generating image with DALL-E 3...');
        console.log('Combined prompt:', combinedPrompt.substring(0, 200) + '...');

        // Step 3: Generate image with DALL-E 3
        const response = await client.images.generate({
            model: 'dall-e-3',
            prompt: combinedPrompt,
            n: 1,
            size: '1024x1024',
            quality: 'standard',
            response_format: 'b64_json'
        });

        if (response.data && response.data[0] && response.data[0].b64_json) {
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
            const imageBuffer = Buffer.from(response.data[0].b64_json, 'base64');
            fs.writeFileSync(savePath, imageBuffer);

            console.log('✅ Image generated and saved:', filename);

            return {
                success: true,
                imagePath: `/uploads/generated-images/${filename}`
            };
        }

        throw new Error('No image generated in OpenAI response');

    } catch (error) {
        console.error('OpenAI Image Generation Error:', error);

        // Check for specific error types
        let errorMessage = error.message;

        if (error.status === 429) {
            errorMessage = 'OpenAI rate limit exceeded. Please try again in a moment.';
        } else if (error.status === 400 && error.message?.includes('content_policy')) {
            errorMessage = 'Content policy violation. The image or prompt was rejected.';
        } else if (error.status === 401) {
            errorMessage = 'Invalid OpenAI API key. Please check your configuration.';
        } else if (error.status === 403) {
            errorMessage = 'Access denied. Please ensure your OpenAI account has access to DALL-E 3.';
        }

        return {
            success: false,
            error: errorMessage
        };
    }
};

module.exports = {
    generateAIImageWithOpenAI
};
