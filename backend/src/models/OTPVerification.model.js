const mongoose = require('mongoose');

const otpVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address',
    ],
  },
  otp: {
    type: String,
    required: [true, 'OTP is required'],
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    index: { expires: 600 }, // TTL index - auto delete after 10 minutes
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('OTPVerification', otpVerificationSchema);
