const https = require('https');
const fs = require('fs');
const path = require('path');

const thumbnailsDir = path.join(__dirname, 'uploads', 'template-thumbnails');

// Using Pexels & Pixabay image IDs (direct CDN links that don't require API)
// These are hand-picked themed images
const remainingTemplates = [
    // Creative Collection (4 remaining)
    { filename: 'soft-window-light.jpg', url: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop' },
    { filename: 'golden-hour-cinematic.jpg', url: 'https://images.pexels.com/photos/1152994/pexels-photo-1152994.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop' },
    { filename: 'travel-aesthetic.jpg', url: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop' },
    { filename: 'traditional-indian.jpg', url: 'https://images.pexels.com/photos/2170387/pexels-photo-2170387.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop' },

    // Food Collection (6)
    { filename: 'layered-tiramisu.jpg', url: 'https://images.pexels.com/photos/6880219/pexels-photo-6880219.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop' },
    { filename: 'ice-cream-sundae.jpg', url: 'https://images.pexels.com/photos/1352278/pexels-photo-1352278.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop' },
    { filename: 'pink-donut-milkshake.jpg', url: 'https://images.pexels.com/photos/1028714/pexels-photo-1028714.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop' },
    { filename: 'mini-waffles-fruits.jpg', url: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop' },
    { filename: 'cheesecake-strawberry.jpg', url: 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop' },
    { filename: 'juicy-burger.jpg', url: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop' },

    // Lifestyle Collection (6)
    { filename: 'morning-coffee.jpg', url: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop' },
    { filename: 'cozy-reading-corner.jpg', url: 'https://images.pexels.com/photos/904616/pexels-photo-904616.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop' },
    { filename: 'beach-sunset-vibes.jpg', url: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop' },
    { filename: 'urban-explorer.jpg', url: 'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop' },
    { filename: 'nature-walk.jpg', url: 'https://images.pexels.com/photos/917510/pexels-photo-917510.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop' },
    { filename: 'home-office-setup.jpg', url: 'https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop' },

    // Wedding Collection (6)
    { filename: 'elegant-bridal.jpg', url: 'https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop' },
    { filename: 'romantic-couple.jpg', url: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop' },
    { filename: 'ring-detail.jpg', url: 'https://images.pexels.com/photos/1024994/pexels-photo-1024994.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop' },
    { filename: 'venue-entrance.jpg', url: 'https://images.pexels.com/photos/169193/pexels-photo-169193.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop' },
    { filename: 'first-dance.jpg', url: 'https://images.pexels.com/photos/1043902/pexels-photo-1043902.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop' },
    { filename: 'bridesmaids-group.jpg', url: 'https://images.pexels.com/photos/1128783/pexels-photo-1128783.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop' },

    // Minimalist Collection (6)
    { filename: 'clean-white-background.jpg', url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop' },
    { filename: 'simple-shadow-play.jpg', url: 'https://images.pexels.com/photos/1310524/pexels-photo-1310524.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop' },
    { filename: 'monochrome-elegance.jpg', url: 'https://images.pexels.com/photos/1642228/pexels-photo-1642228.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop' },
    { filename: 'negative-space.jpg', url: 'https://images.pexels.com/photos/1366957/pexels-photo-1366957.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop' },
    { filename: 'geometric-lines.jpg', url: 'https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop' },
    { filename: 'soft-neutral-tones.jpg', url: 'https://images.pexels.com/photos/1386604/pexels-photo-1386604.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop' },

    // Vintage Collection (6)
    { filename: 'film-grain-aesthetic.jpg', url: 'https://images.pexels.com/photos/1374510/pexels-photo-1374510.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop' },
    { filename: 'sepia-tone-classic.jpg', url: 'https://images.pexels.com/photos/1006121/pexels-photo-1006121.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop' },
    { filename: 'polaroid-style.jpg', url: 'https://images.pexels.com/photos/995978/pexels-photo-995978.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop' },
    { filename: '70s-color-palette.jpg', url: 'https://images.pexels.com/photos/1898555/pexels-photo-1898555.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop' },
    { filename: 'old-hollywood-glamour.jpg', url: 'https://images.pexels.com/photos/1870438/pexels-photo-1870438.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop' },
    { filename: 'retro-camera-effect.jpg', url: 'https://images.pexels.com/photos/821652/pexels-photo-821652.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop' }
];

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);

        const makeRequest = (requestUrl) => {
            https.get(requestUrl, (response) => {
                if (response.statusCode === 301 || response.statusCode === 302) {
                    makeRequest(response.headers.location);
                    return;
                }

                if (response.statusCode !== 200) {
                    reject(new Error(`HTTP ${response.statusCode}`));
                    return;
                }

                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            }).on('error', (err) => {
                fs.unlink(filepath, () => { });
                reject(err);
            });
        };

        makeRequest(url);
    });
}

async function downloadStockImages() {
    console.log('📸 Downloading Pexels stock images for remaining templates...\n');

    let completed = 0;
    let failed = 0;

    for (const template of remainingTemplates) {
        const filepath = path.join(thumbnailsDir, template.filename);

        try {
            process.stdout.write(`Downloading ${template.filename}... `);
            await downloadImage(template.url, filepath);
            completed++;
            console.log('✅');

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 300));
        } catch (err) {
            failed++;
            console.log(`❌ ${err.message}`);
        }
    }

    console.log(`\n📊 Download Summary:`);
    console.log(`   ✅ Completed: ${completed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📁 Total: ${remainingTemplates.length}`);
    console.log('\n🎉 Stock image download complete!');
}

downloadStockImages().catch(console.error);
