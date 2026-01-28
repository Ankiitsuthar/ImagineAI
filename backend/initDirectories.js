const fs = require('fs');
const path = require('path');

// Define all required directories
const directories = [
    'uploads',
    'uploads/inputs',
    'uploads/outputs',
    'uploads/thumbnails'
];

const initDirectories = () => {
    console.log('\n🔧 Directory Initialization Script');
    console.log('===================================\n');

    let createdCount = 0;
    let existingCount = 0;

    directories.forEach(dir => {
        const dirPath = path.join(__dirname, dir);

        if (!fs.existsSync(dirPath)) {
            try {
                fs.mkdirSync(dirPath, { recursive: true });
                console.log(`✅ Created: ${dir}`);
                createdCount++;
            } catch (error) {
                console.error(`❌ Failed to create ${dir}:`, error.message);
            }
        } else {
            console.log(`ℹ️  Already exists: ${dir}`);
            existingCount++;
        }
    });

    console.log('\n📊 Summary:');
    console.log(`   Created: ${createdCount} directories`);
    console.log(`   Already existed: ${existingCount} directories`);
    console.log(`   Total: ${directories.length} directories\n`);

    if (createdCount > 0) {
        console.log('✅ Directory initialization complete!\n');
    } else {
        console.log('✅ All directories already exist!\n');
    }
};

// Run the script
initDirectories();
