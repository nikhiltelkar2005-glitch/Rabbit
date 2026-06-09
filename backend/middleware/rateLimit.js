const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Auth endpoints limiter
 * 10 attempts per 15 minutes (prevents brute force)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Post creation limiter
 * 5 posts per hour per IP (as specified in features)
 */
const postLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Post limit reached. You can create up to 5 posts per hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Voting limiter
 * 60 votes per minute
 */
const voteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { success: false, message: 'Voting too fast. Slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * OTP / email limiter
 * 3 OTP requests per 10 minutes
 */
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: { success: false, message: 'Too many OTP requests. Please wait 10 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Event creation limiter
 * 3 events per hour per IP — clubs can't spam events
 */
const eventLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { success: false, message: 'Event limit reached. You can create up to 3 events per hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Report submission limiter
 * 10 reports per hour per IP — prevents mass-reporting abuse
 */
const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Report limit reached. You can submit up to 10 reports per hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * DM limiter
 * 30 messages per 10 minutes — prevents spam DMs
 */
const dmLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many messages. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { generalLimiter, authLimiter, postLimiter, voteLimiter, otpLimiter, eventLimiter, reportLimiter, dmLimiter };
