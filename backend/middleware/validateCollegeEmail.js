/**
 * College Email Validator Middleware
 * Ensures only students with the college's email domain can register.
 * Set COLLEGE_EMAIL_DOMAIN in your .env (e.g. college.edu.in)
 */
const validateCollegeEmail = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required.',
    });
  }

  const allowedDomain = process.env.COLLEGE_EMAIL_DOMAIN;
  if (!allowedDomain) {
    console.warn('⚠️  COLLEGE_EMAIL_DOMAIN not set in .env — skipping domain validation');
    return next();
  }

  const emailDomain = email.split('@')[1]?.toLowerCase();
  if (emailDomain !== allowedDomain.toLowerCase()) {
    return res.status(400).json({
      success: false,
      message: `Only ${allowedDomain} email addresses are allowed to join Rabbit.`,
    });
  }

  next();
};

module.exports = validateCollegeEmail;
