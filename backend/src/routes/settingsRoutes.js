const express = require('express');
const router = express.Router();
const { getPublicSettings } = require('../controllers/settingsController');

// Public: limited store settings (name, banners, shipping threshold, tax)
router.get('/', getPublicSettings);

module.exports = router;
