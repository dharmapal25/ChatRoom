# Bug Report & Fixes

## Bugs Found & Fixed ✅

### Bug #1: ❌ Wrong API Base URL in Frontend
**Location**: [Frontend/src/Services/api.js](Frontend/src/Services/api.js#L5)
**Problem**: API was pointing to `http://localhost:3000/api` but server runs on port `5000`
**Error**: "Failed to fetch" - Network error
**Severity**: 🔴 CRITICAL
**Status**: ✅ FIXED

```javascript
// BEFORE (WRONG) ❌
baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',

// AFTER (FIXED) ✅
baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
```

---

### Bug #2: ❌ Frontend RegisterPage Using Direct Fetch Instead of API Service
**Location**: [Frontend/src/pages/RegisterPage.jsx](Frontend/src/pages/RegisterPage.jsx)
**Problem**: Using hardcoded `fetch()` with incorrect URL instead of axios API service
**Error**: "Failed to fetch" error, CORS issues, missing interceptors
**Severity**: 🔴 CRITICAL
**Status**: ✅ FIXED

```javascript
// BEFORE (WRONG) ❌
const response = await fetch('http://localhost:5000/api/auth/send-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({...})
});

// AFTER (FIXED) ✅
import API from '../services/api';
const response = await API.post('/auth/send-otp', {
  email, username, password, passwordConfirm
});
```

---

### Bug #3: ❌ RegisterPage API Calls Not Using Authorization
**Location**: [Frontend/src/pages/RegisterPage.jsx](Frontend/src/pages/RegisterPage.jsx)
**Problem**: Direct fetch requests don't include CORS credentials or proper headers
**Severity**: 🟡 HIGH
**Status**: ✅ FIXED

```javascript
// Now uses API service with proper interceptors and credentials
const response = await API.post('/auth/send-otp', {...});
```

---

### Bug #4: ⚠️ OTPVerification Model Missing Password Encryption
**Location**: [backend/src/models/OTPVerification.model.js](backend/src/models/OTPVerification.model.js)
**Problem**: Storing plain password in temporary collection (security risk)
**Severity**: 🟡 HIGH
**Status**: ✅ FIXED

```javascript
// BEFORE (WRONG) ❌
password,

// AFTER (FIXED) ✅
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);
// Store hashedPassword in OTP collection
```

---

### Bug #5: ❌ Backend EmailService Not Checking Configuration
**Location**: [backend/src/services/emailService.js](backend/src/services/emailService.js)
**Problem**: No validation if email credentials are set in .env - crashes silently
**Severity**: 🟡 HIGH
**Status**: ✅ FIXED

```javascript
// AFTER (FIXED) ✅
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.warn('⚠️ WARNING: Email credentials not configured. OTP emails will not be sent.');
  throw new Error('Email service is not configured.');
}

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service error:', error.message);
  } else {
    console.log('✅ Email service is ready to send emails');
  }
});
```

---

## Summary of Changes

| Bug | Issue | Fix | Status |
|-----|-------|-----|--------|
| #1 | Wrong API Port (3000 → 5000) | Updated baseURL in api.js | ✅ |
| #2 | Using fetch() instead of API service | Use axios API with interceptors | ✅ |
| #3 | Missing auth headers/CORS | Proper error handling in API | ✅ |
| #4 | Plain password in OTP storage | Hash password with bcrypt | ✅ |
| #5 | No email config validation | Add configuration checks | ✅ |

---

## Testing Checklist

- [ ] Backend running on port 5000
- [ ] .env file configured with EMAIL_USER and EMAIL_PASSWORD
- [ ] Go to http://localhost:5173/register
- [ ] Enter username, email, password
- [ ] Click "Send Verification Code"
- [ ] Should see success message or error from backend
- [ ] Check email for OTP code
- [ ] Enter OTP and submit
- [ ] Should be redirected to "/" (home page)
- [ ] User should be logged in

---

## Configuration Required

### Backend .env
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### Frontend .env (optional, already has default)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Error Messages You Should See (Not Bugs)

❌ "Email or username already in use" - User exists (normal)
❌ "Passwords do not match" - Input validation (normal)
❌ "Too many OTP requests" - Rate limiting (normal)
❌ "OTP has expired" - After 10 minutes (normal)
❌ "Invalid OTP" - Wrong code entered (normal)

✅ "OTP sent to your email" - Success
✅ "Registration successful! Welcome!" - Success

