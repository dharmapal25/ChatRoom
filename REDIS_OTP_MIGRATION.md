# Redis OTP Implementation - Complete Migration ✅

## Summary of Changes

### Old Architecture (Database) ❌
- OTP data stored in MongoDB `OTPVerification` collection
- TTL index created to auto-delete after 10 minutes
- Each OTP request created a database record
- Database overhead for temporary data

### New Architecture (Redis) ✅
- OTP data stored in Redis with automatic TTL
- No database overhead
- Much faster retrieval
- Better for temporary data
- Automatic expiration without manual cleanup

---

## Files Modified

### 1. **Config Files**

#### Created: `backend/src/config/redis.js`
```javascript
- Redis connection setup
- Connection event handlers
- Auto-reconnection logic
```

#### Updated: `backend/.env`
```
Added Redis configuration:
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

#### Updated: `backend/server.js`
```javascript
- Added Redis import: const redis = require('./src/config/redis');
- Redis initialized on server start
```

---

### 2. **Services**

#### Created: `backend/src/services/otpService.js`
```javascript
// Core OTP functions:
- storeOTP()       - Save OTP to Redis (10 min TTL)
- getOTPData()     - Retrieve OTP from Redis
- verifyOTP()      - Verify OTP correctness
- deleteOTP()      - Remove OTP from Redis
- sendAndStoreOTP()- Combined store + send

// Redis Key Format: otp:email@domain.com
// Storage Format: JSON with OTP, username, password
// Expiration: 600 seconds (10 minutes)
```

#### Updated: `backend/src/services/emailService.js`
```javascript
- Updated sendOTPEmail() to handle OTP parameter
- Can generate OTP or use provided one
- Works with both old and new implementations
```

---

### 3. **Controllers**

#### Updated: `backend/src/controllers/auth.controller.js`

**sendOtp endpoint:**
```javascript
// OLD (Database):
- Check email/username in User DB
- Generate OTP
- Hash password
- Save to OTPVerification collection
- Send email

// NEW (Redis):
- Check email/username in User DB
- Hash password
- Store OTP in Redis (returns generated OTP)
- Send email with OTP
- No database write for OTP
```

**verifyOtp endpoint:**
```javascript
// OLD (Database):
- Find OTPVerification record
- Check if expired
- Verify OTP
- Create user
- Delete from database

// NEW (Redis):
- Get OTPData from Redis
- Verify OTP (Redis handles expiration)
- Create user
- Delete from Redis
- Much faster!
```

---

### 4. **Models**

#### Updated: `backend/src/models/OTPVerification.model.js`
```javascript
// DEPRECATED - File kept for reference only
// All OTP logic moved to Redis

module.exports = null;
```

**Why deprecated?**
- MongoDB TTL indexes have 60-second granularity
- Redis TTL is precise down to seconds
- Redis is designed for temporary data
- Better performance for high-traffic scenarios
- Reduces database load

---

## Redis Storage Format

### Key Structure
```
Key: otp:user@example.com
Value: JSON string
{
  "otp": "1234",
  "username": "johndoe",
  "password": "hashed_bcrypt_password",
  "createdAt": "2024-04-12T12:00:00.000Z"
}

TTL: 600 seconds (10 minutes)
Auto-deleted by Redis after expiration
```

### Example Operations

```bash
# Store OTP
SET otp:user@example.com '{"otp":"1234","username":"johndoe",...}' EX 600

# Retrieve OTP
GET otp:user@example.com

# Delete OTP
DEL otp:user@example.com

