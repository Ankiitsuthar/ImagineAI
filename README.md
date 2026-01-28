# ImagineAI - AI Image Generation SaaS Platform

A complete full-stack SaaS platform for AI-powered image generation with React frontend and Node.js backend.

## 📁 Project Structure

```
AiImage/
├── backend/          # Node.js + Express backend
├── frontend/         # React frontend
├── admin/           # Admin documentation
└── README.md        # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v20.19+ or v22.12+)
- MongoDB (local or Atlas)
- Replicate API key
- Stripe API keys

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ai-image-saas
JWT_SECRET=your_secure_jwt_secret_min_32_chars
FRONTEND_URL=http://localhost:5173
REPLICATE_API_TOKEN=your_replicate_api_token
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

Start backend:
```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000
```

Start frontend:
```bash
npm run dev
```

### 3. Access the Application

- **User Interface**: http://localhost:5173
- **Admin Panel**: http://localhost:5173/admin/login
- **Backend API**: http://localhost:5000/api

## 📚 Documentation

- **Backend**: See `backend/` directory for API documentation
- **Frontend**: See `frontend/` directory for component documentation
- **Admin**: See `admin/README.md` for admin panel guide

## ✨ Features

### User Features
- 🔐 Secure authentication (JWT)
- ✨ AI image generation with templates
- 📁 Image upload (up to 10MB)
- 🎨 Multiple template categories
- ⭐ Credit-based system (5 free credits on signup)
- 📜 Generation history with downloads
- 💳 Credit purchase via Stripe

### Admin Features
- 👑 Admin dashboard with statistics
- 🎨 Template management (CRUD)
- 👥 User management
- 📦 Order tracking
- 💰 Revenue analytics

## 🛠️ Technology Stack

**Backend:**
- Node.js & Express
- MongoDB & Mongoose
- JWT Authentication
- Multer (file uploads)
- Replicate API (AI generation)
- Stripe (payments)

**Frontend:**
- React 18
- React Router
- Axios
- Modern CSS with glassmorphism
- Responsive design

## 📋 Setup Checklist

- [ ] Install Node.js and MongoDB
- [ ] Clone/copy project files
- [ ] Install backend dependencies
- [ ] Install frontend dependencies
- [ ] Configure backend `.env`
- [ ] Configure frontend `.env`
- [ ] Start MongoDB
- [ ] Start backend server
- [ ] Start frontend server
- [ ] Create admin user
- [ ] Test the application

## 🔑 Creating Admin User

1. Register a normal user via the UI
2. Connect to MongoDB:
   ```bash
   mongosh
   use ai-image-saas
   db.users.updateOne(
     { email: "your@email.com" },
     { $set: { role: "admin" } }
   )
   ```
3. Login at `/admin/login`

## 📖 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin/login` - Admin login

### Templates
- `GET /api/templates` - Get all templates
- `POST /api/templates` - Create template (admin)
- `PUT /api/templates/:id` - Update template (admin)
- `DELETE /api/templates/:id` - Delete template (admin)

### Image Generation
- `POST /api/generations` - Generate AI image
- `GET /api/generations` - Get generation history
- `GET /api/generations/:id/download` - Download image

### Users (Admin)
- `GET /api/users` - Get all users
- `PUT /api/users/:id/credits` - Update credits
- `PUT /api/users/:id/toggle-status` - Enable/disable user

### Orders
- `GET /api/orders/packages` - Get credit packages
- `POST /api/orders/create` - Create payment
- `GET /api/orders` - Get user orders
- `GET /api/orders/all` - Get all orders (admin)

## 🔧 Configuration

### Required API Keys

1. **Replicate** (AI Generation)
   - Sign up: https://replicate.com
   - Get token: https://replicate.com/account/api-tokens

2. **Stripe** (Payments)
   - Sign up: https://stripe.com
   - Get keys: https://dashboard.stripe.com/apikeys

### Environment Variables

**Backend** (`.env`):
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens (min 32 chars)
- `FRONTEND_URL` - Frontend URL for CORS
- `REPLICATE_API_TOKEN` - Replicate API token
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

**Frontend** (`.env`):
- `VITE_API_URL` - Backend API base URL

## 🧪 Testing

1. **Test User Flow:**
   - Register new user
   - Upload image
   - Select template
   - Generate AI image
   - View history
   - Download image

2. **Test Admin Flow:**
   - Admin login
   - View dashboard stats
   - Manage templates
   - Manage users
   - View orders

## 🚀 Deployment

### Backend Deployment
- Deploy to Heroku, Railway, or DigitalOcean
- Use MongoDB Atlas for database
- Configure environment variables
- Set up Stripe webhook endpoint

### Frontend Deployment
- Deploy to Vercel, Netlify, or similar
- Update `VITE_API_URL` to production backend URL
- Build: `npm run build`

## 📝 License

ISC License

## 🤝 Support

For issues or questions:
- Check documentation in each directory
- Review API endpoints
- Check console logs for errors

## 🎯 Next Steps

1. Configure API keys
2. Set up MongoDB
3. Create admin user
4. Add initial templates
5. Test image generation
6. Configure payment gateway
7. Deploy to production

---

