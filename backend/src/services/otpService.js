const redis = require('../config/redis');
const { generateOTP, sendOTPEmail } = require('./emailService');

// OTP expiration time in seconds (10 minutes)
const OTP_EXPIRATION = 10 * 60; // 600 seconds

/**
 * Store OTP in Redis
 * Key format: otp:email
 */
const storeOTP = async (email, username, password) => {
  try {
    const otp = generateOTP();
    
    // Create OTP data object
    const otpData = JSON.stringify({
      otp,
      username,
      password,
      createdAt: new Date().toISOString(),
    });

    // Store in Redis with 10 minute expiration
    const key = `otp:${email.toLowerCase()}`;
    await redis.setex(key, OTP_EXPIRATION, otpData);

    return otp;
  } catch (error) {
    console.error('Error storing OTP in Redis:', error);
    throw new Error('Failed to store OTP');
  }
};

/**
 * Get OTP data from Redis
 */
const getOTPData = async (email) => {
  try {
    const key = `otp:${email.toLowerCase()}`;
    const data = await redis.get(key);

    if (!data) {
      return null;
    }

    return JSON.parse(data);
  } catch (error) {
    console.error('Error retrieving OTP from Redis:', error);
    throw new Error('Failed to retrieve OTP');
  }
};

/**
 * Verify OTP
 */
const verifyOTP = async (email, providedOtp) => {
  try {
    const otpData = await getOTPData(email);

    if (!otpData) {
      return {
        success: false,
        message: 'No OTP request found for this email. Please request a new OTP.',
      };
    }

    if (otpData.otp !== providedOtp) {
      return {
        success: false,
        message: 'Invalid OTP. Please try again.',
      };
    }

    return {
      success: true,
      data: otpData,
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw new Error('Failed to verify OTP');
  }
};

/**
 * Delete OTP from Redis
 */
const deleteOTP = async (email) => {
  try {
    const key = `otp:${email.toLowerCase()}`;
    await redis.del(key);
    return true;
  } catch (error) {
    console.error('Error deleting OTP from Redis:', error);
    throw new Error('Failed to delete OTP');
  }
};

/**
 * Send OTP email and store in Redis
 */
const sendAndStoreOTP = async (email, username, password) => {
  try {
    // Store OTP in Redis
    const otp = await storeOTP(email, username, password);

    // Send OTP email
    await sendOTPEmail(email, otp);

    return {
      success: true,
      message: 'OTP sent to your email. Please verify to complete registration.',
    };
  } catch (error) {
    console.error('Error in sendAndStoreOTP:', error);
    throw error;
  }
};

module.exports = {
  storeOTP,
  getOTPData,
  verifyOTP,
  deleteOTP,
  sendAndStoreOTP,
  OTP_EXPIRATION,
};
