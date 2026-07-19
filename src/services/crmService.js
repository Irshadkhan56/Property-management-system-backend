const Inquiry = require('../models/inquiryModel');
const VisitRequest = require('../models/visitModel');
const PropertyTimeline = require('../models/timelineModel');
const FollowUpNote = require('../models/noteModel');

// ==========================================
// 1) INQUIRIES SERVICE
// ==========================================

const createInquiry = async (inquiryData) => {
  return await Inquiry.create(inquiryData);
};

const getInquiries = async (queryParams) => {
  const { page = 1, limit = 10, status, propertyId, search } = queryParams;
  
  const query = {};
  if (status) query.status = status;
  if (propertyId) query.propertyId = propertyId;
  
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    query.$or = [
      { name: searchRegex },
      { phone: searchRegex },
      { email: searchRegex },
      { message: searchRegex }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const inquiries = await Inquiry.find(query)
    .populate('propertyId', 'title slug price city area')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Inquiry.countDocuments(query);

  return {
    inquiries,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

const updateInquiry = async (id, updateData) => {
  return await Inquiry.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

const deleteInquiry = async (id) => {
  return await Inquiry.findByIdAndDelete(id);
};

// ==========================================
// 2) VISIT REQUESTS SERVICE
// ==========================================

const createVisit = async (visitData) => {
  return await VisitRequest.create(visitData);
};

const getVisits = async (queryParams) => {
  const { page = 1, limit = 10, status, propertyId, search } = queryParams;

  const query = {};
  if (status) query.status = status;
  if (propertyId) query.propertyId = propertyId;

  if (search) {
    const searchRegex = new RegExp(search, 'i');
    query.$or = [
      { visitorName: searchRegex },
      { phone: searchRegex },
      { notes: searchRegex }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const visits = await VisitRequest.find(query)
    .populate('propertyId', 'title slug price city area')
    .sort({ visitDate: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await VisitRequest.countDocuments(query);

  return {
    visits,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

const updateVisit = async (id, updateData) => {
  return await VisitRequest.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

const deleteVisit = async (id) => {
  return await VisitRequest.findByIdAndDelete(id);
};

// ==========================================
// 3) PROPERTY TIMELINE SERVICE
// ==========================================

const createTimelineEvent = async (propertyId, eventType, details, performedBy = null) => {
  return await PropertyTimeline.create({
    propertyId,
    eventType,
    details,
    performedBy,
  });
};

const getTimelineByPropertyId = async (propertyId) => {
  return await PropertyTimeline.find({ propertyId })
    .populate('performedBy', 'name email role')
    .sort({ createdAt: -1 });
};

// ==========================================
// 4) FOLLOW-UP NOTES SERVICE
// ==========================================

const addNote = async (propertyId, type, content, adminId) => {
  return await FollowUpNote.create({
    propertyId,
    type,
    content,
    createdBy: adminId,
  });
};

const getNotesByPropertyId = async (propertyId) => {
  return await FollowUpNote.find({ propertyId })
    .populate('createdBy', 'name email role')
    .sort({ createdAt: -1 });
};

module.exports = {
  createInquiry,
  getInquiries,
  updateInquiry,
  deleteInquiry,
  createVisit,
  getVisits,
  updateVisit,
  deleteVisit,
  createTimelineEvent,
  getTimelineByPropertyId,
  addNote,
  getNotesByPropertyId,
};
