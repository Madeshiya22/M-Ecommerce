const express = require('express');
const router = express.Router();
const { register, login, getMe, updateMe, changePassword, googleCallback } = require('../controllers/authController');
const passport = require('passport');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:5173/login?error=GoogleAuthFailed' }), googleCallback);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put('/change-password', protect, changePassword);

module.exports = router;
