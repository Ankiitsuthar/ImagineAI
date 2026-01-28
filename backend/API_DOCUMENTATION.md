# PreWedding AI - Backend API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

**Access:** Public

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `201 Created`
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "credits": 5,
  "token": "jwt_token_here"
}
```

---

### Login User
**POST** `/auth/login`

**Access:** Public

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "credits": 5,
  "token": "jwt_token_here"
}
```

---

### Admin Login
**POST** `/auth/admin/login`

**Access:** Public

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "adminpass"
}
```

**Response:** `200 OK`
```json
{
  "_id": "admin_id",
  "name": "Admin User",
  "email": "admin@example.com",
  "role": "admin",
  "token": "jwt_token_here"
}
```

---

## Template Endpoints

### Get All Templates
**GET** `/templates`

**Access:** Public

**Response:** `200 OK`
```json
[
  {
    "_id": "template_id",
    "name": "Classic Wedding",
    "description": "Traditional wedding theme",
    "category": "Traditional",
    "thumbnail": "/uploads/template-thumbnails/image.jpg",
    "prompt": "AI prompt for generation",
    "creditCost": 2,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### Get Template by ID
**GET** `/templates/:id`

**Access:** Public

**Response:** `200 OK`
```json
{
  "_id": "template_id",
  "name": "Classic Wedding",
  "description": "Traditional wedding theme",
  "category": "Traditional",
  "thumbnail": "/uploads/template-thumbnails/image.jpg",
  "prompt": "AI prompt for generation",
  "creditCost": 2,
  "isActive": true
}
```

---

### Create Template (Admin)
**POST** `/templates`

**Access:** Admin only

**Content-Type:** `multipart/form-data`

**Form Data:**
- `name` (string, required)
- `description` (string, required)
- `category` (string, required)
- `prompt` (string, required)
- `creditCost` (number, required)
- `thumbnail` (file, required)

**Response:** `201 Created`

---

### Update Template (Admin)
**PUT** `/templates/:id`

**Access:** Admin only

**Content-Type:** `multipart/form-data`

**Form Data:**
- `name` (string, optional)
- `description` (string, optional)
- `category` (string, optional)
- `prompt` (string, optional)
- `creditCost` (number, optional)
- `isActive` (boolean, optional)
- `thumbnail` (file, optional)

**Response:** `200 OK`

---

### Delete Template (Admin)
**DELETE** `/templates/:id`

**Access:** Admin only

**Response:** `200 OK`
```json
{
  "message": "Template deleted successfully"
}
```

---

## Generation Endpoints

### Generate AI Image
**POST** `/generations`

**Access:** Private (authenticated users)

**Content-Type:** `multipart/form-data`

**Form Data:**
- `image` (file, required) - User's photo
- `templateId` (string, required) - Template to use

**Response:** `201 Created`
```json
{
  "message": "Image generation started",
  "generationId": "generation_id",
  "status": "processing",
  "creditsRemaining": 3
}
```

---

### Get Generation History
**GET** `/generations?page=1&limit=20`

**Access:** Private

**Query Parameters:**
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 20)

**Response:** `200 OK`
```json
{
  "generations": [
    {
      "_id": "generation_id",
      "user": "user_id",
      "template": {
        "_id": "template_id",
        "name": "Classic Wedding",
        "category": "Traditional"
      },
      "originalImage": "/uploads/user-images/user-123.jpg",
      "generatedImage": "/uploads/generated-images/generated-456.png",
      "creditsUsed": 2,
      "status": "completed",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "currentPage": 1,
  "totalPages": 5,
  "total": 100
}
```

---

### Get Generation Status
**GET** `/generations/:id`

**Access:** Private (owner or admin)

**Response:** `200 OK`
```json
{
  "_id": "generation_id",
  "user": "user_id",
  "template": {
    "_id": "template_id",
    "name": "Classic Wedding",
    "category": "Traditional"
  },
  "originalImage": "/uploads/user-images/user-123.jpg",
  "generatedImage": "/uploads/generated-images/generated-456.png",
  "creditsUsed": 2,
  "status": "completed",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### Download Generated Image
**GET** `/generations/:id/download`

**Access:** Private (owner or admin)

**Response:** `200 OK` (Binary file download)

---

## User Endpoints

### Get User Profile
**GET** `/users/profile`

**Access:** Private

**Response:** `200 OK`
```json
{
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "credits": 5,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "stats": {
    "totalGenerations": 10,
    "completedGenerations": 8
  }
}
```

---

### Update User Profile
**PUT** `/users/profile`

**Access:** Private

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}
```

**Response:** `200 OK`

---

### Get All Users (Admin)
**GET** `/users?page=1&limit=20&search=john`

**Access:** Admin only

**Query Parameters:**
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 20)
- `search` (string, optional) - Search by name or email

**Response:** `200 OK`
```json
{
  "users": [...],
  "currentPage": 1,
  "totalPages": 5,
  "total": 100
}
```

---

### Get User by ID (Admin)
**GET** `/users/:id`