# Check TTL
TTL otp:user@example.com
```

---

## Performance Improvements

| Aspect | Database | Redis |
|--------|----------|-------|
| **Write Speed** | ~5-10ms | ~1ms ✅ |
| **Read Speed** | ~5-10ms | ~1ms ✅ |
| **Memory** | Persistent | Volatile |
| **Cleanup** | Manual TTL | Automatic ✅ |
| **Scalability** | High | Very High ✅ |
| **Cost** | Higher | Lower ✅ |

---

## Redis Commands for Debugging

### Check if Redis is running
```bash
redis-cli ping
# Should return: PONG
```

### Check all OTP keys
```bash
redis-cli
> KEYS otp:*
```

### View OTP data
```bash
redis-cli
> GET otp:user@example.com
```

### Check TTL remaining
```bash
redis-cli
> TTL otp:user@example.com
# Returns seconds remaining
```

### Clear all OTPs
```bash
redis-cli
> DEL otp:*
```

---

## Configuration Required

### 1. **Redis Installation**

#### Windows (Option A: Using WSL)
```bash
# In WSL:
sudo apt-get install redis-server
redis-server
```

#### Windows (Option B: Docker)
```bash
docker run -d -p 6379:6379 redis:latest
```

#### Windows (Option C: Redis for Windows)
- Download from: https://github.com/microsoftarchive/redis/releases
- Or use: `choco install redis`

### 2. **.env Configuration**
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=         # Leave empty if no password
REDIS_DB=0             # Database number (0-15)
```

### 3. **Verify Connection**
```bash
# Terminal 1: Start Redis
redis-server

# Terminal 2: Test connection
redis-cli ping
# Should output: PONG
```

---

## Testing Workflow

### 1. **Start Redis**
```bash
redis-server
# Or: docker run -d -p 6379:6379 redis:latest
```

### 2. **Start Backend**
```bash
cd backend
npm start
# Should show: ✅ Redis connected successfully
```

### 3. **Test Registration**
- Go to http://localhost:5173/register
- Fill in username, email, password
- Click "Send Verification Code"
- Check Redis: `redis-cli GET otp:user@email.com`
- Should see OTP data
- Verify OTP is sent to email
- Enter OTP and submit
- User created in User collection ✅

### 4. **Verify Redis Operations**

```bash
# Open Redis CLI
redis-cli

# Check OTP key exists
> EXISTS otp:user@example.com

# View OTP data
> GET otp:user@example.com

# Check TTL
> TTL otp:user@example.com

# After verification, should be deleted
> EXISTS otp:user@example.com
# Returns: 0 (deleted)
```

---

## Monitoring & Logs

### Console Output

**On OTP Send:**
```
✅ Redis connected successfully
OTP stored in Redis for user@example.com
Email sent successfully
```

**On OTP Verify:**
```
OTP verified for user@example.com
User created in database
OTP deleted from Redis
```

**On Error:**
```
❌ Redis error: Connection refused
❌ Email service error: credentials not set
```

---

## Backup & Recovery

### Important Notes
- OTP data in Redis is **NOT persistent** by default
- If Redis restarts, all pending OTPs are lost
- Users must request new OTP if Redis restarts
- This is acceptable for OTP (temporary) data

### If Persistence Needed
Edit Redis config (`redis.conf`):
```conf
save 900 1          # Save if 900 seconds and 1 change
save 300 10         # Save if 300 seconds and 10 changes
save 60 10000       # Save if 60 seconds and 10000 changes
```

---

## Troubleshooting

### Issue: "Redis connection refused"
**Solution**: Ensure Redis server is running
```bash
redis-cli ping
# If error, start: redis-server
```

### Issue: "Cannot find module 'ioredis'"
**Solution**: Install ioredis
```bash
npm install ioredis
```

### Issue: OTP not being stored
**Check**:
- Redis is running
- REDIS_HOST and REDIS_PORT are correct
- Network connectivity

### Issue: OTP expired too quickly
**Check**:
- OTP_EXPIRATION in otpService.js is 600 seconds (10 minutes)
- Redis TTL is working correctly

---

## Summary of Benefits

✅ **Faster**: No database overhead
✅ **Cleaner**: No OTP collection in MongoDB
✅ **Scalable**: Redis can handle millions of concurrent OTPs
✅ **Secure**: Automatic expiration without manual cleanup
✅ **Memory Efficient**: No permanent storage needed
✅ **Better UX**: Instant OTP operations

---

## Files Status

| File | Status | Action |
|------|--------|--------|
| redis.js | ✅ NEW | Created |
| otpService.js | ✅ NEW | Created |
| OTPVerification.model.js | ⚠️ DEPRECATED | Kept for reference |
| auth.controller.js | ✅ UPDATED | Uses Redis |
| emailService.js | ✅ UPDATED | Compatible with Redis |
| server.js | ✅ UPDATED | Initializes Redis |
| .env | ✅ UPDATED | Redis config added |
