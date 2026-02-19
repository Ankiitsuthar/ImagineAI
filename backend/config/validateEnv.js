// Environment variable validation
const validateEnv = () => {
    const required = [
        'MONGODB_URI',
        'JWT_SECRET',
        'REPLICATE_API_TOKEN',
        'PAYU_MERCHANT_KEY',
        'PAYU_SALT'
    ];

    const optional = [
        'PORT',
        'NODE_ENV',
        'FRONTEND_URL',
        'ADMIN_EMAIL',
        'SMTP_HOST',
        'SMTP_PORT',
        'SMTP_USER',
        'SMTP_PASS',
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'GOOGLE_CALLBACK_URL'
    ];

    const missing = [];
    const warnings = [];

    // Check required variables
    required.forEach(varName => {
        if (!process.env[varName]) {
            missing.push(varName);
        }
    });

    // Check optional but recommended variables
    if (!process.env.PORT) {
        warnings.push('PORT not set, defaulting to 5000');
    }
    if (!process.env.NODE_ENV) {
        warnings.push('NODE_ENV not set, defaulting to development');
    }
    if (!process.env.FRONTEND_URL) {
        warnings.push('FRONTEND_URL not set, CORS may not work correctly');
    }

    // Report results
    if (missing.length > 0) {
        console.error('\n❌ Missing required environment variables:');
        missing.forEach(varName => {
            console.error(`   - ${varName}`);
        });
        console.error('\nPlease check your .env file and ensure all required variables are set.');
        console.error('See .env.example for reference.\n');
        process.exit(1);
    }

    if (warnings.length > 0) {
        console.warn('\n⚠️  Environment warnings:');
        warnings.forEach(warning => {
            console.warn(`   - ${warning}`);
        });
        console.warn('');
    }

    console.log('✅ Environment validation passed\n');
};

module.exports = validateEnv;
