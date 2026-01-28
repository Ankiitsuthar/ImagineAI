// Seed script for AI Image templates across multiple collections
require('dotenv').config();
const mongoose = require('mongoose');
const Template = require('./models/Template');
const connectDB = require('./config/db');

// Collection configurations
const collections = {
    professional: {
        title: 'Professional',
        category: 'Business',
        icon: '💼',
        color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    ghibli: {
        title: 'Ghibli Style',
        category: 'Artistic',
        icon: '🎨',
        color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    creative: {
        title: 'Creative Portrait',
        category: 'Artistic',
        icon: '✨',
        color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    food: {
        title: 'Food Photography',
        category: 'Lifestyle',
        icon: '🍕',
        color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    },
    lifestyle: {
        title: 'Lifestyle',
        category: 'Lifestyle',
        icon: '🌅',
        color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    },
    wedding: {
        title: 'Wedding',
        category: 'Events',
        icon: '💍',
        color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
    },
    minimalist: {
        title: 'Minimalist',
        category: 'Artistic',
        icon: '⬜',
        color: 'linear-gradient(135deg, #e0e0e0 0%, #ffffff 100%)'
    },
    vintage: {
        title: 'Vintage',
        category: 'Artistic',
        icon: '📷',
        color: 'linear-gradient(135deg, #c9b18a 0%, #8b7355 100%)'
    }
};

// All templates organized by collection with local thumbnail paths
const templateData = [
    // Professional Collection
    { name: 'Professional Business Man Portrait', collectionId: 'professional', basePrompt: 'professional business man portrait, corporate headshot, formal attire, studio lighting, confident pose, office environment', popular: true, thumbnailUrl: '/uploads/template-thumbnails/professional-business-man.jpg' },
    { name: 'Office Corporate Look', collectionId: 'professional', basePrompt: 'corporate office professional look, modern office background, business casual, clean aesthetic', popular: true, thumbnailUrl: '/uploads/template-thumbnails/office-corporate-look.jpg' },
    { name: 'Luxury Studio Business Portrait', collectionId: 'professional', basePrompt: 'luxury studio portrait, premium business headshot, elegant lighting, high-end corporate photography', popular: true, thumbnailUrl: '/uploads/template-thumbnails/luxury-studio-business.jpg' },
    { name: 'CEO Desk Portrait', collectionId: 'professional', basePrompt: 'CEO style portrait at desk, executive office, powerful business leader, sophisticated environment', popular: false, thumbnailUrl: '/uploads/template-thumbnails/ceo-desk-portrait.jpg' },
    { name: 'Corporate Woman Headshot', collectionId: 'professional', basePrompt: 'professional woman headshot, corporate style, confident businesswoman, studio portrait', popular: false, thumbnailUrl: '/uploads/template-thumbnails/corporate-woman-headshot.jpg' },
    { name: 'Modern Office Woman Portrait', collectionId: 'professional', basePrompt: 'modern office woman portrait, contemporary workspace, professional attire, natural lighting', popular: true, thumbnailUrl: '/uploads/template-thumbnails/modern-office-woman.jpg' },

    // Ghibli Collection
    { name: 'Anime Couple Selfie', collectionId: 'ghibli', basePrompt: 'Studio Ghibli style anime couple selfie, soft colors, dreamy atmosphere, romantic anime aesthetic', popular: true, thumbnailUrl: '/uploads/template-thumbnails/anime-couple-selfie.jpg' },
    { name: 'Ghibli Couple Outdoors', collectionId: 'ghibli', basePrompt: 'Ghibli style couple outdoors, nature background, anime art style, peaceful scenery', popular: false, thumbnailUrl: '/uploads/template-thumbnails/ghibli-couple-outdoors.jpg' },
    { name: 'Anime Boy Portrait', collectionId: 'ghibli', basePrompt: 'anime boy portrait, Studio Ghibli style, soft lighting, detailed anime artwork', popular: true, thumbnailUrl: '/uploads/template-thumbnails/anime-boy-portrait.jpg' },
    { name: 'Classic Anime Style', collectionId: 'ghibli', basePrompt: 'classic anime portrait, traditional Japanese animation style, vibrant colors, expressive eyes', popular: true, thumbnailUrl: '/uploads/template-thumbnails/classic-anime-style.jpg' },
    { name: 'Stylish Anime Male', collectionId: 'ghibli', basePrompt: 'stylish anime male portrait, modern anime aesthetic, cool pose, detailed character design', popular: true, thumbnailUrl: '/uploads/template-thumbnails/stylish-anime-male.jpg' },
    { name: 'Cute Anime Girl', collectionId: 'ghibli', basePrompt: 'cute anime girl portrait, kawaii style, soft pastel colors, adorable expression', popular: false, thumbnailUrl: '/uploads/template-thumbnails/cute-anime-girl.jpg' },

    // Creative Collection
    { name: 'Natural Green Background Portrait', collectionId: 'creative', basePrompt: 'portrait with natural green background, lush vegetation, organic feel, environmental portrait', popular: true, thumbnailUrl: '/uploads/template-thumbnails/natural-green-background.jpg' },
    { name: 'Black & White Cinematic', collectionId: 'creative', basePrompt: 'black and white cinematic portrait, dramatic lighting, film noir aesthetic, artistic composition', popular: true, thumbnailUrl: '/uploads/template-thumbnails/black-white-cinematic.jpg' },
    { name: 'Soft Window Light Portrait', collectionId: 'creative', basePrompt: 'soft window light portrait, natural lighting, gentle shadows, intimate atmosphere', popular: true, thumbnailUrl: '/uploads/template-thumbnails/soft-window-light.jpg' },
    { name: 'Golden Hour Cinematic', collectionId: 'creative', basePrompt: 'golden hour portrait, warm sunset lighting, cinematic color grading, atmospheric', popular: false, thumbnailUrl: '/uploads/template-thumbnails/golden-hour-cinematic.jpg' },
    { name: 'Travel Aesthetic Portrait', collectionId: 'creative', basePrompt: 'travel aesthetic portrait, wanderlust vibes, adventure photography, scenic background', popular: true, thumbnailUrl: '/uploads/template-thumbnails/travel-aesthetic.jpg' },
    { name: 'Traditional Indian Portrait', collectionId: 'creative', basePrompt: 'traditional Indian portrait, cultural attire, rich colors, heritage photography', popular: false, thumbnailUrl: '/uploads/template-thumbnails/traditional-indian.jpg' },

    // Food Collection
    { name: 'Layered Tiramisu Dessert', collectionId: 'food', basePrompt: 'layered tiramisu dessert photography, elegant plating, coffee and cocoa, professional food styling', popular: true, thumbnailUrl: '/uploads/template-thumbnails/layered-tiramisu.jpg' },
    { name: 'Ice Cream Sundae Bowls', collectionId: 'food', basePrompt: 'ice cream sundae bowls, colorful toppings, summer vibes, appetizing food photography', popular: true, thumbnailUrl: '/uploads/template-thumbnails/ice-cream-sundae.jpg' },
    { name: 'Pink Drip Donut Milkshake', collectionId: 'food', basePrompt: 'pink drip donut milkshake, indulgent treat, Instagram worthy, pastel aesthetic', popular: true, thumbnailUrl: '/uploads/template-thumbnails/pink-donut-milkshake.jpg' },
    { name: 'Mini Waffles with Fruits', collectionId: 'food', basePrompt: 'mini waffles with fresh fruits, breakfast styling, natural lighting, delicious presentation', popular: false, thumbnailUrl: '/uploads/template-thumbnails/mini-waffles-fruits.jpg' },
    { name: 'Cheesecake with Strawberry', collectionId: 'food', basePrompt: 'cheesecake with strawberry sauce, dessert photography, creamy texture, appetizing slice', popular: true, thumbnailUrl: '/uploads/template-thumbnails/cheesecake-strawberry.jpg' },
    { name: 'Juicy Burger Portrait', collectionId: 'food', basePrompt: 'juicy burger close-up, melting cheese, fresh ingredients, mouthwatering food photography', popular: false, thumbnailUrl: '/uploads/template-thumbnails/juicy-burger.jpg' },

    // Lifestyle Collection
    { name: 'Morning Coffee Aesthetic', collectionId: 'lifestyle', basePrompt: 'morning coffee aesthetic, cozy vibes, warm lighting, lifestyle photography', popular: true, thumbnailUrl: '/uploads/template-thumbnails/morning-coffee.jpg' },
    { name: 'Cozy Reading Corner', collectionId: 'lifestyle', basePrompt: 'cozy reading corner, books and blankets, warm atmosphere, relaxing lifestyle', popular: true, thumbnailUrl: '/uploads/template-thumbnails/cozy-reading-corner.jpg' },
    { name: 'Beach Sunset Vibes', collectionId: 'lifestyle', basePrompt: 'beach sunset vibes, golden hour, ocean waves, relaxed summer lifestyle', popular: true, thumbnailUrl: '/uploads/template-thumbnails/beach-sunset-vibes.jpg' },
    { name: 'Urban Explorer', collectionId: 'lifestyle', basePrompt: 'urban explorer street style, city adventure, modern lifestyle, architectural backdrop', popular: false, thumbnailUrl: '/uploads/template-thumbnails/urban-explorer.jpg' },
    { name: 'Nature Walk Portrait', collectionId: 'lifestyle', basePrompt: 'nature walk portrait, hiking adventure, outdoor lifestyle, natural environment', popular: false, thumbnailUrl: '/uploads/template-thumbnails/nature-walk.jpg' },
    { name: 'Home Office Setup', collectionId: 'lifestyle', basePrompt: 'home office setup, work from home aesthetic, productive workspace, modern lifestyle', popular: true, thumbnailUrl: '/uploads/template-thumbnails/home-office-setup.jpg' },

    // Wedding Collection
    { name: 'Elegant Bridal Portrait', collectionId: 'wedding', basePrompt: 'elegant bridal portrait, wedding dress, romantic lighting, timeless bride photography', popular: true, thumbnailUrl: '/uploads/template-thumbnails/elegant-bridal.jpg' },
    { name: 'Romantic Couple Shot', collectionId: 'wedding', basePrompt: 'romantic wedding couple, love and connection, beautiful backdrop, emotional moment', popular: true, thumbnailUrl: '/uploads/template-thumbnails/romantic-couple.jpg' },
    { name: 'Ring Detail Close-up', collectionId: 'wedding', basePrompt: 'wedding ring detail close-up, diamond sparkle, romantic hands, jewelry photography', popular: false, thumbnailUrl: '/uploads/template-thumbnails/ring-detail.jpg' },
    { name: 'Venue Entrance Shot', collectionId: 'wedding', basePrompt: 'wedding venue entrance, grand architecture, couple arrival, cinematic wedding photography', popular: true, thumbnailUrl: '/uploads/template-thumbnails/venue-entrance.jpg' },
    { name: 'First Dance Moment', collectionId: 'wedding', basePrompt: 'first dance wedding moment, ballroom dancing, romantic spotlight, emotional celebration', popular: true, thumbnailUrl: '/uploads/template-thumbnails/first-dance.jpg' },
    { name: 'Bridesmaids Group', collectionId: 'wedding', basePrompt: 'bridesmaids group photo, matching dresses, flower bouquets, joyful celebration', popular: false, thumbnailUrl: '/uploads/template-thumbnails/bridesmaids-group.jpg' },

    // Minimalist Collection
    { name: 'Clean White Background', collectionId: 'minimalist', basePrompt: 'clean white background portrait, minimalist aesthetic, simple composition, focus on subject', popular: true, thumbnailUrl: '/uploads/template-thumbnails/clean-white-background.jpg' },
    { name: 'Simple Shadow Play', collectionId: 'minimalist', basePrompt: 'minimalist shadow play, geometric shapes, light and shadow, artistic simplicity', popular: true, thumbnailUrl: '/uploads/template-thumbnails/simple-shadow-play.jpg' },
    { name: 'Monochrome Elegance', collectionId: 'minimalist', basePrompt: 'monochrome elegance portrait, single color theme, refined aesthetic, understated beauty', popular: false, thumbnailUrl: '/uploads/template-thumbnails/monochrome-elegance.jpg' },
    { name: 'Negative Space Portrait', collectionId: 'minimalist', basePrompt: 'negative space portrait, empty composition, breathing room, zen aesthetic', popular: true, thumbnailUrl: '/uploads/template-thumbnails/negative-space.jpg' },
    { name: 'Geometric Lines', collectionId: 'minimalist', basePrompt: 'geometric lines portrait, architectural elements, structured composition, modern minimalism', popular: false, thumbnailUrl: '/uploads/template-thumbnails/geometric-lines.jpg' },
    { name: 'Soft Neutral Tones', collectionId: 'minimalist', basePrompt: 'soft neutral tones portrait, beige and cream, calming palette, serene atmosphere', popular: true, thumbnailUrl: '/uploads/template-thumbnails/soft-neutral-tones.jpg' },

    // Vintage Collection
    { name: 'Film Grain Aesthetic', collectionId: 'vintage', basePrompt: 'film grain aesthetic portrait, 35mm film look, nostalgic photography, analog texture', popular: true, thumbnailUrl: '/uploads/template-thumbnails/film-grain-aesthetic.jpg' },
    { name: 'Sepia Tone Classic', collectionId: 'vintage', basePrompt: 'sepia tone classic portrait, old photograph style, timeless vintage, antique feel', popular: true, thumbnailUrl: '/uploads/template-thumbnails/sepia-tone-classic.jpg' },
    { name: 'Polaroid Style', collectionId: 'vintage', basePrompt: 'polaroid style instant photo, retro borders, faded colors, nostalgic memory', popular: true, thumbnailUrl: '/uploads/template-thumbnails/polaroid-style.jpg' },
    { name: '70s Color Palette', collectionId: 'vintage', basePrompt: '70s color palette portrait, warm orange tones, disco era, groovy retro style', popular: false, thumbnailUrl: '/uploads/template-thumbnails/70s-color-palette.jpg' },
    { name: 'Old Hollywood Glamour', collectionId: 'vintage', basePrompt: 'old Hollywood glamour portrait, golden age cinema, classic beauty, movie star aesthetic', popular: true, thumbnailUrl: '/uploads/template-thumbnails/old-hollywood-glamour.jpg' },
    { name: 'Retro Camera Effect', collectionId: 'vintage', basePrompt: 'retro camera effect, vintage lens look, soft focus, analog photography simulation', popular: false, thumbnailUrl: '/uploads/template-thumbnails/retro-camera-effect.jpg' }
];

// Build complete template objects
const buildTemplates = () => {
    return templateData.map(template => {
        const collection = collections[template.collectionId];
        return {
            name: template.name,
            thumbnailUrl: template.thumbnailUrl,
            basePrompt: template.basePrompt,
            creditCost: 1,
            category: collection.category,
            collectionId: template.collectionId,
            collectionTitle: collection.title,
            collectionIcon: collection.icon,
            collectionColor: collection.color,
            popular: template.popular
        };
    });
};

const seedTemplates = async () => {
    try {
        await connectDB();

        console.log('Clearing existing templates...');
        await Template.deleteMany({});

        const templates = buildTemplates();
        console.log(`Seeding ${templates.length} templates across ${Object.keys(collections).length} collections...`);

        await Template.insertMany(templates);

        // Log summary by collection
        console.log('\n📊 Template Summary:');
        for (const [id, collection] of Object.entries(collections)) {
            const count = templates.filter(t => t.collectionId === id).length;
            console.log(`  ${collection.icon} ${collection.title}: ${count} templates`);
        }

        console.log(`\n✅ Successfully seeded ${templates.length} templates`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding templates:', error);
        process.exit(1);
    }
};

// Run seed if called directly
if (require.main === module) {
    seedTemplates();
}

module.exports = seedTemplates;
