# Admin Panel - AI Image Generation SaaS

This directory contains admin-specific documentation and resources for managing the AI Image Generation SaaS platform.

## Admin Features

The admin panel is integrated into the main application and accessible at `/admin` route after logging in with admin credentials.

### Admin Capabilities

1. **Dashboard** (`/admin`)
   - View platform statistics
   - Total users count
   - Total orders count
   - Total revenue tracking

2. **Template Management** (`/admin/templates`)
   - Create new AI generation templates
   - Edit existing templates
   - Delete templates
   - Upload template thumbnails
   - Configure AI prompts
   - Set credit costs

3. **User Management** (`/admin/users`)
   - View all registered users
   - Search users by name or email
   - View user generation history
   - Manually adjust user credits
   - Enable/disable user accounts

4. **Order Management** (`/admin/orders`)
   - View all credit purchase orders
   - Filter by payment status
   - Track revenue
   - View transaction details

## Admin Access

### Creating an Admin User

Since there's no admin registration endpoint, you must create an admin manually:

**Method 1: Update existing user**
1. Register a normal user through the UI
2. Connect to MongoDB:
   ```bash
   mongosh
   ```
3. Switch to database:
   ```javascript
   use ai-image-saas
   ```
4. Update user role:
   ```javascript
   db.users.updateOne(
     { email: "your@email.com" },
     { $set: { role: "admin" } }
   )
   ```

**Method 2: Create admin directly**
```javascript
// First, hash your password using bcrypt
// Then insert the admin user:
db.users.insertOne({
  name: "Admin",
  email: "admin@example.com",
  password: "$2a$10$your_hashed_password_here",
  role: "admin",
  credits: 0,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Admin Login

1. Navigate to `/admin/login`
2. Enter admin email and password
3. You'll be redirected to the admin dashboard

## Admin Routes

All admin routes are protected and require admin role:

- `/admin/login` - Admin login page (public)
- `/admin` - Admin dashboard (protected)
- `/admin/templates` - Template management (protected)
- `/admin/users` - User management (protected)
- `/admin/orders` - Order management (protected)

## Admin API Endpoints

### Templates
- `POST /api/templates` - Create template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template

### Users
- `GET /api/users` - Get all users (paginated)
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id/credits` - Update user credits
- `PUT /api/users/:id/toggle-status` - Enable/disable user

### Orders
- `GET /api/orders/all` - Get all orders (paginated)

## Admin Components

The admin interface is built using the same React components as the user interface, located in:

- `frontend/src/pages/admin/AdminDashboard.jsx` - Main admin dashboard
- `frontend/src/pages/admin/AdminLogin.jsx` - Admin login page

## Future Admin Features

To complete the admin panel, you should implement:

1. **Template Management UI**
   - Full CRUD interface for templates
   - Template preview
   - Bulk operations

2. **User Management UI**
   - Advanced user search and filtering
   - Bulk credit operations
   - User activity logs

3. **Order Management UI**
   - Order details view
   - Refund processing
   - Revenue analytics

4. **Analytics Dashboard**
   - User growth charts
   - Revenue trends
   - Popular templates
   - Generation statistics

5. **System Settings**
   - Platform configuration
   - Email templates
   - Credit package management

## Security Notes

- Admin routes are protected by the `admin` middleware
- All admin actions are logged (recommended to implement)
- Admin credentials should be stored securely
- Implement 2FA for admin accounts (recommended)
- Regular security audits recommended

## Development

To test admin features during development:

1. Create an admin user as described above
2. Login at `/admin/login`
3. Test all admin functionalities
4. Check console for any errors
5. Verify database updates

## Production Deployment

Before deploying to production:

1. ✅ Create strong admin credentials
2. ✅ Implement rate limiting for admin endpoints
3. ✅ Set up admin activity logging
4. ✅ Configure backup admin accounts
5. ✅ Implement 2FA (recommended)
6. ✅ Set up monitoring and alerts
7. ✅ Regular security audits

## Support

For admin-related issues or questions, refer to:
- Main README.md in the root directory
- API documentation
- Backend controller files in `backend/controllers/`
