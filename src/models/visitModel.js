const mongoose = require('mongoose');

const visitRequestSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'A visit request must be associated with a property'],
    },
    visitorName: {
      type: String,
      required: [true, 'Please provide visitor name'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide contact phone number'],
      trim: true,
    },
    visitDate: {
      type: Date,
      required: [true, 'Please specify planned visit date'],
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected', 'completed'],
        message: 'Status must be pending, approved, rejected, or completed',
      },
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const VisitRequest = mongoose.model('VisitRequest', visitRequestSchema);

module.exports = VisitRequest;
