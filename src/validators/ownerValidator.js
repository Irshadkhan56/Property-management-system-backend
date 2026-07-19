const AppError = require('../utils/appError');

const validateOwnerInput = (req, res, next) => {
  const { fullName, phone, email, cnic } = req.body;

  // For POST request, name and phone are required
  if (req.method === 'POST') {
    if (!fullName || fullName.trim() === '') {
      return next(new AppError('Full name is required', 400));
    }
    if (!phone || phone.trim() === '') {
      return next(new AppError('Phone number is required', 400));
    }
  }

  // Validate email format if provided
  if (email && email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(new AppError('Please provide a valid email address', 400));
    }
  }

  // Validate CNIC format if provided (XXXXX-XXXXXXX-X)
  if (cnic && cnic.trim() !== '') {
    const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
    if (!cnicRegex.test(cnic)) {
      return next(new AppError('Please provide a valid CNIC matching XXXXX-XXXXXXX-X format', 400));
    }
  }

  next();
};

module.exports = {
  validateOwnerInput,
};
