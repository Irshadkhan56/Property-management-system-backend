const crmService = require('../services/crmService');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendResponse = require('../utils/response');

// @desc    Add a Follow-up Note to a Property
// @route   POST /api/properties/:propertyId/notes
// @access  Private (Admin Only)
const addNote = catchAsync(async (req, res, next) => {
  const { propertyId } = req.params;
  const { type, content } = req.body;
  const adminId = req.user._id;

  const newNote = await crmService.addNote(propertyId, type, content, adminId);
  sendResponse(res, 201, 'Follow-up note added successfully', { note: newNote });
});

// @desc    Get Follow-up Notes for a Property
// @route   GET /api/properties/:propertyId/notes
// @access  Private (Admin Only)
const getNotes = catchAsync(async (req, res, next) => {
  const { propertyId } = req.params;
  const notes = await crmService.getNotesByPropertyId(propertyId);
  sendResponse(res, 200, 'Follow-up notes retrieved successfully', { notes });
});

// @desc    Get Timeline Logs for a Property
// @route   GET /api/properties/:propertyId/timeline
// @access  Private (Admin Only)
const getTimeline = catchAsync(async (req, res, next) => {
  const { propertyId } = req.params;
  const timeline = await crmService.getTimelineByPropertyId(propertyId);
  sendResponse(res, 200, 'Property timeline retrieved successfully', { timeline });
});

module.exports = {
  addNote,
  getNotes,
  getTimeline,
};
