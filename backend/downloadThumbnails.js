// Script to download template thumbnail images and save them locally
const https = require('https');
const fs = require('fs');
const path = require('path');

const THUMBNAILS_DIR = path.join(__dirname, 'uploads', 'template-thumbnails');

// Ensure directory exists
if (!fs.existsSync(THUMBNAILS_DIR)) {
    fs.mkdirSync(THUMBNAILS_DIR, { recursive: true });
}

// All templates with their seed names for consistent images
const templates = [
    // Professional Collection
    { id: 'prof1', name: 'professional-business-man' },
    { id: 'prof2', name: 'office-corporate-look' },
    { id: 'prof3', name: 'luxury-studio-business' },
    { id: 'prof4', name: 'ceo-desk-portrait' },
    { id: 'prof5', name: 'corporate-woman-headshot' },
    { id: 'prof6', name: 'modern-office-woman' },

    // Ghibli Collection
    { id: 'ghibli1', name: 'anime-couple-selfie' },
    { id: 'ghibli2', name: 'ghibli-couple-outdoors' },
    { id: 'ghibli3', name: 'anime-boy-portrait' },
    { id: 'ghibli4', name: 'classic-anime-style' },
    { id: 'ghibli5', name: 'stylish-anime-male' },
    { id: 'ghibli6', name: 'cute-anime-girl' },

    // Creative Collection
    { id: 'creative1', name: 'natural-green-background' },
    { id: 'creative2', name: 'black-white-cinematic', grayscale: true },
    { id: 'creative3', name: 'soft-window-light' },
    { id: 'creative4', name: 'golden-hour-cinematic' },
    { id: 'creative5', name: 'travel-aesthetic' },
    { id: 'creative6', name: 'traditional-indian' },

    // Food Collection
    { id: 'food1', name: 'layered-tiramisu' },
    { id: 'food2', name: 'ice-cream-sundae' },
    { id: 'food3', name: 'pink-donut-milkshake' },
    { id: 'food4', name: 'mini-waffles-fruits' },
    { id: 'food5', name: 'cheesecake-strawberry' },
    { id: 'food6', name: 'juicy-burger' },

    // Lifestyle Collection
    { id: 'life1', name: 'morning-coffee' },
    { id: 'life2', name: 'cozy-reading-corner' },
    { id: 'life3', name: 'beach-sunset-vibes' },
    { id: 'life4', name: 'urban-explorer' },
    { id: 'life5', name: 'nature-walk' },
    { id: 'life6', name: 'home-office-setup' },

    // Wedding Collection
    { id: 'wedding1', name: 'elegant-bridal' },
    { id: 'wedding2', name: 'romantic-couple' },
    { id: 'wedding3', name: 'ring-detail' },
    { id: 'wedding4', name: 'venue-entrance' },
    { id: 'wedding5', name: 'first-dance' },
    { id: 'wedding6', name: 'bridesmaids-group' },

    // Minimalist Collection
    { id: 'minimal1', name: 'clean-white-background' },
    { id: 'minimal2', name: 'simple-shadow-play' },
    { id: 'minimal3', name: 'monochrome-elegance', grayscale: true },
    { id: 'minimal4', name: 'negative-space' },
    { id: 'minimal5', name: 'geometric-lines' },
    { id: 'minimal6', name: 'soft-neutral-tones' },

    // Vintage Collection
    { id: 'vintage1', name: 'film-grain-aesthetic' },
    { id: 'vintage2', name: 'sepia-tone-classic' },
    { id: 'vintage3', name: 'polaroid-style' },
    { id: 'vintage4', name: '70s-color-palette' },
    { id: 'vintage5', name: 'old-hollywood-glamour', grayscale: true },
    { id: 'vintage6', name: 'retro-camera-effect' }
];

// Download a single image
function downloadImage(template) {
    return new Promise((resolve, reject) => {
        const grayscaleParam = template.grayscale ? '?grayscale' : '';
        const url = `https://picsum.photos/seed/${template.id}/400/300${grayscaleParam}`;
        const filename = `${template.name}.jpg`;
        const filepath = path.join(THUMBNAILS_DIR, filename);

        console.log(`Downloading: ${template.name}...`);

        const file = fs.createWriteStream(filepath);

        https.get(url, (response) => {
            // Handle redirects (Picsum returns 302 redirects)
            if (response.statusCode === 302 || response.statusCode === 301) {
                https.get(response.headers.location, (redirectResponse) => {
                    redirectResponse.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        console.log(`✅ Downloaded: ${filename}`);
                        resolve({ template, filename, filepath });
                    });
                }).on('error', (err) => {
                    fs.unlink(filepath, () => { });
                    reject(err);
                });
            } else {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log(`✅ Downloaded: ${filename}`);
                    resolve({ template, filename, filepath });
                });
            }
        }).on('error', (err) => {
            fs.unlink(filepath, () => { });
            reject(err);
        });
    });
}

// Download all images sequentially with delay to avoid rate limiting
async function downloadAllImages() {
    console.log('🖼️  Starting download of template thumbnails...\n');
    console.log(`📁 Save directory: ${THUMBNAILS_DIR}\n`);

    let successful = 0;
    let failed = 0;

    for (const template of templates) {
        try {
            await downloadImage(template);
            successful++;
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error(`❌ Failed to download ${template.name}:`, error.message);
            failed++;
        }
    }

    console.log(`\n📊 Download Summary:`);
    console.log(`   ✅ Successful: ${successful}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📁 Total: ${templates.length}`);

    if (successful === templates.length) {
        console.log('\n🎉 All images downloaded successfully!');
        console.log('Now run: node seedTemplates.js to update the database');
    }
}

downloadAllImages();
