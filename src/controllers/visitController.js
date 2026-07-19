const crmService = require('../services/crmService');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendResponse = require('../utils/response');

// @desc    Create a Visit Request
// @route   POST /api/visits
// @access  Public
const createVisit = catchAsync(async (req, res, next) => {
  const newVisit = await crmService.createVisit(req.body);
  sendResponse(res, 201, 'Visit request submitted successfully', { visit: newVisit });
});

// @desc    Get all Visit Requests
// @route   GET /api/visits
// @access  Private (Admin Only)
const getVisits = catchAsync(async (req, res, next) => {
  const data = await crmService.getVisits(req.query);
  sendResponse(res, 200, 'Visit requests retrieved successfully', data);
});

// @desc    Update a Visit Request
// @route   PUT /api/visits/:id
// @access  Private (Admin Only)
const updateVisit = catchAsync(async (req, res, next) => {
  const updatedVisit = await crmService.updateVisit(req.params.id, req.body);

  if (!updatedVisit) {
    return next(new AppError('No visit request found with that ID', 404));
  }

  sendResponse(res, 200, 'Visit request updated successfully', { visit: updatedVisit });
});

// @desc    Delete a Visit Request
// @route   DELETE /api/visits/:id
// @access  Private (Admin Only)
const deleteVisit = catchAsync(async (req, res, next) => {
  const deletedVisit = await crmService.deleteVisit(req.params.id);

  if (!deletedVisit) {
    return next(new AppError('No visit request found with that ID', 404));
  }

  sendResponse(res, 200, 'Visit request deleted successfully');
});

module.exports = {
  createVisit,
  getVisits,
  updateVisit,
  deleteVisit,
};
