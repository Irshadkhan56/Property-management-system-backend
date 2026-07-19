const express = require('express');
const { login, getMe, logout } = require('../controllers/adminController');
const { validateLoginInput } = require('../validators/adminValidator');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', validateLoginInput, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
