const Property = require('../models/propertyModel');
const PropertyOwner = require('../models/ownerModel');
const Inquiry = require('../models/inquiryModel');
const catchAsync = require('../utils/catchAsync');
const sendResponse = require('../utils/response');

// @desc    Get Dashboard General Statistics
// @route   GET /api/dashboard/stats
// @access  Private (Admin Only)
const getStats = catchAsync(async (req, res, next) => {
  // Execute database counts concurrently for optimal response time
  const [
    totalProperties,
    availableProperties,
    soldProperties,
    rentedProperties,
    totalOwners,
    totalInquiries,
    monthlyInquiries
  ] = await Promise.all([
    Property.countDocuments(),
    Property.countDocuments({ status: 'available' }),
    Property.countDocuments({ status: 'sold' }),
    Property.countDocuments({ status: 'rented' }),
    PropertyOwner.countDocuments(),
    Inquiry.countDocuments(),
    Inquiry.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          count: 1,
        },
      },
      { $sort: { year: -1, month: -1 } },
      { $limit: 12 }, // Last 12 months
    ])
  ]);

  sendResponse(res, 200, 'Dashboard statistics retrieved successfully', {
    totalProperties,
    availableProperties,
    soldProperties,
    rentedProperties,
    totalOwners,
    totalInquiries,
    monthlyInquiries,
  });
});

// @desc    Get Dashboard Analytics Data
// @route   GET /api/dashboard/analytics
// @access  Private (Admin Only)
const getAnalytics = catchAsync(async (req, res, next) => {
  const [viewsResult, mostViewedProperties, inquiryTrends] = await Promise.all([
    // Total views sum
    Property.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' },
        },
      },
    ]),
    // Top 5 most viewed listings
    Property.find({}, 'title slug views category price propertyType status')
      .sort({ views: -1 })
      .limit(5),
    // Daily inquiry count for trend graphing
    Inquiry.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }, // Limit to last 30 days
    ])
  ]);

  const totalPropertyViews = viewsResult[0]?.totalViews || 0;

  sendResponse(res, 200, 'Dashboard analytics retrieved successfully', {
    totalPropertyViews,
    mostViewedProperties,
    inquiryTrends,
  });
});

module.exports = {
  getStats,
  getAnalytics,
};
