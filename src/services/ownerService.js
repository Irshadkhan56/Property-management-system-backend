const PropertyOwner = require('../models/ownerModel');

const createOwner = async (ownerData) => {
  return await PropertyOwner.create(ownerData);
};

const getOwners = async (queryParams) => {
  const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = queryParams;

  // Build query
  const query = {};
  
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    query.$or = [
      { fullName: searchRegex },
      { phone: searchRegex },
      { email: searchRegex },
      { cnic: searchRegex },
    ];
  }

  // Pagination & Sorting options
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortDirection };

  const owners = await PropertyOwner.find(query)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await PropertyOwner.countDocuments(query);

  return {
    owners,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

const getOwnerById = async (id) => {
  return await PropertyOwner.findById(id);
};

const updateOwner = async (id, updateData) => {
  return await PropertyOwner.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

const deleteOwner = async (id) => {
  return await PropertyOwner.findByIdAndDelete(id);
};

module.exports = {
  createOwner,
  getOwners,
  getOwnerById,
  updateOwner,
  deleteOwner,
};
