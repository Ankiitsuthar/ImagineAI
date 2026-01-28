# ImagineAI Backend - Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Required environment variables:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `REPLICATE_API_TOKEN` - Replicate API token for AI generation
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

### 3. Initialize Directories
```bash
npm run setup
```

This creates all required upload directories.

### 4. Create Admin User
```bash
npm run create:admin
```

Follow the prompts to create an admin account.

### 5. Seed Templates (Optional)
```bash
npm run seed:templates
```

This populates the database with 12 wedding-themed templates.

### 6. Start Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server will start on `http://localhost:5000`

---

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run setup` - Initialize upload directories
- `npm run create:admin` - Create admin user interactively
- `npm run seed:templates` - Seed database with templates

---

## API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

---

## Project Structure

```
backend/
├── config/
│   ├── db.js              # Database connection
│   ├── upload.js          # Multer upload configuration
│   └── validateEnv.js     # Environment validation
├── controllers/
│   ├── authController.js
│   ├── contactController.js
│   ├── generationController.js
│   ├── orderController.js
│   ├── templateController.js
│   └── userController.js
├── middleware/
│   └── auth.js            # JWT authentication
├── models/
│   ├── Contact.js
│   ├── Generation.js
│   ├── Order.js
│   ├── Template.js
│   └── User.js
├── routes/
│   ├── authRoutes.js
│   ├── contactRoutes.js
│   ├── generationRoutes.js
│   ├── orderRoutes.js
│   ├── templateRoutes.js
│   └── userRoutes.js
├── uploads/               # Upload directories (auto-created)
│   ├── user-images/
│   ├── generated-images/
│   └── template-thumbnails/
├── utils/
│   └── aiService.js       # Replicate AI integration
├── .env.example           # Environment template
├── createAdmin.js         # Admin creation script
├── initDirectories.js     # Directory setup script
├── package.json
├── seedTemplates.js       # Template seeding script
└── server.js              # Main server file
```

---

## Features

✅ **Authentication**
- User registration and login
- Admin authentication
- JWT token-based auth
- Password hashing with bcrypt

✅ **Template Management**
- CRUD operations for templates
- Wedding-specific categories
- Template thumbnails
- Active/inactive status

✅ **AI Image Generation**
- Replicate API integration
- Credit-based system
- Generation history
- Image download

✅ **User Management**
- User profiles
- Admin user management
- Credit management
- User statistics

✅ **Payment System**
- Stripe integration
- Credit packages
- Webhook handling
- Order history

✅ **Contact Form**
- Public contact submissions
- Admin management
- Status tracking

---

## Database Collections

- `users` - User accounts (users and admins)
- `templates` - AI generation templates
- `generations` - Image generation records
- `orders` - Payment orders
- `contacts` - Contact form submissions

---

## Environment Variables

### Required
```env
MONGODB_URI=mongodb://localhost:27017/ai-image-saas
JWT_SECRET=your_jwt_secret_key
REPLICATE_API_TOKEN=your_replicate_token
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Optional
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Email (Optional)
```env
ADMIN_EMAIL=admin@example.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

---

## Testing

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Create Test User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Contact Form
```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Test message"
  }'
```

---

## Production Deployment

### 1. Set Environment Variables
Set all required environment variables in your hosting platform.

### 2. Build & Deploy
```bash
npm install --production
npm start
```

### 3. Database
Ensure MongoDB is accessible from your server.

### 4. File Storage
Ensure the `uploads/` directory is writable and persistent.

### 5. Stripe Webhook
Configure Stripe webhook URL:
```
https://your-domain.com/api/orders/webhook
```

---

## Troubleshooting

### Server won't start
- Check environment variables are set correctly
- Verify MongoDB connection string
- Run `npm run setup` to create directories

### Image generation fails
- Verify `REPLICATE_API_TOKEN` is valid
- Check Replicate API quota
- Ensure upload directories exist and are writable

### Payments not working
- Verify Stripe keys are correct
- Check webhook secret matches Stripe dashboard
- Test with Stripe CLI locally

---

## Support

For issues or questions, please check:
- [API Documentation](./API_DOCUMENTATION.md)
- [Backend Updates](./BACKEND_UPDATES.md)
