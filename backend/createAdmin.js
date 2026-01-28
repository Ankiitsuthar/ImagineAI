require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const User = require('./models/User');
const connectDB = require('./config/db');

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Promisify readline question
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const promoteAdmin = async () => {
    try {
        // Connect to database
        await connectDB();
        console.log('✅ Connected to database\n');

        console.log('📝 Enter email of user to promote to admin:\n');

        const email = await question('Email: ');
        if (!email || !email.match(/^\S+@\S+\.\S+$/)) {
            throw new Error('Valid email is required');
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error(`User with email ${email} not found`);
        }

        // Update role
        user.role = 'admin';
        user.credits = 1000; // Give some credits too
        await user.save();

        console.log('\n✅ User successfully promoted to Admin!');
        console.log('\n📋 Admin Details:');
        console.log(`   ID: ${user._id}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Credits: ${user.credits}`);

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error promoting user:', error.message);
        process.exit(1);
    }
};

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n\n❌ Process interrupted. Exiting...');
    process.exit(0);
});

// Run the script
console.log('\n🔧 Admin Promotion Script');
console.log('========================\n');
promoteAdmin();
