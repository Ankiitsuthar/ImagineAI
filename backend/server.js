require('dotenv').config();
const validateEnv = require('./config/validateEnv');
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');

// Validate environment variables
validateEnv();

// Import routes
const authRoutes = require('./routes/authRoutes');
const templateRoutes = require('./routes/templateRoutes');
const imageRoutes = require('./routes/imageRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const contactRoutes = require('./routes/contactRoutes');
const statsRoutes = require('./routes/statsRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const passport = require('passport');

// Passport Config
require('./config/passport')(passport);

// Initialize express app
const app = express();

// Connect to database
connectDB();

// CORS configuration
// app.use(cors({
//     origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//     credentials: true
// }));

const allowedOrigins = [
    "https://imagineai-three.vercel.app",
    "http://localhost:5173"
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Authorization"]
}));



// Use raw body parser for Stripe webhook route so signature verification gets the raw payload
app.use('/api/orders/webhook', bodyParser.raw({ type: 'application/json' }));

// JSON parser for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize Passport
app.use(passport.initialize());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/collections', collectionRoutes);

// Health check route
app.get('/api/health', async (req, res) => {
    const mongoose = require('mongoose');

    const health = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        database: {
            status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            name: mongoose.connection.name
        },
        services: {
            replicate: !!process.env.REPLICATE_API_TOKEN,
            payu: !!process.env.PAYU_MERCHANT_KEY
        }
    };

    const httpStatus = health.database.status === 'connected' ? 200 : 503;
    res.status(httpStatus).json(health);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// 404 handler
// app.use((req, res) => {
//     res.status(404).json({ message: 'Route not found' });
// });

// Serve frontend build (SPA Support)
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
