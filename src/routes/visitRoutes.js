const express = require('express');
const {
  createVisit,
  getVisits,
  updateVisit,
  deleteVisit,
} = require('../controllers/visitController');
const { validateVisitInput } = require('../validators/crmValidator');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public visit booking route
router.post('/', validateVisitInput, createVisit);

// Protected admin routes
router.use(protect);

router.get('/', getVisits);
router.route('/:id')
  .put(validateVisitInput, updateVisit)
  .delete(deleteVisit);

module.exports = router;
