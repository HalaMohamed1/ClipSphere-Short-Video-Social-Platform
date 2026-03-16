import { User } from '../models/User.js';
import { AppError } from '../utils/appError.js';
import { generateToken } from '../middleware/auth.js';

export class AuthService {
  // Register new user
  static async register(registerData) {
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: registerData.email }, { username: registerData.username }],
    });

    if (existingUser) {
      throw new AppError('Email or username already in use', 400);
    }

    // Create new user
    const user = await User.create({
      username: registerData.username,
      email: registerData.email,
      password: registerData.password,
    });

    // Generate JWT token
    const token = generateToken(user._id);

    return {
      user: user.toJSON(),
      token,
    };
  }

  // Login user
  static async login(loginData) {
    const { email, password } = loginData;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Incorrect email or password', 401);
    }

    if (!user.active) {
      throw new AppError('Your account has been deactivated', 403);
    }

    // Generate JWT token
    const token = generateToken(user._id);

    return {
      user: user.toJSON(),
      token,
    };
  }

  // Get current user
  static async getCurrentUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  // Update user profile
  static async updateProfile(userId, updateData) {
    // Prevent password updates through this endpoint
    if (updateData.password || updateData.email) {
      throw new AppError('Cannot update password or email through this endpoint', 400);
    }

    // Check if username is being updated and if it's unique
    if (updateData.username) {
      const existingUser = await User.findOne({
        username: updateData.username,
        _id: { $ne: userId },
      });
      if (existingUser) {
        throw new AppError('Username already in use', 400);
      }
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  // Get user by ID (public profile)
  static async getUserProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  // Update notification preferences
  static async updatePreferences(userId, preferences) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (preferences.notificationPreferences) {
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...preferences.notificationPreferences,
      };
    }

    await user.save();
    return user;
  }
}
