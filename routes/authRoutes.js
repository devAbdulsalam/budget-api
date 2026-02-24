const express = require('express');
const {
	register,
	login,
	refreshToken,
	getMe,
	updateProfile,
	updatePassword,
} = require('../controllers/authController');
const { protect, validateTokenRefresh } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', validateTokenRefresh, refreshToken);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/me/password', protect, updatePassword);

module.exports = router;
