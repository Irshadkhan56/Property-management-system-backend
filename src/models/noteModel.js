const mongoose = require('mongoose');

const followUpNoteSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Note must be linked to a property'],
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: ['adminNotes', 'negotiationNotes'],
        message: 'Note type must be adminNotes or negotiationNotes',
      },
      required: [true, 'Note type is required'],
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Note content cannot be empty'],
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: [true, 'Note must have an author (Admin)'],
    },
  },
  {
    timestamps: true,
  }
);

const FollowUpNote = mongoose.model('FollowUpNote', followUpNoteSchema);

module.exports = FollowUpNote;
