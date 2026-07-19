const mongoose = require('mongoose');
const Property = require('../models/propertyModel');
const crmService = require('./crmService');

const createProperty = async (propertyData, adminId = null) => {
  const property = await Property.create(propertyData);
  
  await crmService.createTimelineEvent(
    property._id,
    'propertyCreated',
    `Property listing created under title "${property.title}"`,
    adminId
  );
  
  return property;
};

const getProperties = async (queryParams, isAdmin = false) => {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    propertyType,
    city,
    area,
    status,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    bedrooms,
    bathrooms,
    ownerId,
    sortBy = 'latest',
    sortOrder = 'desc',
  } = queryParams;

  // Build query
  const query = {};

  // Public search term regex
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    query.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { address: searchRegex },
      { city: searchRegex },
      { area: searchRegex },
    ];
  }

  // Exact matches
  if (category) query.category = category;
  if (propertyType) query.propertyType = propertyType;
  if (city) query.city = city;
  if (area) query.area = area;
  
  // Status filtering (public users should only see "available" by default unless status is specified)
  if (status) {
    query.status = status;
  } else if (!isAdmin) {
    query.status = 'available'; // Default filter for public requests
  }

  // Numeric range filters
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
  }

  if (minArea !== undefined || maxArea !== undefined) {
    query.areaSize = {};
    if (minArea !== undefined) query.areaSize.$gte = Number(minArea);
    if (maxArea !== undefined) query.areaSize.$lte = Number(maxArea);
  }

  if (bedrooms) query.bedrooms = { $gte: Number(bedrooms) };
  if (bathrooms) query.bathrooms = { $gte: Number(bathrooms) };

  // Owner filtering (Admin only)
  if (ownerId && isAdmin) {
    query.ownerId = ownerId;
  }

  // Projection setup: exclude private information for public requests
  let projection = '';
  if (!isAdmin) {
    projection = '-ownerDemandPrice -minimumAcceptablePrice -commissionPercentage -commissionAmount -privateNotes -ownerId';
  }

  // Pagination options
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Sorting options mapping
  let sort = { createdAt: -1 }; // Default: Latest
  if (sortBy) {
    const s = sortBy.toLowerCase();
    if (s === 'latest' || s === 'createdat') {
      sort = { createdAt: -1 };
    } else if (s === 'pricelowtohigh' || s === 'price-asc' || (s === 'price' && sortOrder === 'asc')) {
      sort = { price: 1 };
    } else if (s === 'pricehightolow' || s === 'price-desc' || (s === 'price' && sortOrder === 'desc')) {
      sort = { price: -1 };
    } else if (s === 'mostviewed' || s === 'views') {
      sort = { views: -1 };
    } else {
      // Dynamic fallback
      const sortDirection = sortOrder === 'asc' ? 1 : -1;
      sort = { [sortBy]: sortDirection };
    }
  }

  let queryBuilder = Property.find(query, projection).sort(sort).skip(skip).limit(parseInt(limit));

  // Populate owner information for admin requests
  if (isAdmin) {
    queryBuilder = queryBuilder.populate('ownerId', 'fullName phone email cnic');
  }

  const properties = await queryBuilder;
  const total = await Property.countDocuments(query);

  return {
    properties,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

const getPropertyById = async (id, isAdmin = false) => {
  const isObjectId = mongoose.Types.ObjectId.isValid(id);
  const query = isObjectId ? { _id: id } : { slug: id };

  // Automatically increment view counter when details are opened
  await Property.findOneAndUpdate(query, { $inc: { views: 1 } });

  let projection = '';
  if (!isAdmin) {
    projection = '-ownerDemandPrice -minimumAcceptablePrice -commissionPercentage -commissionAmount -privateNotes -ownerId';
  }

  let queryBuilder = Property.findOne(query, projection);

  if (isAdmin) {
    queryBuilder = queryBuilder.populate('ownerId');
  }

  return await queryBuilder;
};

const updateProperty = async (id, updateData, adminId = null) => {
  const oldProperty = await Property.findById(id);
  if (!oldProperty) return null;

  const updatedProperty = await Property.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (updatedProperty) {
    if (oldProperty.status !== updatedProperty.status) {
      await crmService.createTimelineEvent(
        id,
        'statusChanged',
        `Status changed from "${oldProperty.status}" to "${updatedProperty.status}"`,
        adminId
      );

      if (updatedProperty.status === 'sold') {
        await crmService.createTimelineEvent(
          id,
          'propertySold',
          `Property marked as Sold`,
          adminId
        );
      } else if (updatedProperty.status === 'rented') {
        await crmService.createTimelineEvent(
          id,
          'propertyRented',
          `Property marked as Rented`,
          adminId
        );
      }
    }
    
    await crmService.createTimelineEvent(
      id,
      'propertyUpdated',
      `Property details updated`,
      adminId
    );
  }

  return updatedProperty;
};

const deleteProperty = async (id) => {
  return await Property.findByIdAndDelete(id);
};

// @desc    Get related properties (Same category & type, excluding current, limit 4)
const getRelatedProperties = async (id, isAdmin = false) => {
  const currentProperty = await Property.findById(id);
  if (!currentProperty) return [];

  const query = {
    _id: { $ne: id },
    category: currentProperty.category,
    propertyType: currentProperty.propertyType,
    status: 'available',
  };

  let projection = '';
  if (!isAdmin) {
    projection = '-ownerDemandPrice -minimumAcceptablePrice -commissionPercentage -commissionAmount -privateNotes -ownerId';
  }

  return await Property.find(query, projection)
    .sort({ createdAt: -1 })
    .limit(4);
};

// @desc    Get featured properties (limit 6)
const getFeaturedProperties = async (isAdmin = false) => {
  let projection = '';
  if (!isAdmin) {
    projection = '-ownerDemandPrice -minimumAcceptablePrice -commissionPercentage -commissionAmount -privateNotes -ownerId';
  }

  return await Property.find({ isFeatured: true, status: 'available' }, projection)
    .sort({ createdAt: -1 })
    .limit(6);
};

// @desc    Get latest properties (limit 10)
const getLatestProperties = async (isAdmin = false) => {
  let projection = '';
  if (!isAdmin) {
    projection = '-ownerDemandPrice -minimumAcceptablePrice -commissionPercentage -commissionAmount -privateNotes -ownerId';
  }

  return await Property.find({ status: 'available' }, projection)
    .sort({ createdAt: -1 })
    .limit(10);
};

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
