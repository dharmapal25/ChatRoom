const nodemailer = require('nodemailer');

// Validate email configuration
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.warn('⚠️ WARNING: Email credentials not configured. OTP emails will not be sent.');
  console.warn('Please set EMAIL_USER and EMAIL_PASSWORD in .env file');
}

// Create email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter connection
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Email service error:', error.message);
    } else {
      console.log('✅ Email service is ready to send emails');
    }
  });
}

// Generate 4-digit OTP
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  // Check if email service is configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error('Email service is not configured. Please contact administrator.');
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Email Verification - Your OTP Code',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #007bff;">Email Verification</h2>
        <p>Thank you for registering with us!</p>
        <p>Your OTP verification code is:</p>
        <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; margin: 0; letter-spacing: 5px;">${otp}</h1>
        </div>
        <p><strong>This code will expire in 10 minutes.</strong></p>
        <p>If you didn't request this verification code, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">This is an automated message, please do not reply to this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('❌ Email sending error:', error);
    throw new Error('Failed to send OTP email: ' + error.message);
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
};
