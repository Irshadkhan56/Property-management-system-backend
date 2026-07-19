const express = require('express');
const {
  createOwner,
  getOwners,
  getOwnerById,
  updateOwner,
  deleteOwner,
} = require('../controllers/ownerController');
const { validateOwnerInput } = require('../validators/ownerValidator');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All owner routes require admin protection
router.use(protect);

router
  .route('/')
  .post(validateOwnerInput, createOwner)
  .get(getOwners);

router
  .route('/:id')
  .get(getOwnerById)
  .put(validateOwnerInput, updateOwner)
  .delete(deleteOwner);

module.exports = router;
