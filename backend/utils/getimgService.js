const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const GETIMG_API_URL = 'https://api.getimg.ai/v1/stable-diffusion-xl/image-to-image';

/**
 * Generate AI image using GetImg.ai API
 * @param {string} userImagePath - Path to the user's uploaded image
 * @param {string} templatePrompt - The template prompt for image generation
 * @returns {Object} - Result with success status and image path or error
 */
const generateAIImageWithGetImg = async (userImagePath, templatePrompt) => {
    try {
        // Validate API key
        if (!process.env.GETIMG_API_KEY || process.env.GETIMG_API_KEY === 'your_getimg_api_key_here') {
            throw new Error('GETIMG_API_KEY is not configured. Please add your API key to .env file.');
        }

        // Read and resize the image to fit API requirements (max 1024x1024 for SDXL)
        console.log('Processing image for GetImg.ai...');
        const imageBuffer = await sharp(userImagePath)
            .resize(1024, 1024, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .png()
            .toBuffer();

        const base64Image = imageBuffer.toString('base64');

        console.log('Sending request to GetImg.ai API...');
        console.log('Template prompt:', templatePrompt);

        // Make API request to GetImg.ai using SDXL
        const response = await fetch(GETIMG_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GETIMG_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'stable-diffusion-xl-v1-0',
                prompt: templatePrompt,
                negative_prompt: 'blurry, bad quality, distorted, ugly',
                image: base64Image,
                strength: 0.65,
                steps: 25,
                guidance: 7.5,
                output_format: 'png'
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('GetImg.ai API Error Response:', errorData);
            throw new Error(errorData.error?.message || errorData.message || `API request failed with status ${response.status}`);
        }

        const result = await response.json();

        if (result.image) {
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
            const outputBuffer = Buffer.from(result.image, 'base64');
            fs.writeFileSync(savePath, outputBuffer);

            console.log('Image generated and saved:', filename);

            return {
                success: true,
                imagePath: `/uploads/generated-images/${filename}`
            };
        } else {
            throw new Error('No image returned from GetImg.ai API');
        }

    } catch (error) {
        console.error('GetImg.ai Generation Error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

module.exports = {
    generateAIImageWithGetImg
};
