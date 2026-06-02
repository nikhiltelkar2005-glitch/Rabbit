const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // Never returned in queries by default
    },

    // ─── Anonymous Identity ────────────────────────────────────────────
    anonymousName: {
      type: String,
      required: true,
      unique: true,
    },

    // ─── Verification ──────────────────────────────────────────────────
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpiresAt: {
      type: Date,
      select: false,
    },

    // ─── Rabbit Karma & Badges ─────────────────────────────────────────
    karma: {
      type: Number,
      default: 0,
    },
    badge: {
      type: String,
      default: 'New Rabbit',
      enum: ['New Rabbit', 'Active Member', 'Top Contributor', 'Helpful Senior', 'Placement Guru'],
    },

    // ─── Communities ───────────────────────────────────────────────────
    joinedCommunities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community',
      },
    ],

    // ─── Roles ─────────────────────────────────────────────────────────
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    banReason: {
      type: String,
    },

    // ─── Password Reset ────────────────────────────────────────────────
    resetOtp: {
      type: String,
      select: false,
    },
    resetOtpExpiresAt: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Hash password before saving ───────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// ─── Instance method: compare passwords ────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// ─── SECURITY: Transform output — never expose email or passwordHash ────────
userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    anonymousName: this.anonymousName,
    karma: this.karma,
    badge: this.badge,
    joinedCommunities: this.joinedCommunities,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
