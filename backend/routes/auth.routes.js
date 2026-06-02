const express = require('express');
const router = express.Router();

const {
  register,
  verifyEmail,
  login,
  resendOTP,
  forgotPassword,
  resetPassword,
  getMe,
} = require('../controllers/auth.controller');

const { protect } = require('../middleware/auth.middleware');
const validateCollegeEmail = require('../middleware/validateCollegeEmail');
const { authLimiter, otpLimiter } = require('../middleware/rateLimit');

// POST /api/auth/register
router.post('/register', authLimiter, validateCollegeEmail, register);

// POST /api/auth/verify-email
router.post('/verify-email', otpLimiter, verifyEmail);

// POST /api/auth/resend-otp
router.post('/resend-otp', otpLimiter, resendOTP);

// POST /api/auth/login
router.post('/login', authLimiter, login);

// POST /api/auth/forgot-password
router.post('/forgot-password', otpLimiter, forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', authLimiter, resetPassword);

// GET /api/auth/me  (protected)
router.get('/me', protect, getMe);

module.exports = router;
