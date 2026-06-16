const express = require('express');
const { protect } = require('../middleware/auth');
const {
  register,
  sendOtp,
  verifyOtp,
  login,
  getMe,
  logout,
  refreshToken,
  verifySession,
} = require('../controllers/auth.controller');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a user (fallback/direct)
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/send-otp
// @desc    Send registration OTP to email
// @access  Public
router.post('/send-otp', sendOtp);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and register user
// @access  Public
router.post('/verify-otp', verifyOtp);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', refreshToken);

// @route   POST /api/auth/verify-session
// @desc    Verify session from refresh token (for page reload)
// @access  Public
router.post('/verify-session', verifySession);

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, getMe);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, logout);

module.exports = router;
