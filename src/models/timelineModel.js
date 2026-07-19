const mongoose = require('mongoose');

const propertyTimelineSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Timeline event must belong to a property'],
      index: true,
    },
    eventType: {
      type: String,
      enum: {
        values: ['propertyCreated', 'propertyUpdated', 'statusChanged', 'propertySold', 'propertyRented'],
        message: 'Invalid timeline event type',
      },
      required: [true, 'Timeline event type is required'],
    },
    details: {
      type: String,
      trim: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  }
);

const PropertyTimeline = mongoose.model('PropertyTimeline', propertyTimelineSchema);

module.exports = PropertyTimeline;
