const mongoose = require('mongoose');
const AppError = require('../utils/appError');

const validatePropertyInput = (req, res, next) => {
  const {
    title,
    description,
    category,
    propertyType,
    price,
    city,
    area,
    address,
    areaSize,
    areaUnit,
    ownerId,
    bedrooms,
    bathrooms,
    kitchens,
    parking,
    ownerDemandPrice,
    minimumAcceptablePrice,
    commissionPercentage,
    commissionAmount,
    status
  } = req.body;

  // On POST, enforce required fields
  if (req.method === 'POST') {
    const requiredFields = {
      title,
      description,
      category,
      propertyType,
      price,
      city,
      area,
      address,
      areaSize,
      areaUnit,
      ownerId
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
        return next(new AppError(`Property field '${key}' is required`, 400));
      }
    }
  }

  // Validate Mongoose ObjectId format for ownerId
  if (ownerId && !mongoose.Types.ObjectId.isValid(ownerId)) {
    return next(new AppError('Invalid ownerId format', 400));
  }

  // Validate category value
  if (category && !['sale', 'rent'].includes(category)) {
    return next(new AppError('Category must be either sale or rent', 400));
  }

  // Validate numeric fields
  const numericFields = {
    price,
    areaSize,
    bedrooms,
    bathrooms,
    kitchens,
    parking,
    ownerDemandPrice,
    minimumAcceptablePrice,
    commissionPercentage,
    commissionAmount
  };

  for (const [key, value] of Object.entries(numericFields)) {
    if (value !== undefined && value !== null) {
      const num = Number(value);
      if (isNaN(num)) {
        return next(new AppError(`${key} must be a number`, 400));
      }
      if (num < 0) {
        return next(new AppError(`${key} cannot be negative`, 400));
      }
      if (key === 'commissionPercentage' && num > 100) {
        return next(new AppError('commissionPercentage cannot exceed 100', 400));
      }
    }
  }

  // Validate status
  if (status && !['available', 'underNegotiation', 'advanceReceived', 'sold', 'rented', 'cancelled'].includes(status)) {
    return next(new AppError('Invalid status value', 400));
  }

  next();
};

module.exports = {
  validatePropertyInput,
};
