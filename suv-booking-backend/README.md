# 🚗 SUV Booking System - Backend

Complete backend API for SUV booking system with real-time tracking, payment integration, and admin dashboard.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (Customer/Admin)
- **Car Management**: CRUD operations for SUV fleet management
- **Driver Management**: Driver profiles, assignments, and location tracking
- **Booking System**: Complete booking lifecycle with status tracking
- **Payment Integration**: Razorpay integration with advance (25%) and remaining (75%) payment flow
- **Real-time Tracking**: Socket.IO for live driver location updates
- **Route Calculation**: Free mapping services (Nominatim + OSRM) for geocoding and routing
- **Fare Estimation**: Dynamic pricing based on distance and car type

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- Razorpay account for payment integration

## 🛠️ Installation

### 1. Clone and Install

```bash
# Navigate to backend directory
cd suv-booking-backend

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Update the `.env` file with your configurations:

```env
NODE_ENV=development
PORT=5000

# MongoDB (Local or Atlas)
MONGODB_URI=mongodb://localhost:27017/suv-booking

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
JWT_EXPIRE=7d

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Frontend
FRONTEND_URL=http://localhost:3000

# Payment Config
ADVANCE_PAYMENT_PERCENTAGE=25
RATE_PER_KM=15
```

### 3. Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**MongoDB Atlas:**
Use the connection string from your Atlas dashboard in `MONGODB_URI`

### 4. Run the Application

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will start at `http://localhost:5000`

## 📁 Project Structure

```
src/
├── config/           # Configuration files
├── controllers/      # Route controllers
├── models/          # Mongoose models
├── routes/          # API routes
├── middlewares/     # Custom middleware
├── services/        # Business logic
├── utils/           # Helper utilities
├── validators/      # Request validation
├── sockets/         # Socket.IO handlers
├── app.js          # Express app setup
└── server.js       # Server entry point
```

## 🔗 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/me` - Update profile
- `PUT /api/v1/auth/change-password` - Change password

### Cars
- `GET /api/v1/cars` - Get all cars
- `GET /api/v1/cars/available` - Get available cars
- `GET /api/v1/cars/:id` - Get single car
- `POST /api/v1/cars` - Create car (Admin)
- `PUT /api/v1/cars/:id` - Update car (Admin)
- `DELETE /api/v1/cars/:id` - Delete car (Admin)

### Drivers
- `GET /api/v1/drivers` - Get all drivers (Admin)
- `GET /api/v1/drivers/available` - Get available drivers (Admin)
- `POST /api/v1/drivers` - Create driver (Admin)
- `PUT /api/v1/drivers/:id/assign-car` - Assign car to driver (Admin)

### Bookings
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings/my-bookings` - Get user bookings
- `GET /api/v1/bookings/:id` - Get booking details
- `PUT /api/v1/bookings/:id/assign-driver` - Assign driver (Admin)
- `PUT /api/v1/bookings/:id/start` - Start trip (Admin)
- `PUT /api/v1/bookings/:id/end` - End trip (Admin)
- `PUT /api/v1/bookings/:id/cancel` - Cancel booking

### Payments
- `POST /api/v1/payments/create-advance` - Create advance payment order
- `POST /api/v1/payments/create-remaining` - Create remaining payment order
- `POST /api/v1/payments/verify` - Verify payment
- `GET /api/v1/payments/my-payments` - Get user payments

### Geo Services
- `POST /api/v1/geo/geocode` - Convert address to coordinates
- `POST /api/v1/geo/route` - Calculate route with fare
- `POST /api/v1/geo/fare-estimation` - Get fare for multiple cars

## 🔌 Socket.IO Events

### Client → Server
- `join:booking` - Join booking room
- `driver:location` - Update driver location
- `driver:status` - Update driver status

### Server → Client
- `booking:update` - Booking status update
- `driver:location` - Real-time driver location
- `driver:status` - Driver status change

## 🧪 Testing API

### Using Thunder Client / Postman

1. **Register a user:**
```json
POST http://localhost:5000/api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "password123"
}
```

2. **Login:**
```json
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

3. **Get available cars:**
```
GET http://localhost:5000/api/v1/cars/available
```

4. **Calculate route and fare:**
```json
POST http://localhost:5000/api/v1/geo/fare-estimation
Content-Type: application/json

{
  "pickupAddress": "Mumbai Airport",
  "dropAddress": "Gateway of India, Mumbai"
}
```

## 🔐 Authentication

All protected routes require JWT token in Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 🎭 User Roles

- **Customer**: Can book SUVs, view own bookings, make payments
- **Admin**: Full access to manage cars, drivers, bookings, and payments

## 💡 Tips

1. **Create Admin User**: After registration, manually update user role in MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

2. **Test Payments**: Use Razorpay test mode credentials
   - Test Card: 4111 1111 1111 1111
   - CVV: Any 3 digits
   - Expiry: Any future date

3. **Monitor Logs**: Check console for real-time updates and errors

## 🚨 Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network access (for Atlas)

**Razorpay Errors:**
- Verify API keys in `.env`
- Ensure account is activated
- Check test/live mode

**Socket.IO Not Connecting:**
- Check CORS settings in `server.js`
- Verify frontend URL in `.env`

## 📦 Production Deployment

1. Set `NODE_ENV=production`
2. Use production MongoDB URI
3. Enable Razorpay live mode
4. Configure proper CORS origins
5. Use PM2 or similar for process management

```bash
npm install -g pm2
pm2 start src/server.js --name suv-booking-api
```

## 📝 License

MIT

## 👨‍💻 Developer

Developed for SUV Booking Platform

---

**Need Help?** Check the code comments or raise an issue!