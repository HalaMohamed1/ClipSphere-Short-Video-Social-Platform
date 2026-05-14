import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please provide a username'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9_-]+$/.test(v);
        },
        message: props => `${props.value} contains invalid characters. Use letters, numbers, underscores, and hyphens only.`
      }
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
    followersCount: {
      type: Number,
      default: 0,
    },
    followingCount: {
      type: Number,
      default: 0,
    },
    
    walletBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    notificationPreferences: {
      type: {
        emailOnNewEngagement: {
          type: Boolean,
          default: true,
        },
        emailOnWelcome: {
          type: Boolean,
          default: true,
        },
        inAppOnNewEngagement: {
          type: Boolean,
          default: true,
        },
        inAppOnWelcome: {
          type: Boolean,
          default: true,
        },
      },
      default: {
        emailOnNewEngagement: true,
        emailOnWelcome: true,
        inAppOnNewEngagement: true,
        inAppOnWelcome: true,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ============= INDEXES =============
// Compound Index for efficient filtering by status and registration date
userSchema.index({ accountStatus: 1, createdAt: -1 });

// Compound Index for unique search optimization (email/username coverage)
userSchema.index({ email: 1, username: 1 }, { unique: true });

// ============= HOOKS =============
// Pre-save: Hash password before saving
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

// Post-save: Potential hook for initialization or analytics
userSchema.post('save', function (doc, next) {
  console.log(`New user created/updated: ${doc.username}`);
  next();
});

// ============= METHODS ===========
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// toJSON method to exclude sensitive fields
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.active;
  return obj;
};

export const User = mongoose.model('User', userSchema);
