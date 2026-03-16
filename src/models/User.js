import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const notificationPreferencesSchema = new mongoose.Schema({
  inApp: {
    followers: { type: Boolean, default: true },
    comments: { type: Boolean, default: true },
    likes: { type: Boolean, default: true },
    tips: { type: Boolean, default: true },
  },
  email: {
    followers: { type: Boolean, default: false },
    comments: { type: Boolean, default: false },
    likes: { type: Boolean, default: false },
    tips: { type: Boolean, default: false },
  },
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please provide a username'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [/.+\@.+\..+/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    bio: {
      type: String,
      default: '',
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    avatarKey: {
      type: String,
      default: null,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    accountStatus: {
      type: String,
      enum: ['active', 'suspended', 'flagged'],
      default: 'active',
    },
    notificationPreferences: {
      type: notificationPreferencesSchema,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });

// Middleware: Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method: Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method: Return safe user data (excluding password)
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const User = mongoose.model('User', userSchema);
