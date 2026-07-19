const uploadService = require('../services/uploadService');
const sendResponse = require('../utils/response');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// @desc    Upload Single/Multiple files (Supports images, videos, documents)
// @route   POST /api/uploads
// @access  Private (Admin Only)
const uploadFiles = catchAsync(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new AppError('Please select at least one file to upload', 400));
  }

  // Upload all files to Cloudinary/Local storage concurrently
  const uploadPromises = req.files.map((file) => {
    const folderName = file.fieldname || 'general';
    return uploadService.uploadFile(file, folderName);
  });

  const urls = await Promise.all(uploadPromises);

  const results = req.files.map((file, index) => ({
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    url: urls[index],
  }));

  sendResponse(res, 201, 'File(s) uploaded successfully', { uploads: results });
});

module.exports = {
  uploadFiles,
};
