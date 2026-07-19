const Admin = require('../models/adminModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendResponse = require('../utils/response');
const { signToken } = require('../utils/jwt');

// @desc    Admin Login
// @route   POST /api/admin/login
// @access  Public
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Find admin and select password field explicitly
  const admin = await Admin.findOne({ email }).select('+password');

  // 2) Check if admin exists and password is correct
  if (!admin || !(await admin.correctPassword(password, admin.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) Sign token
  const token = signToken({ id: admin._id, role: admin.role });

  // 4) Set token in cookie (optional but recommended for security)
  const cookieOptions = {
    expires: new Date(
      Date.now() + (parseInt(process.env.JWT_COOKIE_EXPIRES_IN || '7') * 24 * 60 * 60 * 1000)
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.cookie('token', token, cookieOptions);

  // Remove password from output
  admin.password = undefined;

  // 5) Send response
  sendResponse(res, 200, 'Login successful', {
    admin,
    token,
  });
});

// @desc    Get Current Admin Profile
// @route   GET /api/admin/me
// @access  Private (Admin Only)
const getMe = catchAsync(async (req, res, next) => {
  const admin = req.user;
  sendResponse(res, 200, 'Admin profile retrieved successfully', { admin });
});

// @desc    Admin Logout
// @route   POST /api/admin/logout
// @access  Private (Admin Only)
const logout = catchAsync(async (req, res, next) => {
  res.cookie('token', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  sendResponse(res, 200, 'Logged out successfully');
});

module.exports = {
  login,
  getMe,
  logout,
};
