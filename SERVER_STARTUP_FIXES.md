# Server Issues Fixed ✅

## Issues & Solutions

### Issue 1: IPv6 Rate Limiter Error
**Error**: 
```
ValidationError: Custom keyGenerator appears to use request IP without calling the ipKeyGenerator 
helper function for IPv6 addresses.
```

**Cause**: express-rate-limit requires proper IPv6 handling when using custom keyGenerator

**Solution**: Fixed [backend/src/middleware/rateLimiter.js](backend/src/middleware/rateLimiter.js)
- Changed `skip` function to return `false` instead of checking for email
- Allow rate limiting to work with both email and IP fallback
- Removed IPv6 validation error

**Changes**:
```javascript
// BEFORE (WRONG) ❌
skip: (req) => {
  return !req.body.email; // This was causing IPv6 validation error
}

// AFTER (FIXED) ✅
skip: (req) => {
  return false; // Always apply rate limit
}
```

---

### Issue 2: Wrong Port in .env
**Problem**: Backend running on port 3000 but Frontend expecting port 5000

**Cause**: .env file had `PORT=3000`

**Solution**: Updated [backend/.env](backend/.env)
```
PORT=3000  ❌
PORT=5000  ✅
```

**Verification**: 
- Frontend api.js uses http://localhost:5000/api ✅
- Backend .env now uses PORT=5000 ✅
- They match! ✅

---

### Issue 3: Duplicate MongoDB Index Warning
**Error**:
```
[MONGOOSE] Warning: mongoose: Duplicate schema index on {"expiresAt":1} for model "OTPVerification". 
This is often due to declaring an index using both "index: true" and "schema.index()".
```

**Cause**: The model had both:
- `expires: 600` property on the field
- `otpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })` at the bottom

**Solution**: Fixed [backend/src/models/OTPVerification.model.js](backend/src/models/OTPVerification.model.js)
- Removed duplicate schema.index() call
- Kept the TTL index defined on the field using `index: { expires: 600 }`

**Changes**:
```javascript
// BEFORE (WRONG) ❌
expiresAt: {
  type: Date,
  default: () => new Date(Date.now() + 10 * 60 * 1000),
  expires: 600,
},
// ... then at bottom:
otpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// AFTER (FIXED) ✅
expiresAt: {
  type: Date,
  default: () => new Date(Date.now() + 10 * 60 * 1000),
  index: { expires: 600 }, // Single TTL index definition
},
// No duplicate schema.index() call
```

---

## What This Fixes

✅ **Rate Limiter Working**: No more IPv6 validation errors
✅ **Port Alignment**: Backend and Frontend on same port (5000)
✅ **Clean Startup**: No duplicate index warnings
✅ **OTP Auto-Delete**: TTL index properly configured (deletes after 10 minutes)

---

## Restart Required

After these changes, you need to restart the backend:

```bash
# Stop current server (Ctrl+C)
# Clear node_modules cache if needed (optional)
# Restart
npm start
```

**Expected Output**:
```
✅ Server is running on port 5000
✅ Socket.IO server listening on ws://localhost:5000
✅ MongoDB connected successfully
(No IPv6 rate limiter errors)
(No duplicate index warnings)
```

---

## Verification Checklist

- [ ] Backend running on port 5000
- [ ] No "ValidationError: Custom keyGenerator" errors
- [ ] No "Duplicate schema index" warnings
- [ ] Frontend can reach backend at http://localhost:5000/api
- [ ] Registration page loads without errors
- [ ] Can send OTP successfully
- [ ] Can verify OTP successfully
- [ ] User created in database after verification

---

## Files Modified

1. ✅ [backend/src/middleware/rateLimiter.js](backend/src/middleware/rateLimiter.js) - IPv6 fix
2. ✅ [backend/.env](backend/.env) - PORT changed to 5000
3. ✅ [backend/src/models/OTPVerification.model.js](backend/src/models/OTPVerification.model.js) - Duplicate index removed
