const ownerService = require('../services/ownerService');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendResponse = require('../utils/response');

// @desc    Create a Property Owner
// @route   POST /api/owners
// @access  Private (Admin Only)
const createOwner = catchAsync(async (req, res, next) => {
  const newOwner = await ownerService.createOwner(req.body);
  sendResponse(res, 201, 'Property owner created successfully', { owner: newOwner });
});

// @desc    Get all Property Owners
// @route   GET /api/owners
// @access  Private (Admin Only)
const getOwners = catchAsync(async (req, res, next) => {
  const data = await ownerService.getOwners(req.query);
  sendResponse(res, 200, 'Property owners retrieved successfully', data);
});

// @desc    Get Owner by ID
// @route   GET /api/owners/:id
// @access  Private (Admin Only)
const getOwnerById = catchAsync(async (req, res, next) => {
  const owner = await ownerService.getOwnerById(req.params.id);

  if (!owner) {
    return next(new AppError('No owner found with that ID', 404));
  }

  sendResponse(res, 200, 'Property owner retrieved successfully', { owner });
});

// @desc    Update Owner details
// @route   PUT /api/owners/:id
// @access  Private (Admin Only)
const updateOwner = catchAsync(async (req, res, next) => {
  const updatedOwner = await ownerService.updateOwner(req.params.id, req.body);

  if (!updatedOwner) {
    return next(new AppError('No owner found with that ID', 404));
  }

  sendResponse(res, 200, 'Property owner updated successfully', { owner: updatedOwner });
});

// @desc    Delete an Owner
// @route   DELETE /api/owners/:id
// @access  Private (Admin Only)
const deleteOwner = catchAsync(async (req, res, next) => {
  const deletedOwner = await ownerService.deleteOwner(req.params.id);

  if (!deletedOwner) {
    return next(new AppError('No owner found with that ID', 404));
  }

  sendResponse(res, 200, 'Property owner deleted successfully');
});

module.exports = {
  createOwner,
  getOwners,
  getOwnerById,
  updateOwner,
  deleteOwner,
};