**Access:** Admin only

**Response:** `200 OK`
```json
{
  "user": {...},
  "generations": [...],
  "totalGenerations": 10
}
```

---

### Update User Credits (Admin)
**PUT** `/users/:id/credits`

**Access:** Admin only

**Request Body:**
```json
{
  "credits": 100
}
```

**Response:** `200 OK`

---

### Toggle User Status (Admin)
**PUT** `/users/:id/toggle-status`

**Access:** Admin only

**Response:** `200 OK`
```json
{
  "message": "User enabled successfully",
  "user": {...}
}
```

---

## Order Endpoints

### Get Credit Packages
**GET** `/orders/packages`

**Access:** Public

**Response:** `200 OK`
```json
[
  {
    "type": "starter",
    "credits": 10,
    "price": 999,
    "name": "Starter Pack",
    "priceDisplay": "$9.99"
  },
  {
    "type": "popular",
    "credits": 50,
    "price": 3999,
    "name": "Popular Pack",
    "priceDisplay": "$39.99"
  },
  {
    "type": "premium",
    "credits": 100,
    "price": 6999,
    "name": "Premium Pack",
    "priceDisplay": "$69.99"
  }
]
```

---

### Create Order
**POST** `/orders/create`

**Access:** Private

**Request Body:**
```json
{
  "packageType": "popular"
}
```

**Response:** `201 Created`
```json
{
  "clientSecret": "stripe_client_secret",
  "orderId": "order_id"
}
```

---

### Get User Orders
**GET** `/orders?page=1&limit=20`

**Access:** Private

**Response:** `200 OK`
```json
{
  "orders": [...],
  "currentPage": 1,
  "totalPages": 3,
  "total": 50
}
```

---

### Get All Orders (Admin)
**GET** `/orders/all?page=1&limit=20&status=completed`

**Access:** Admin only

**Query Parameters:**
- `page` (number, optional)
- `limit` (number, optional)
- `status` (string, optional) - Filter by status

**Response:** `200 OK`
```json
{
  "orders": [...],
  "currentPage": 1,
  "totalPages": 10,
  "total": 200,
  "totalRevenue": 5000.00
}
```

---

### Stripe Webhook
**POST** `/orders/webhook`

**Access:** Public (Stripe only)

**Note:** This endpoint uses raw body parsing for Stripe signature verification.

---

## Contact Endpoints

### Submit Contact Form
**POST** `/contact`

**Access:** Public

**Request Body:**
```json
{
  "name": "John & Jane Doe",
  "email": "john@example.com",
  "eventDate": "2026-06-15",
  "message": "We're interested in your services..."
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Thank you for your message! We will get back to you within 24 hours.",
  "data": {
    "id": "contact_id",
    "submittedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Get All Contact Submissions (Admin)
**GET** `/contact/all?status=pending&page=1&limit=20`

**Access:** Admin only

**Query Parameters:**
- `status` (string, optional) - Filter by status
- `page` (number, optional)
- `limit` (number, optional)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "contacts": [...],
    "totalPages": 5,
    "currentPage": 1,
    "total": 100
  }
}
```

---

### Update Contact Status (Admin)
**PUT** `/contact/:id/status`

**Access:** Admin only

**Request Body:**
```json
{
  "status": "responded"
}
```

**Response:** `200 OK`

---

## Health Check

### Server Health
**GET** `/health`

**Access:** Public

**Response:** `200 OK`
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345.67,
  "environment": "development",
  "database": {
    "status": "connected",
    "name": "ai-image-saas"
  },
  "services": {
    "replicate": true,
    "stripe": true
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "message": "Error description"
}
```

### 401 Unauthorized
```json
{
  "message": "Not authorized, no token"
}
```

### 403 Forbidden
```json
{
  "message": "Not authorized as admin"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Server error",
  "error": "Error details (development only)"
}
```

---

## Template Categories

Valid template categories:
- Traditional
- Outdoor
- Nature
- Vintage
- Contemporary
- Luxury
- Rustic
- Urban
- Fantasy
- Beach
- Garden
- Classic
- Modern
- Romantic
- Other

---

## Generation Status

Valid generation statuses:
- `processing` - AI is generating the image
- `completed` - Image generation successful
- `failed` - Image generation failed

---

## Order Status

Valid order statuses:
- `pending` - Payment pending
- `completed` - Payment successful, credits added
- `failed` - Payment failed
- `refunded` - Order refunded

---

## Contact Status

Valid contact statuses:
- `pending` - Not yet responded
- `responded` - Admin has responded
- `resolved` - Issue resolved

---

## Rate Limiting

Currently, there is no rate limiting implemented. Consider adding rate limiting for production use.

---

## CORS

CORS is configured to allow requests from:
- Development: `http://localhost:5173`
- Production: Set via `FRONTEND_URL` environment variable

---

## File Upload Limits

- User images: 10MB max
- Template thumbnails: 5MB max
- Allowed formats: JPEG, JPG, PNG, WEBP
