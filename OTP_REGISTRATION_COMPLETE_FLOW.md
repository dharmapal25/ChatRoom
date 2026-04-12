# OTP Registration - Complete Flow Documentation

## Architecture Overview

### Two-Step Registration Process

```
STEP 1: SEND OTP
┌─────────────────────────────────────────────────────┐
│ User fills: username, email, password, confirm pwd  │
│ Click: "Send Verification Code"                     │
└─────────────────────────────────────────────────────┘
                        ↓
            API: POST /api/auth/send-otp
                        ↓
┌─────────────────────────────────────────────────────┐
│ 1. Validate all fields                              │
│ 2. Check if password === confirm password           │
│ 3. Check if email/username exist in User DB         │
│    - If YES → Return error "already in use"         │
│    - If NO → Continue                               │
│ 4. Generate 4-digit OTP                             │
│ 5. Hash password with bcrypt                        │
│ 6. Save to OTPVerification (temporary, 10 min TTL)  │
│ 7. Send OTP to email                                │
│ 8. Return success message                           │
└─────────────────────────────────────────────────────┘
                        ↓
         Save to localStorage (for page reload)
                        ↓
         Display "Verify Email" page
         Show email address
         Show OTP input field
                        ↓

STEP 2: VERIFY OTP
┌─────────────────────────────────────────────────────┐
│ User receives email with OTP code                   │
│ User enters OTP in input field                      │
│ Click: "Verify & Create Account"                    │
└─────────────────────────────────────────────────────┘
                        ↓
           API: POST /api/auth/verify-otp
                        ↓
┌─────────────────────────────────────────────────────┐
│ 1. Find OTPVerification record by email             │
│    - If NOT found → Error "No OTP request"          │
│ 2. Check if OTP expired (10 minutes)                │
│    - If YES → Error "OTP expired"                   │
│ 3. Check if OTP matches                             │
│    - If NO → Error "Invalid OTP"                    │
│ 4. ✅ CREATE USER in User DB (ONLY NOW!)            │
│ 5. Delete OTPVerification record                    │
│ 6. Generate JWT tokens                              │
│ 7. Set refresh token in httpOnly cookie             │
│ 8. Return access token                              │
└─────────────────────────────────────────────────────┘
                        ↓
         Clear localStorage (registrationData)
         Store accessToken in localStorage
                        ↓
         Redirect to "/" (home page)
         User is LOGGED IN ✅
```

---

## Key Points

### ✅ What Happens When User Sends OTP

```javascript
// SEND OTP ENDPOINT
POST /api/auth/send-otp

Request:
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "password123",
  "passwordConfirm": "password123"
}

Backend Logic:
1. Validate inputs
2. Check passwords match
3. ⭐ CHECK ONLY User DB for email/username (NOT OTPVerification)
   - If found → "Email or username already in use" ❌
   - If not found → Continue ✅
4. Generate OTP: "1234"
5. Hash password
6. Save to OTPVerification collection:
   {
     email: "user@example.com",
     otp: "1234",
     username: "johndoe",
     password: "hashed_password",
     expiresAt: Date.now() + 10 minutes
   }
7. Send email with OTP
8. Return success

Database State:
User Collection:        Empty (user NOT created)
OTPVerification:        Has temporary record
localStorage:           registrationData saved
```

### ✅ What Happens When User Verifies OTP

```javascript
// VERIFY OTP ENDPOINT
POST /api/auth/verify-otp

Request:
{
  "email": "user@example.com",
  "otp": "1234"
}

Backend Logic:
1. Find OTPVerification record by email
   - If NOT found → "No OTP request found" ❌
2. Check if OTP expired
   - If expired → "OTP has expired" ❌
3. ⭐ Check if OTP matches
   - If wrong → "Invalid OTP. Please try again." ❌
   - If correct → Continue ✅
4. ✅ CREATE USER in User collection:
   {
     username: "johndoe",
     email: "user@example.com",
     password: "hashed_password",
     createdAt: now,
     updatedAt: now
   }
5. Delete OTPVerification record
6. Generate JWT tokens
7. Set httpOnly cookie with refresh token
8. Return accessToken

Database State:
User Collection:        ✅ User created!
OTPVerification:        ✅ Record deleted
localStorage:           registrationData cleared
```

