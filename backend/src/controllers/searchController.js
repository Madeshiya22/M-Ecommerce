const asyncHandler = require('express-async-handler');
const searchService = require('../services/searchService');

// @desc   Full-text product search with suggestions
// @route  GET /api/search
// @access Public
const searchProducts = asyncHandler(async (req, res) => {
  const result = await searchService.searchProducts(req.query);
  if (result.total === 0) {
    return res.json({ success: true, data: [], suggestions: [], total: 0 });
  }

  res.json({
    success: true,
    query: result.query,
    data: result.products,
    pagination: result.pagination,
  });
});

// @desc   Get search autocomplete suggestions
// @route  GET /api/search/suggestions
// @access Public
const getSearchSuggestions = asyncHandler(async (req, res) => {
  const result = await searchService.getSearchSuggestions(req.query);
  if (result.data && result.data.length === 0) {
    return res.json({ success: true, data: [] });
  }

  res.json({
    success: true,
    data: result,
  });
});

module.exports = { searchProducts, getSearchSuggestions };
