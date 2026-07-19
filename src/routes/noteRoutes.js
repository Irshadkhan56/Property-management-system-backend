const express = require('express');
const { addNote, getNotes, getTimeline } = require('../controllers/noteController');
const { validateNoteInput } = require('../validators/crmValidator');
const { protect } = require('../middleware/authMiddleware');

// mergeParams: true enables inheriting :propertyId from the parent router mounting
const router = express.Router({ mergeParams: true });

// All notes and timeline audit logs are strictly protected (Admin Only)
router.use(protect);

router.route('/notes')
  .post(validateNoteInput, addNote)
  .get(getNotes);

router.get('/timeline', getTimeline);

module.exports = router;
