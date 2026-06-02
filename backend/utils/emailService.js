const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false, // true for port 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send OTP verification email
 * @param {string} to - Recipient email
 * @param {string} otp - 6-digit OTP code
 */
const sendVerificationEmail = async (to, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: '🐰 Verify your Rabbit account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f0f0f; color: #fff; border-radius: 12px;">
        <h1 style="color: #FF6B35; font-size: 28px; margin-bottom: 8px;">🐰 Rabbit</h1>
        <p style="color: #aaa; margin-bottom: 24px;">Your anonymous campus community</p>
        
        <h2 style="font-size: 20px; margin-bottom: 16px;">Verify Your Email</h2>
        <p style="color: #ccc; margin-bottom: 24px;">
          Use the code below to verify your college email address. 
          This code expires in <strong>${process.env.OTP_EXPIRES_IN} minutes</strong>.
        </p>
        
        <div style="background: #1a1a1a; border: 2px solid #FF6B35; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #FF6B35;">${otp}</span>
        </div>
        
        <p style="color: #666; font-size: 13px;">
          If you didn't request this, you can safely ignore this email. 
          Your identity will always remain anonymous on Rabbit. 🐾
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send password reset email
 * @param {string} to - Recipient email
 * @param {string} otp - 6-digit OTP code
 */
const sendPasswordResetEmail = async (to, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: '🐰 Rabbit — Password Reset',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f0f0f; color: #fff; border-radius: 12px;">
        <h1 style="color: #FF6B35; font-size: 28px; margin-bottom: 8px;">🐰 Rabbit</h1>
        <h2 style="font-size: 20px; margin-bottom: 16px;">Password Reset</h2>
        <p style="color: #ccc; margin-bottom: 24px;">
          Use the code below to reset your password. 
          This code expires in <strong>${process.env.OTP_EXPIRES_IN} minutes</strong>.
        </p>
        
        <div style="background: #1a1a1a; border: 2px solid #FF6B35; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #FF6B35;">${otp}</span>
        </div>
        
        <p style="color: #666; font-size: 13px;">If you didn't request this, please secure your account immediately.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
