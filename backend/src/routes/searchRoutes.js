const express = require('express');
const router = express.Router();
const { searchProducts, getSearchSuggestions } = require('../controllers/searchController');

router.get('/', searchProducts);
router.get('/suggestions', getSearchSuggestions);

module.exports = router;
