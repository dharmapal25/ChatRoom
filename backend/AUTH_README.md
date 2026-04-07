# Authentication System with JWT

A complete login and register system with JWT token authentication for your Node.js backend.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the backend folder using `.env.example` as reference:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/auth_system
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=7d
```

### 3. Start the Server
```bash
npm start
```

## API Endpoints

### Authentication Routes (`/api/auth`)

#### 1. Register User
**POST** `/api/auth/register`

Request body:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "passwordConfirm": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

#### 2. Login User
**POST** `/api/auth/login`

Request body:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "User logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

#### 3. Get Current User (Protected)
**GET** `/api/auth/me`

Headers:
```
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "createdAt": "2026-04-07T10:00:00Z",
    "updatedAt": "2026-04-07T10:00:00Z"
  }
}
```

#### 4. Logout User (Protected)
**POST** `/api/auth/logout`

Headers:
```
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "message": "User logged out successfully"
}
```

## Features

- ✅ User Registration with validation
- ✅ User Login with password verification
- ✅ JWT Token generation and verification
- ✅ Password hashing with bcryptjs
- ✅ Protected routes with authentication middleware
- ✅ MongoDB integration with Mongoose
- ✅ Error handling
- ✅ User model with timestamps

## File Structure

```
backend/
├── src/
│   ├── models/
│   │   └── User.js              # User schema and model
│   ├── routes/
│   │   └── auth.js              # Authentication routes
│   ├── middleware/
│   │   └── auth.js              # JWT verification middleware
│   ├── config/
│   │   └── db.js                # MongoDB connection
│   └── app.js                   # Express app setup
├── server.js                    # Server entry point
├── package.json
├── .env.example
└── .env                         # Environment variables (create from example)
```

## Usage Example with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123",
    "passwordConfirm": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Current User
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <your_token_here>"
```

## Security Features

- Passwords are hashed using bcryptjs before storing in the database
- JWT tokens are used for stateless authentication
- Token expiration is configurable
- Protected routes verify the JWT before allowing access
- Input validation on all endpoints
- Unique constraints on email and username

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `201`: Created (registration successful)
- `400`: Bad request (validation errors)
- `401`: Unauthorized (invalid credentials or no token)
- `500`: Server error

## Next Steps

To extend this system, you can:
1. Add refresh token functionality
2. Add password reset functionality
3. Add email verification
4. Add role-based access control (RBAC)
5. Add Google/GitHub OAuth integration
