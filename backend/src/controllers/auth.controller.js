const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User.model');
const OTPVerification = require('../models/OTPVerification.model');
const { generateOTP, sendOTPEmail } = require('../services/emailService');

// Generate Access Token (short-lived, in memory)
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRATION || '15m',
    }
  );
};

// Generate Refresh Token (long-lived, in cookies)
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
  });
};

// @route   POST /api/auth/send-otp
// @desc    Send OTP to email for registration
// @access  Public
exports.sendOtp = async (req, res) => {
  try {
    const { email, username, password, passwordConfirm } = req.body;

    // Validation
    if (!email || !username || !password || !passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email or username already in use',
      });
    }

    // Delete any existing OTP for this email
    await OTPVerification.deleteMany({ email });

    // Generate OTP
    const otp = generateOTP();

    // Hash password before storing in OTP collection
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save OTP to database with hashed password
    await OTPVerification.create({
      email,
      otp,
      username,
      password: hashedPassword,
    });

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email. Please verify to complete registration.',
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send OTP',
    });
  }
};

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and create user
// @access  Public
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validation
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP',
      });
    }

    // Find OTP verification record
    const otpRecord = await OTPVerification.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'No OTP request found for this email. Please request a new OTP.',
      });
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      await OTPVerification.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.',
      });
    }

    // Verify OTP (only check OTP, not username/email as they were already verified)
    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.',
      });
    }

    // Create user in database (ONLY AFTER OTP VERIFICATION)
    const user = await User.create({
      username: otpRecord.username,
      email: otpRecord.email,
      password: otpRecord.password,
    });

    // Delete OTP record after successful verification
    await OTPVerification.deleteOne({ _id: otpRecord._id });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user._id);

    // Set refresh token in secure httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome!',
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify OTP',
    });
  }
};

// @route   POST /api/auth/register
// @desc    Register a user (deprecated - use send-otp and verify-otp)
// @access  Public
exports.register = async (req, res) => {
  try {
    const { username, email, password, passwordConfirm } = req.body;

    // Validation
    if (!username || !email || !password || !passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email or username already in use',
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user._id);

    // Set refresh token in secure httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user._id);

    // Set refresh token in secure httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      accessToken,
      user: {
        _id: user._id,
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });

    // Initialize Socket.IO and register user
    setTimeout(() => {
      const socket = require('../services/socketService');
      if (socket) {
        socket.emit('register-user', { userId: user._id });
      }
    }, 500);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
exports.logout = (req, res) => {
  // Clear refresh token cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully',
  });
};

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided',
      });
    }

    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
      );

      // Fetch user data
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      // Generate new access token
      const accessToken = generateAccessToken(user);

      res.status(200).json({
        success: true,
        accessToken,
      });
    } catch (error) {
      res.clearCookie('refreshToken');
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
