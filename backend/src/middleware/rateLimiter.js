// Rate limiting for OTP endpoints
const rateLimit = require('express-rate-limit');

// Rate limiter for sending OTP (5 requests per 15 minutes)
const sendOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many OTP requests from this email, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit by email first, fallback to IP
    if (req.body?.email) {
      return req.body.email;
    }
    // Use default key generator for IP (handles IPv6 properly)
    return req.ip;
  },
});

// Rate limiter for verifying OTP (10 attempts per 15 minutes)
const verifyOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: 'Too many OTP verification attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit by email first, fallback to IP
    if (req.body?.email) {
      return req.body.email;
    }
    return req.ip;
  },
});

// Rate limiter for login (10 attempts per 15 minutes)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit by email first, fallback to IP
    if (req.body?.email) {
      return req.body.email;
    }
    return req.ip;
  },
});

module.exports = {
  sendOtpLimiter,
  verifyOtpLimiter,
  loginLimiter,
};
