const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'An inquiry must be associated with a property'],
    },
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide your phone number'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    message: {
      type: String,
      required: [true, 'Please provide an inquiry message'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['new', 'contacted', 'closed'],
        message: 'Status must be new, contacted, or closed',
      },
      default: 'new',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Inquiry = mongoose.model('Inquiry', inquirySchema);

module.exports = Inquiry;
