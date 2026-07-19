const mongoose = require('mongoose');

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const propertySchema = new mongoose.Schema(
  {
    // Public Information
    title: {
      type: String,
      required: [true, 'Please provide property title'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide property description'],
    },
    category: {
      type: String,
      enum: {
        values: ['sale', 'rent'],
        message: 'Category must be either sale or rent',
      },
      required: [true, 'Please specify category (sale or rent)'],
    },
    propertyType: {
      type: String,
      required: [true, 'Please specify property type (e.g. House, Flat, Plot, etc.)'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please specify listing price'],
      min: [0, 'Price cannot be negative'],
    },
    city: {
      type: String,
      required: [true, 'Please specify city'],
      trim: true,
    },
    area: {
      type: String,
      required: [true, 'Please specify area or sector'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Please specify exact address'],
      trim: true,
    },
    bedrooms: {
      type: Number,
      default: 0,
      min: [0, 'Bedrooms cannot be negative'],
    },
    bathrooms: {
      type: Number,
      default: 0,
      min: [0, 'Bathrooms cannot be negative'],
    },
    kitchens: {
      type: Number,
      default: 0,
      min: [0, 'Kitchens cannot be negative'],
    },
    parking: {
      type: Number,
      default: 0,
      min: [0, 'Parking spaces cannot be negative'],
    },
    areaSize: {
      type: Number,
      required: [true, 'Please specify area size'],
      min: [0, 'Area size cannot be negative'],
    },
    areaUnit: {
      type: String,
      required: [true, 'Please specify area unit (e.g. Marla, Kanal, Sq. Ft., Sq. Yd.)'],
      trim: true,
    },
    facilities: {
      type: [String],
      default: [],
    },
    featuredImage: {
      type: String,
      default: '',
    },
    galleryImages: {
      type: [String],
      default: [],
    },
    videos: {
      type: [String],
      default: [],
    },
    floorPlans: {
      type: [String],
      default: [],
    },
    documents: {
      type: [String],
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
      index: true,
    },

    // Private Information (Accessible by Admin only)
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PropertyOwner',
      required: [true, 'A property must belong to an owner'],
    },
    ownerDemandPrice: {
      type: Number,
      min: [0, 'Owner demand price cannot be negative'],
    },
    minimumAcceptablePrice: {
      type: Number,
      min: [0, 'Minimum acceptable price cannot be negative'],
    },
    commissionPercentage: {
      type: Number,
      min: [0, 'Commission percentage cannot be negative'],
      max: [100, 'Commission percentage cannot exceed 100'],
    },
    commissionAmount: {
      type: Number,
      min: [0, 'Commission amount cannot be negative'],
    },
    privateNotes: {
      type: String,
      default: '',
    },

    // Status Field
    status: {
      type: String,
      enum: {
        values: ['available', 'underNegotiation', 'advanceReceived', 'sold', 'rented', 'cancelled'],
        message: 'Invalid property status',
      },
      default: 'available',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug on save
propertySchema.pre('save', async function () {
  if (this.isModified('title')) {
    let baseSlug = slugify(this.title);
    
    // Check for uniqueness of slug
    let uniqueSlug = baseSlug;
    let count = 1;
    let exists = true;
    
    while (exists) {
      const doc = await this.constructor.findOne({ slug: uniqueSlug, _id: { $ne: this._id } });
      if (!doc) {
        exists = false;
      } else {
        uniqueSlug = `${baseSlug}-${count}`;
        count++;
      }
    }
    
    this.slug = uniqueSlug;
  }
});

// Define optimized database indexes for searching and filtering
propertySchema.index({ category: 1, status: 1 });
propertySchema.index({ city: 1, area: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ isFeatured: -1 });
propertySchema.index({ views: -1 });
propertySchema.index({ createdAt: -1 });

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;
