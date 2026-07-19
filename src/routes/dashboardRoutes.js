const express = require('express');
const { getStats, getAnalytics } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Enforce admin access across all statistics and analytics sub-paths
router.use(protect);

router.get('/stats', getStats);
router.get('/analytics', getAnalytics);

module.exports = router;
