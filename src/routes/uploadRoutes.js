const express = require('express');
const { uploadFiles } = require('../controllers/uploadController');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Only admin accounts are permitted to upload media assets
router.post('/', protect, upload.any(), uploadFiles);

module.exports = router;
