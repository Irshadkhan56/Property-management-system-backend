const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { verifyToken } = require('../utils/jwt');
const Admin = require('../models/adminModel');

const protect = catchAsync(async (req, res, next) => {
  let token;

  // 1) Get token from Authorization header or cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verify token
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    return next(new AppError('Invalid token. Please log in again!', 401));
  }

  // 3) Check if user still exists
  const currentAdmin = await Admin.findById(decoded.id);
  if (!currentAdmin) {
    return next(
      new AppError('The user belonging to this token no longer exists.', 401)
    );
  }

  // 4) Check if user has the admin role
  if (currentAdmin.role !== 'admin') {
    return next(
      new AppError('You do not have permission to perform this action', 403)
    );
  }

  // Grant access to protected route
  req.user = currentAdmin;
  next();
});

module.exports = {
  protect,
};
