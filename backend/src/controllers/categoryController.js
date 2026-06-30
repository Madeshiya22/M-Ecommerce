const asyncHandler = require('express-async-handler');
const categoryService = require('../services/categoryService');

// @desc   Get all categories
// @route  GET /api/categories
// @access Public
const getCategories = asyncHandler(async (req, res) => {
  const { count, categories } = await categoryService.getCategories(req.query);
  res.json({ success: true, count, data: categories });
});

// @desc   Get single category
// @route  GET /api/categories/:id
// @access Public
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);
  res.json({ success: true, data: category });
});

// @desc   Create category
// @route  POST /api/categories
// @access Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body, req.file);
  res.status(201).json({ success: true, data: category });
});

// @desc   Update category
// @route  PUT /api/categories/:id
// @access Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const updated = await categoryService.updateCategory(req.params.id, req.body, req.file);
  res.json({ success: true, data: updated });
});

// @desc   Delete category
// @route  DELETE /api/categories/:id
// @access Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const result = await categoryService.deleteCategory(req.params.id);
  res.json({ success: true, message: result.message });
});

// @desc   Bulk reorder categories (Admin)
// @route  PUT /api/categories/reorder
// @access Private/Admin
const reorderCategories = asyncHandler(async (req, res) => {
  const result = await categoryService.reorderCategories(req.body.orders);
  res.json({ success: true, message: result.message });
});

// @desc   Get categories with hierarchy (parent → children)
// @route  GET /api/categories/tree
// @access Public
const getCategoryTree = asyncHandler(async (req, res) => {
  const tree = await categoryService.getCategoryTree(req.query);
  res.json({ success: true, data: tree });
});

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  getCategoryTree,
};
