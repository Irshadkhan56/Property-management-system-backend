const mongoose = require('mongoose');
const AppError = require('../utils/appError');

const validateInquiryInput = (req, res, next) => {
  const { propertyId, name, phone, message, status } = req.body;

  if (req.method === 'POST') {
    if (!propertyId) return next(new AppError('propertyId is required', 400));
    if (!name || name.trim() === '') return next(new AppError('name is required', 400));
    if (!phone || phone.trim() === '') return next(new AppError('phone is required', 400));
    if (!message || message.trim() === '') return next(new AppError('message is required', 400));
  }

  if (propertyId && !mongoose.Types.ObjectId.isValid(propertyId)) {
    return next(new AppError('Invalid propertyId format', 400));
  }

  if (status && !['new', 'contacted', 'closed'].includes(status)) {
    return next(new AppError('status must be new, contacted, or closed', 400));
  }

  next();
};

const validateVisitInput = (req, res, next) => {
  const { propertyId, visitorName, phone, visitDate, status } = req.body;

  if (req.method === 'POST') {
    if (!propertyId) return next(new AppError('propertyId is required', 400));
    if (!visitorName || visitorName.trim() === '') return next(new AppError('visitorName is required', 400));
    if (!phone || phone.trim() === '') return next(new AppError('phone is required', 400));
    if (!visitDate) return next(new AppError('visitDate is required', 400));
  }

  if (propertyId && !mongoose.Types.ObjectId.isValid(propertyId)) {
    return next(new AppError('Invalid propertyId format', 400));
  }

  if (visitDate) {
    const parsedDate = new Date(visitDate);
    if (isNaN(parsedDate.getTime())) {
      return next(new AppError('Invalid visitDate format', 400));
    }
  }

  if (status && !['pending', 'approved', 'rejected', 'completed'].includes(status)) {
    return next(new AppError('status must be pending, approved, rejected, or completed', 400));
  }

  next();
};

const validateNoteInput = (req, res, next) => {
  const { type, content } = req.body;

  if (!type || !['adminNotes', 'negotiationNotes'].includes(type)) {
    return next(new AppError('Note type must be adminNotes or negotiationNotes', 400));
  }

  if (!content || content.trim() === '') {
    return next(new AppError('Note content cannot be empty', 400));
  }

  next();
};

module.exports = {
  validateInquiryInput,
  validateVisitInput,
  validateNoteInput,
};
