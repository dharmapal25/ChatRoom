// Simple in-memory rate limiter (can be replaced with express-rate-limit)
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
    return req.body.email || req.ip;
  },
  skip: (req) => {
    // Skip if no email provided (but still use IP-based limiting)
    return false;
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
    return req.body.email || req.ip;
  },
  skip: (req) => {
    // Skip if no email provided (but still use IP-based limiting)
    return false;
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
    return req.body.email || req.ip;
  },
  skip: (req) => {
    // Skip if no email provided (but still use IP-based limiting)
    return false;
  },
});

module.exports = {
  sendOtpLimiter,
  verifyOtpLimiter,
  loginLimiter,
};
