# OTP Email Verification with Rate Limiting - Setup Guide

## Overview
This guide explains how to set up the new two-step OTP verification system for user registration with rate limiting.

## Changes Made

### Backend Changes

#### 1. **New Models Created**
- **`src/models/OTPVerification.model.js`**: Stores temporary OTP data with automatic expiration after 10 minutes

#### 2. **New Services Created**
- **`src/services/emailService.js`**: Handles OTP generation and email sending using Nodemailer

#### 3. **New Middleware Created**
- **`src/middleware/rateLimiter.js`**: Implements rate limiting for:
  - **Send OTP**: 5 requests per 15 minutes per email
  - **Verify OTP**: 10 attempts per 15 minutes per email
  - **Login**: 10 attempts per 15 minutes per email

#### 4. **Updated Controllers**
- **`src/controllers/auth.controller.js`**: Added two new endpoints:
  - `sendOtp()`: Validates user data and sends OTP
  - `verifyOtp()`: Verifies OTP and creates user in database

#### 5. **Updated Routes**
- **`src/routes/auth.route.js`**: Added new routes:
  - `POST /api/auth/send-otp` - Send OTP to email
  - `POST /api/auth/verify-otp` - Verify OTP and create user
  - Rate limiting applied to send-otp, verify-otp, and login endpoints

### Frontend Changes

#### 1. **Updated RegisterPage Component**
- **`src/pages/RegisterPage.jsx`**: Implements two-step registration:
  - **Step 1**: Enter username, email, password, confirm password
  - **Step 2**: Enter 4-digit OTP from email
  - Replaced "Confirm Password" field with OTP input in verification step
  - OTP input accepts only numeric characters, max 4 digits

#### 2. **Updated AuthContext**
- **`src/context/AuthContext.jsx`**: Added Socket.IO initialization after successful registration

## Installation & Setup

### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install express-rate-limit
```

### Step 2: Configure Environment Variables

Create or update `backend/.env` file:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/chat_app
DATABASE_NAME=chat_app

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_in_production
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Environment
NODE_ENV=development
PORT=5000

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Email Configuration (Nodemailer)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
```

### Step 3: Gmail App Password Setup (Important!)

For Gmail users, you cannot use your regular password. You must use an App-Specific Password:

1. Go to https://myaccount.google.com/
2. Click "Security" in the left menu
3. Enable "2-Step Verification" if not already enabled
4. Go to "App passwords"
5. Select "Mail" and "Windows Computer" (or your device)
6. Google will generate a 16-character password
7. Copy this password and use it as `EMAIL_PASSWORD` in `.env`

**Alternative:** Use other email services by changing `EMAIL_SERVICE`:
- outlook
- yahoo
- aol
- custom SMTP configuration

### Step 4: Start the Application

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd Frontend
npm run dev
```

## Registration Flow

### User Registration Process:

1. **Step 1: Enter Details**
   - User enters: username, email, password, confirm password
   - Click "Send Verification Code"

2. **Backend Processing (Send OTP)**
   - Validates all fields
   - Checks if email/username already exists
   - Generates 4-digit OTP
   - Stores OTP with user data in `OTPVerification` collection (expires in 10 minutes)
   - Sends OTP via email

3. **Step 2: Verify OTP**
   - User receives email with 4-digit code
   - User enters code in "Enter Verification Code" field
   - Click "Verify & Create Account"

4. **Backend Processing (Verify OTP)**
   - Validates OTP matches the one sent
   - Checks OTP hasn't expired
   - Creates user in `User` collection
   - Deletes OTP verification record
   - Returns JWT tokens
   - User is logged in and redirected to home page "/"

## API Endpoints

### Send OTP
```
POST /api/auth/send-otp
Rate Limit: 5 requests per 15 minutes per email

Request Body:
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "password123",
  "passwordConfirm": "password123"
}

Success Response (200):
{
  "success": true,
  "message": "OTP sent to your email. Please verify to complete registration."
}
```

### Verify OTP
```
POST /api/auth/verify-otp
Rate Limit: 10 attempts per 15 minutes per email

