const express = require('express');
const {
  createInquiry,
  getInquiries,
  updateInquiry,
  deleteInquiry,
} = require('../controllers/inquiryController');
const { validateInquiryInput } = require('../validators/crmValidator');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public inquiry submission route
router.post('/', validateInquiryInput, createInquiry);

// Protected admin routes
router.use(protect);

router.get('/', getInquiries);
router.route('/:id')
  .put(validateInquiryInput, updateInquiry)
  .delete(deleteInquiry);

module.exports = router;