---

## Error Handling Flow

### Scenario 1: Email Already Registered
```
User Action: Try to register with existing email
        ↓
Send OTP endpoint checks User collection
        ↓
Email found in User collection
        ↓
Response: 400
{
  "success": false,
  "message": "Email or username already in use"
}
        ↓
Frontend shows error
Stay on registration form
localStorage cleared
```

### Scenario 2: Invalid OTP
```
User Action: Enter wrong OTP code
        ↓
Verify OTP endpoint receives OTP
        ↓
Find OTPVerification record ✅
Check expiration ✅
        ↓
OTP doesn't match
        ↓
Response: 400
{
  "success": false,
  "message": "Invalid OTP. Please try again."
}
        ↓
Frontend shows error
Stay on verify page
localStorage still has data
User can retry
```

### Scenario 3: OTP Expired
```
User Action: Wait 10 minutes then enter OTP
        ↓
Verify OTP endpoint receives OTP
        ↓
Find OTPVerification record ✅
        ↓
Check: current time > expiresAt
        ↓
OTP record is expired
Auto-delete expired record
        ↓
Response: 400
{
  "success": false,
  "message": "OTP has expired. Please request a new one."
}
        ↓
Frontend shows error
User must click "Back to Registration"
Request new OTP
```

---

## Database Collections

### OTPVerification Collection (Temporary)
```javascript
{
  _id: ObjectId("..."),
  email: "user@example.com",           // Unique per 10 minutes
  otp: "1234",                         // 4 digits
  username: "johndoe",                 // From registration form
  password: "hashed_bcrypt_password",  // Pre-hashed
  expiresAt: ISODate("2024-04-12T12:10:00Z"),
  createdAt: ISODate("2024-04-12T12:00:00Z")
}

TTL Index: Auto-delete 10 minutes after creation
```

### User Collection (Permanent)
```javascript
{
  _id: ObjectId("..."),
  username: "johndoe",
  email: "user@example.com",
  password: "hashed_bcrypt_password",  // Same as stored in OTPVerification
  createdAt: ISODate("2024-04-12T12:00:00Z"),
  updatedAt: ISODate("2024-04-12T12:00:00Z")
}

Unique Indexes: email, username
```

---

## Frontend State Management

### localStorage Keys

#### 1. registrationData (Temporary)
```javascript
localStorage.setItem('registrationData', JSON.stringify({
  username: "johndoe",
  email: "user@example.com",
  password: "password123"
}));

// Cleared when:
// - OTP verification successful
// - User clicks "Back to Registration"
// - User closes browser (optional based on implementation)
```

#### 2. accessToken (After Registration)
```javascript
localStorage.setItem('accessToken', 'jwt_token_here');

// Set after successful OTP verification
// Used for subsequent API requests
```

---

## Testing Checklist

### Test 1: Successful Registration
- [ ] Go to `/register`
- [ ] Enter valid username, email, password
- [ ] Click "Send Verification Code"
- [ ] See "Verify Email" page
- [ ] Check email for OTP
- [ ] Refresh page - "Verify Email" page still shown
- [ ] Enter OTP code
- [ ] Click "Verify & Create Account"
- [ ] Redirected to "/" (home)
- [ ] User logged in
- [ ] Check DB - user exists in User collection

### Test 2: Email Already Exists
- [ ] Go to `/register`
- [ ] Enter email that already exists
- [ ] Click "Send Verification Code"
- [ ] See error: "Email or username already in use"
- [ ] Stay on registration form
- [ ] No "Verify Email" page shown

### Test 3: Invalid OTP
- [ ] Send OTP successfully
- [ ] On "Verify Email" page
- [ ] Enter wrong OTP (e.g., "0000")
- [ ] Click "Verify & Create Account"
- [ ] See error: "Invalid OTP. Please try again."
- [ ] Stay on "Verify Email" page
- [ ] Refresh page - still on "Verify Email" page
- [ ] Try correct OTP - should work

