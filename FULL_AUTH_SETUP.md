# Full Authentication System with Refresh Tokens

## Complete Setup Guide

### Backend Setup

#### 1. Install Dependencies
```bash
cd backend
npm install
```

#### 2. Configure Environment Variables
Create `.env` file in backend directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/auth_system
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_in_production
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

#### 3. Start Backend Server
```bash
npm start
```

The server will run on `http://localhost:5000`

---

### Frontend Setup

#### 1. Install Dependencies
```bash
cd Frontend
npm install react-router-dom
```

#### 2. Configure Environment Variables
Create `.env.local` file in Frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
```

#### 3. Update App.jsx
Replace your `App.jsx` with:

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <div className="min-h-screen bg-white p-8">
                  <h1 className="text-3xl font-bold text-gray-900">
                    Welcome to Your App!
                  </h1>
                  <p className="mt-4 text-gray-600">
                    You are authenticated and can access protected content.
                  </p>
                </div>
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
```

#### 4. Start Frontend Dev Server
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

---

## Architecture Overview

### Token System

```
┌─────────────────────────────────────────┐
│         LOGIN / REGISTER                 │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  Backend Sets refreshToken in Cookie    │
│  Returns accessToken in Response Body   │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  Frontend Stores accessToken in Memory  │
│  Browser Stores refreshToken in Cookie  │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│   Each Request Includes accessToken     │
│   in Authorization Header               │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  accessToken Expires (15 minutes)       │
│  API Returns 401 Unauthorized           │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  Axios Interceptor Detects 401          │
│  Calls /auth/refresh with refreshToken  │
│  (automatically sent in cookies)        │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  Backend Validates refreshToken         │
│  Returns New accessToken                │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  Frontend Updates accessToken in Memory │
│  Retries Original Request               │
└─────────────────────────────────────────┘
```

### File Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── auth.controller.js       # ✅ Updated with refresh logic
│   ├── routes/
│   │   └── auth.route.js            # ✅ Updated with refresh endpoint
│   ├── middleware/
│   │   └── auth.js                  # JWT verification
│   ├── models/
│   │   └── User.model.js            # User schema
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   └── app.js                       # ✅ Updated with CORS & cookies
├── server.js
├── package.json                     # ✅ Added cookie-parser & cors
└── .env                             # ✅ Updated env vars

Frontend/src/
├── services/
│   ├── api.js                       # ✅ Axios with interceptors
│   └── authService.js               # ✅ Auth API calls
├── context/
│   └── AuthContext.jsx              # ✅ Global auth state
├── components/
│   └── PrivateRoute.jsx             # ✅ Protected routes
├── pages/
│   ├── LoginPage.jsx                # ✅ Login form
│   └── RegisterPage.jsx             # ✅ Register form
└── App.jsx                          # ✅ Updated with routing
```

---

## API Endpoints

### 1. Register User
**POST** `/api/auth/register`

Request:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword",
  "passwordConfirm": "securepassword"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_id",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

Cookie Set: `refreshToken` (httpOnly, secure, sameSite=strict)

---

### 2. Login User
**POST** `/api/auth/login`

Request:
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

Response:
```json
{
  "success": true,
  "message": "User logged in successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_id",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

Cookie Set: `refreshToken` (httpOnly, secure, sameSite=strict)

---

### 3. Refresh Token
**POST** `/api/auth/refresh`

Headers: None needed (refreshToken sent in cookies automatically)

Response:
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### 4. Get Current User
**GET** `/api/auth/me`

Headers:
```
Authorization: Bearer <accessToken>
```

Response:
```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "2026-04-08T10:00:00Z",
    "updatedAt": "2026-04-08T10:00:00Z"
  }
}
```

---

### 5. Logout User
**POST** `/api/auth/logout`

Headers:
```
Authorization: Bearer <accessToken>
```

Response:
```json
{
  "success": true,
  "message": "User logged out successfully"
}
```

Effect: Clears refreshToken cookie on backend

---

## Using Auth in Components

### With useAuth Hook
```jsx
import { useAuth } from '../context/AuthContext';

function UserProfile() {
  const { user, isAuthenticated, logout, error } = useAuth();

  if (!isAuthenticated) {
    return <p>Please log in</p>;
  }

  return (
    <div>
      <h1>Welcome, {user.username}!</h1>
      <p>Email: {user.email}</p>
      <button onClick={logout}>Logout</button>
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}

export default UserProfile;
```

### Making Protected API Calls
```jsx
import API from '../services/api';

async function fetchUserData() {
  try {
    const { data } = await API.get('/users/profile');
    console.log(data);
  } catch (error) {
    console.error('Failed to fetch:', error);
    // Automatically handled by interceptor
  }
}
```

---

## Security Features

✅ **Access Token (Short-lived)** - 15 minutes, stored in memory
✅ **Refresh Token (Long-lived)** - 7 days, stored in httpOnly cookie
✅ **Automatic Token Refresh** - Seamless background refresh
✅ **CORS with Credentials** - Cookies sent with requests
✅ **Password Hashing** - bcryptjs with salt rounds
✅ **Protected Routes** - Frontend route guards
✅ **JWT Verification** - Backend middleware validation

---

## Testing the Flow

### 1. Register New User
Navigate to `http://localhost:5173/register`
- Fill in credentials
- Click "Sign up"
- Redirected to home page

### 2. Login
Navigate to `http://localhost:5173/login`
- Enter email and password
- Click "Sign in"
- Redirected to home page

### 3. Verify Protected Route
Try accessing `http://localhost:5173/` without logging in
- Redirected to `/login`

### 4. Test Token Refresh
The refresh happens automatically:
1. After 15 minutes, accessToken expires
2. Next API call triggers refresh
3. New accessToken obtained silently
4. Request retried automatically

### 5. Logout
Click logout button
- Logged out successfully
- Redirected to login page

---

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Make sure `withCredentials: true` is set in Axios

### Cookies Not Set
- Check if `secure: false` in development
- Verify `sameSite: 'strict'` is appropriate for your use case

### Token Not Refreshing
- Check browser DevTools → Network → Cookies
- Verify `refreshToken` cookie is present
- Check backend logs for refresh endpoint errors

### Infinite Redirect Loop
- Clear localStorage and cookies
- Restart both servers
- Check JWT_SECRET and JWT_REFRESH_SECRET are set

---

## Production Checklist

- [ ] Set secure environment variables
- [ ] Use HTTPS (set `secure: true` for cookies)
- [ ] Change JWT_SECRET and JWT_REFRESH_SECRET
- [ ] Set NODE_ENV=production
- [ ] Update FRONTEND_URL to production domain
- [ ] Configure CORS properly for production domain
- [ ] Enable HTTPS on backend
- [ ] Use a secret management service (not .env)
- [ ] Monitor token refresh failures
- [ ] Set up proper error logging
