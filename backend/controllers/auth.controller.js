const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const generateAnonymousName = require('../utils/anonymousName');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');

// ─── Helper: Generate JWT ───────────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

// ─── Helper: Generate 6-digit OTP ──────────────────────────────────────────
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ─── Helper: OTP expiry time ───────────────────────────────────────────────
const otpExpiry = () =>
  new Date(Date.now() + parseInt(process.env.OTP_EXPIRES_IN || 10) * 60 * 1000);

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Register with college email
// @route   POST /api/auth/register
// @access  Public
// ══════════════════════════════════════════════════════════════════════════════
const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    // Check if already registered
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({ success: false, message: 'Email already registered.' });
      }
      // Re-send OTP if not yet verified
      const otp = generateOTP();
      existingUser.otp = otp;
      existingUser.otpExpiresAt = otpExpiry();
      await existingUser.save({ validateBeforeSave: false });
      await sendVerificationEmail(email, otp);
      return res.status(200).json({
        success: true,
        message: 'OTP resent to your college email. Please verify.',
      });
    }

    // Generate unique anonymous name
    let anonymousName;
    let nameExists = true;
    while (nameExists) {
      anonymousName = generateAnonymousName();
      nameExists = await User.findOne({ anonymousName });
    }

    const otp = generateOTP();

    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash: password, // Will be hashed by pre-save hook
      anonymousName,
      otp,
      otpExpiresAt: otpExpiry(),
    });

    await sendVerificationEmail(email, otp);

    res.status(201).json({
      success: true,
      message: `OTP sent to ${email}. Please verify your college email to continue.`,
      // Expose anonymous name so user knows their identity
      anonymousName: user.anonymousName,
    });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Verify college email with OTP
// @route   POST /api/auth/verify-email
// @access  Public
// ══════════════════════════════════════════════════════════════════════════════
const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+otp +otpExpiresAt');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified.' });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    if (user.otpExpiresAt < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // Mark as verified and clear OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      message: '🐰 Welcome to Rabbit! Your college email has been verified.',
      token,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Login
// @route   POST /api/auth/login
// @access  Public
// ══════════════════════════════════════════════════════════════════════════════
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your college email first.',
        needsVerification: true,
      });
    }

    // Backfill collegeDomain for older accounts
    if (!user.collegeDomain) {
      user.collegeDomain = user.email.split('@')[1];
      await user.save();
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: `Account banned: ${user.banReason || 'Violation of community guidelines'}`,
      });
    }

    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
// ══════════════════════════════════════════════════════════════════════════════
const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user || user.isVerified) {
      return res.status(400).json({ success: false, message: 'Invalid request.' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiresAt = otpExpiry();
    await user.save({ validateBeforeSave: false });
    await sendVerificationEmail(email, otp);

    res.status(200).json({ success: true, message: 'New OTP sent to your email.' });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Request password reset OTP
// @route   POST /api/auth/forgot-password
// @access  Public
// ══════════════════════════════════════════════════════════════════════════════
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email?.toLowerCase() });
    // Always return success to prevent email enumeration
    if (!user) {
      return res.status(200).json({ success: true, message: 'If that email exists, an OTP has been sent.' });
    }

    const otp = generateOTP();
    user.resetOtp = otp;
    user.resetOtpExpiresAt = otpExpiry();
    await user.save({ validateBeforeSave: false });
    await sendPasswordResetEmail(email, otp);

    res.status(200).json({ success: true, message: 'Password reset OTP sent to your email.' });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
// ══════════════════════════════════════════════════════════════════════════════
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+resetOtp +resetOtpExpiresAt');

    if (!user || user.resetOtp !== otp || user.resetOtpExpiresAt < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    user.passwordHash = newPassword; // Will be hashed by pre-save hook
    user.resetOtp = undefined;
    user.resetOtpExpiresAt = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successfully. Please log in.' });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Protected
// ══════════════════════════════════════════════════════════════════════════════
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user.toPublicJSON(),
  });
};

module.exports = { register, verifyEmail, login, resendOTP, forgotPassword, resetPassword, getMe };