### Test 4: Page Reload on Verify Page
- [ ] Send OTP successfully
- [ ] On "Verify Email" page showing email
- [ ] Refresh browser
- [ ] Should still show "Verify Email" page
- [ ] Should show same email
- [ ] OTP input should be empty
- [ ] Should be able to enter OTP and submit

### Test 5: OTP Expired
- [ ] Send OTP successfully
- [ ] Wait 10+ minutes
- [ ] Enter OTP code
- [ ] Click "Verify & Create Account"
- [ ] See error: "OTP has expired. Please request a new one."
- [ ] Click "Back to Registration"
- [ ] Fill form again and request new OTP
- [ ] New OTP should work

### Test 6: Password Validation
- [ ] Enter passwords that don't match
- [ ] Click "Send Verification Code"
- [ ] See error: "Passwords do not match"
- [ ] Stay on registration form

### Test 7: Back to Registration
- [ ] Send OTP successfully
- [ ] On "Verify Email" page
- [ ] Click "Back to Registration"
- [ ] Back on registration form with empty fields
- [ ] Refresh page - shows registration form (not verify page)

---

## API Endpoints Summary

### POST /api/auth/send-otp
**Rate Limited**: 5 requests per 15 minutes per email

**Request**:
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "password123",
  "passwordConfirm": "password123"
}
```

**Success (200)**:
```json
{
  "success": true,
  "message": "OTP sent to your email. Please verify to complete registration."
}
```

**Errors (400)**:
- Missing fields
- Passwords don't match
- Email/username already in use

**Errors (500)**:
- Email service not configured
- Database error

---

### POST /api/auth/verify-otp
**Rate Limited**: 10 attempts per 15 minutes per email

**Request**:
```json
{
  "email": "user@example.com",
  "otp": "1234"
}
```

**Success (201)**:
```json
{
  "success": true,
  "message": "Registration successful! Welcome!",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id_here",
    "username": "johndoe",
    "email": "user@example.com"
  }
}
```

**Errors (400)**:
- No OTP request found
- OTP expired
- Invalid OTP

**Errors (500)**:
- Database error

---

## Security Measures

✅ **Passwords never stored plain text**
- Hashed before saving to OTPVerification
- Hashed again by User model before saving to User collection

✅ **OTP Security**
- 4-digit code (1000 possibilities)
- Rate limited (10 attempts per 15 min)
- Expires after 10 minutes
- Auto-deleted from database

✅ **Email Verification**
- Only valid emails get OTP
- Email must be unique in User collection

✅ **CORS & Credentials**
- withCredentials enabled
- Proper CORS headers
- httpOnly cookies for refresh token

✅ **JWT Tokens**
- Access token: 15 minutes
- Refresh token: 7 days (in httpOnly cookie)
- Verified on every protected request

---

## Common Issues & Solutions

### Issue: "Email or username already in use" when email is new
**Cause**: Email exists in User collection from previous attempt
**Solution**: User needs to log in instead or admin deletes duplicate

### Issue: OTP not received
**Cause**: Email service not configured
**Check**:
- .env has EMAIL_USER and EMAIL_PASSWORD
- Gmail has App Password (not regular password)
- Check spam folder

### Issue: Page shows registration form after reload
**Cause**: localStorage was cleared
**Solution**: User needs to send OTP again

### Issue: Verify page works but API returns error
**Cause**: OTP expired or invalid
**Check**: 
- OTP entered correctly
- Not more than 10 minutes passed
- Browser console for exact error message

---

## Summary

| Aspect | Details |
|--------|---------|
| **When user data is stored** | After OTP verification ✅ |
| **Uniqueness check** | On /send-otp endpoint, User collection only |
| **What's checked on verify** | Only OTP correctness (not email/username) |
| **OTP expiration** | 10 minutes from generation |
| **Page persistence** | localStorage (registrationData) |
| **After successful registration** | Redirect to "/" with access token |