Request Body:
{
  "email": "user@example.com",
  "otp": "1234"
}

Success Response (201):
{
  "success": true,
  "message": "Registration successful! Welcome!",
  "accessToken": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "johndoe",
    "email": "user@example.com"
  }
}
```

## Rate Limiting Details

### Send OTP Endpoint
- **Limit**: 5 requests per 15 minutes
- **Scope**: Per email address
- **Purpose**: Prevent spam and abuse

### Verify OTP Endpoint
- **Limit**: 10 attempts per 15 minutes
- **Scope**: Per email address
- **Purpose**: Prevent brute force attacks

### Login Endpoint
- **Limit**: 10 attempts per 15 minutes
- **Scope**: Per email address
- **Purpose**: Prevent brute force password attacks

## OTP Email Template

The OTP email includes:
- Professional HTML formatted template
- Clear 4-digit OTP display
- Expiration notice (10 minutes)
- Instruction to ignore if not requested

## Database Collections

### OTPVerification Collection
```javascript
{
  email: "user@example.com",
  otp: "1234",
  username: "johndoe",
  password: "hashed_password",
  expiresAt: ISODate("2024-04-12T12:10:00Z"),
  createdAt: ISODate("2024-04-12T12:00:00Z")
}
```
- Auto-deletes after 10 minutes using TTL index

### User Collection
```javascript
{
  _id: ObjectId,
  username: "johndoe",
  email: "user@example.com",
  password: "hashed_password",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

## Frontend Components

### RegisterPage State Management
- **step**: "register" or "verify-otp"
- **formData**: Contains username, email, password, passwordConfirm, otp
- **registeredEmail**: Stores email for OTP verification
- **loading**: Shows loading state during requests
- **error**: Displays error messages

## Security Features

1. **OTP Expiration**: 10 minutes
2. **Rate Limiting**: Prevents brute force and spam
3. **Temporary Storage**: OTP data not stored permanently
4. **Password Hashing**: Using bcrypt
5. **JWT Tokens**: Secure session management
6. **HTTP Only Cookies**: Refresh token stored securely
7. **CORS**: Configured for frontend domain only

## Testing the Registration Flow

1. **Open Frontend**: http://localhost:5173
2. **Go to Register Page**: Click "Sign in" → "Sign in" → Back to home → Click Register button
3. **Fill Registration Form**:
   - Username: `testuser`
   - Email: `your_email@gmail.com`
   - Password: `password123`
   - Confirm: `password123`
4. **Click "Send Verification Code"**
5. **Check Email**: Look for verification code
6. **Enter OTP**: Copy 4-digit code and enter in verification form
7. **Click "Verify & Create Account"**
8. **Success**: Should be redirected to home page "/"

## Troubleshooting

### Email Not Received
- Check spam/junk folder
- Verify EMAIL_USER and EMAIL_PASSWORD in .env
- Check Gmail App Password is correctly set
- Ensure NODE_ENV is not blocking emails

### OTP Expired
- OTP expires after 10 minutes
- User must click "Back to Registration" and start over
- This is intentional for security

### Rate Limit Exceeded
- Wait 15 minutes or change email address
- Clear browser cache if persisting
- Check X-RateLimit-* headers in response

### User Already Exists
- Email or username already registered
- User must log in instead
- Implement "Forgot Password" feature if needed

## Future Enhancements

1. **Resend OTP**: Allow users to request a new OTP
2. **SMS Verification**: Add SMS as alternative to email
3. **OTP Validity Display**: Show remaining time before expiration
4. **Multiple Email Verification**: Support multiple email addresses
5. **Two-Factor Authentication**: Enhance security with 2FA
6. **Email Templates**: Customizable email design

## References

- [Nodemailer Documentation](https://nodemailer.com/)
- [Express Rate Limit](https://github.com/nfriedly/express-rate-limit)
- [MongoDB TTL Indexes](https://docs.mongodb.com/manual/core/index-ttl/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
