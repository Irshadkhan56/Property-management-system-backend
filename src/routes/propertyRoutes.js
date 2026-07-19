const express = require('express');
const {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getRelatedProperties,
  getFeaturedProperties,
  getLatestProperties,
} = require('../controllers/propertyController');
const { validatePropertyInput } = require('../validators/propertyValidator');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes (with optional admin field disclosures handled in controllers)
router.get('/featured', getFeaturedProperties);
router.get('/latest', getLatestProperties);
router.get('/related/:id', getRelatedProperties);
router.get('/', getProperties);
router.get('/:id', getPropertyById);

// Protected routes (require admin authentication)
router.use(protect);

router.post('/', validatePropertyInput, createProperty);
router.put('/:id', validatePropertyInput, updateProperty);
router.delete('/:id', deleteProperty);

module.exports = router;
