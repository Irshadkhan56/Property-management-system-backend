const crmService = require('../services/crmService');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendResponse = require('../utils/response');

// @desc    Create a Property Inquiry
// @route   POST /api/inquiries
// @access  Public
const createInquiry = catchAsync(async (req, res, next) => {
  const newInquiry = await crmService.createInquiry(req.body);
  sendResponse(res, 201, 'Your inquiry has been submitted successfully', { inquiry: newInquiry });
});

// @desc    Get all Inquiries
// @route   GET /api/inquiries
// @access  Private (Admin Only)
const getInquiries = catchAsync(async (req, res, next) => {
  const data = await crmService.getInquiries(req.query);
  sendResponse(res, 200, 'Inquiries retrieved successfully', data);
});

// @desc    Update an Inquiry
// @route   PUT /api/inquiries/:id
// @access  Private (Admin Only)
const updateInquiry = catchAsync(async (req, res, next) => {
  const updatedInquiry = await crmService.updateInquiry(req.params.id, req.body);

  if (!updatedInquiry) {
    return next(new AppError('No inquiry found with that ID', 404));
  }

  sendResponse(res, 200, 'Inquiry updated successfully', { inquiry: updatedInquiry });
});

// @desc    Delete an Inquiry
// @route   DELETE /api/inquiries/:id
// @access  Private (Admin Only)
const deleteInquiry = catchAsync(async (req, res, next) => {
  const deletedInquiry = await crmService.deleteInquiry(req.params.id);

  if (!deletedInquiry) {
    return next(new AppError('No inquiry found with that ID', 404));
  }

  sendResponse(res, 200, 'Inquiry deleted successfully');
});

module.exports = {
  createInquiry,
  getInquiries,
  updateInquiry,
  deleteInquiry,
};
