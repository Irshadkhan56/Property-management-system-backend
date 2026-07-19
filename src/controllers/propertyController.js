const propertyService = require('../services/propertyService');
const { generatePropertySchema } = require('../utils/structuredData');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendResponse = require('../utils/response');
const { verifyToken } = require('../utils/jwt');
const Admin = require('../models/adminModel');

// Helper to check if requester has valid admin credentials without throwing authentication exception
const checkAdminOptional = async (req) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) return false;

    const decoded = verifyToken(token);
    const user = await Admin.findById(decoded.id);
    return user && user.role === 'admin';
  } catch (err) {
    return false;
  }
};

// @desc    Create a Property
// @route   POST /api/properties
// @access  Private (Admin Only)
const createProperty = catchAsync(async (req, res, next) => {
  const newProperty = await propertyService.createProperty(req.body, req.user._id);
  sendResponse(res, 201, 'Property created successfully', { property: newProperty });
});

// @desc    Get all Properties (Public / Private conditional view)
// @route   GET /api/properties
// @access  Public / Private
const getProperties = catchAsync(async (req, res, next) => {
  const isAdmin = await checkAdminOptional(req);
  const data = await propertyService.getProperties(req.query, isAdmin);
  sendResponse(res, 200, 'Properties retrieved successfully', data);
});

// @desc    Get Property by ID (Public / Private conditional view)
// @route   GET /api/properties/:id
// @access  Public / Private
const getPropertyById = catchAsync(async (req, res, next) => {
  const isAdmin = await checkAdminOptional(req);
  const property = await propertyService.getPropertyById(req.params.id, isAdmin);

  if (!property) {
    return next(new AppError('No property found with that ID', 404));
  }

  const host = req.get('host');
  const protocol = req.protocol;
  const baseUrl = `${protocol}://${host}`;
  const structuredData = generatePropertySchema(property, baseUrl);

  sendResponse(res, 200, 'Property retrieved successfully', { 
    property,
    structuredData
  });
});

// @desc    Update a Property
// @route   PUT /api/properties/:id
// @access  Private (Admin Only)
const updateProperty = catchAsync(async (req, res, next) => {
  const updatedProperty = await propertyService.updateProperty(req.params.id, req.body, req.user._id);

  if (!updatedProperty) {
    return next(new AppError('No property found with that ID', 404));
  }

  sendResponse(res, 200, 'Property updated successfully', { property: updatedProperty });
});

// @desc    Delete a Property
// @route   DELETE /api/properties/:id
// @access  Private (Admin Only)
const deleteProperty = catchAsync(async (req, res, next) => {
  const deletedProperty = await propertyService.deleteProperty(req.params.id);

  if (!deletedProperty) {
    return next(new AppError('No property found with that ID', 404));
  }

  sendResponse(res, 200, 'Property deleted successfully');
});

// @desc    Get Related Properties
// @route   GET /api/properties/related/:id
// @access  Public / Private
const getRelatedProperties = catchAsync(async (req, res, next) => {
  const isAdmin = await checkAdminOptional(req);
  const properties = await propertyService.getRelatedProperties(req.params.id, isAdmin);
  sendResponse(res, 200, 'Related properties retrieved successfully', { properties });
});

// @desc    Get Featured Properties
// @route   GET /api/properties/featured
// @access  Public / Private
const getFeaturedProperties = catchAsync(async (req, res, next) => {
  const isAdmin = await checkAdminOptional(req);
  const properties = await propertyService.getFeaturedProperties(isAdmin);
  sendResponse(res, 200, 'Featured properties retrieved successfully', { properties });
});

// @desc    Get Latest Properties
// @route   GET /api/properties/latest
// @access  Public / Private
const getLatestProperties = catchAsync(async (req, res, next) => {
  const isAdmin = await checkAdminOptional(req);
  const properties = await propertyService.getLatestProperties(isAdmin);
  sendResponse(res, 200, 'Latest properties retrieved successfully', { properties });
});

module.exports = {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getRelatedProperties,
  getFeaturedProperties,
  getLatestProperties,
};
