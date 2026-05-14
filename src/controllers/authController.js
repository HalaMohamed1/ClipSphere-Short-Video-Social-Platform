import { catchAsync } from '../utils/catchAsync.js';
import { AuthService } from '../services/authService.js';
import { registerSchema, loginSchema, updateUserSchema, updatePreferencesSchema } from '../validators/authValidator.js';
import { getAuthCookieOptions } from '../utils/authCookie.js';

export class AuthController {
  static register = catchAsync(async (req, res) => {
    const validatedData = registerSchema.parse(req.body);

    const { user, token } = await AuthService.register(validatedData);

    res.cookie('token', token, getAuthCookieOptions());

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user,
        token,
      },
    });
  });

  static login = catchAsync(async (req, res) => {
    const validatedData = loginSchema.parse(req.body);

    const { user, token } = await AuthService.login(validatedData);

    res.cookie('token', token, getAuthCookieOptions());

    res.status(200).json({
      status: 'success',
      message: 'Logged in successfully',
      data: {
        user,
        token,
      },
    });
  });

  static logout = catchAsync(async (req, res) => {
    res.clearCookie('token', { path: '/', httpOnly: true, sameSite: 'lax' });
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  });

  static getMe = catchAsync(async (req, res) => {
    const user = req.user;

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  });

  static updateMe = catchAsync(async (req, res) => {
    const validatedData = updateUserSchema.parse(req.body);

    const user = await AuthService.updateProfile(req.user._id, validatedData);

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: { user },
    });
  });

  static getUserProfile = catchAsync(async (req, res) => {
    const user = await AuthService.getUserProfile(req.params.id);

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  });

  static getUserProfileByUsername = catchAsync(async (req, res) => {
    const user = await AuthService.getUserProfileByUsername(req.params.username);

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  });

  static updatePreferences = catchAsync(async (req, res) => {
    const validatedData = updatePreferencesSchema.parse(req.body);

    const user = await AuthService.updatePreferences(req.user._id, validatedData);

    res.status(200).json({
      status: 'success',
      message: 'Preferences updated successfully',
      data: { user },
    });
  });
}
