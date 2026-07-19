const mongoose = require('mongoose');

const propertyOwnerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Please provide full name of the property owner'],
      trim: true,
    },
    fatherName: {
      type: String,
      trim: true,
    },
    cnic: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          // Allow empty values, but if provided, must match Pakistan CNIC format: XXXXX-XXXXXXX-X
          return !v || /^\d{5}-\d{7}-\d{1}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid CNIC. Format should be XXXXX-XXXXXXX-X`,
      },
    },
    phone: {
      type: String,
      required: [true, 'Please provide owner phone number'],
      trim: true,
    },
    whatsapp: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const PropertyOwner = mongoose.model('PropertyOwner', propertyOwnerSchema);

module.exports = PropertyOwner;
