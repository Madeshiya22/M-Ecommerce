const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');

// @desc   Get all categories
// @route  GET /api/categories
// @access Public
const getCategories = asyncHandler(async (req, res) => {
  const { type, isActive } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const categories = await Category.find(filter).sort({ sortOrder: 1, createdAt: -1 });
  res.json({ success: true, count: categories.length, data: categories });
});

// @desc   Get single category
// @route  GET /api/categories/:id
// @access Public
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  res.json({ success: true, data: category });
});

// @desc   Create category
// @route  POST /api/categories
// @access Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name, type, description, parentCategory, sortOrder, isActive } = req.body;
  let image = '';
  if (req.file) {
    image = `/uploads/${req.file.filename}`;
  }

  const category = await Category.create({
    name,
    type,
    description,
    image,
    parentCategory: parentCategory || null,
    sortOrder: sortOrder || 0,
    isActive: isActive !== undefined ? isActive : true,
  });

  res.status(201).json({ success: true, data: category });
});

// @desc   Update category
// @route  PUT /api/categories/:id
// @access Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  const { name, type, description, parentCategory, sortOrder, isActive } = req.body;
  if (req.file) category.image = `/uploads/${req.file.filename}`;
  if (name) category.name = name;
  if (type) category.type = type;
  if (description !== undefined) category.description = description;
  if (parentCategory !== undefined) category.parentCategory = parentCategory || null;
  if (sortOrder !== undefined) category.sortOrder = sortOrder;
  if (isActive !== undefined) category.isActive = isActive;

  const updated = await category.save();
  res.json({ success: true, data: updated });
});

// @desc   Delete category
// @route  DELETE /api/categories/:id
// @access Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  await category.deleteOne();
  res.json({ success: true, message: 'Category deleted successfully' });
});

module.exports = { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory };

// @desc   Bulk reorder categories (Admin)
// @route  PUT /api/categories/reorder
// @access Private/Admin
const reorderCategories = asyncHandler(async (req, res) => {
  const { orders } = req.body; // [{ id, sortOrder }]
  if (!orders || !Array.isArray(orders)) {
    res.status(400);
    throw new Error('Orders array is required');
  }

  const bulkOps = orders.map(({ id, sortOrder }) => ({
    updateOne: { filter: { _id: id }, update: { sortOrder: Number(sortOrder) } },
  }));

  await Category.bulkWrite(bulkOps);
  res.json({ success: true, message: 'Categories reordered' });
});

// @desc   Get categories with hierarchy (parent → children)
// @route  GET /api/categories/tree
// @access Public
const getCategoryTree = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const filter = { isActive: true };
  if (type) filter.type = type;

  const allCategories = await Category.find(filter).sort({ sortOrder: 1 });

  // Build tree: root categories with their children
  const roots = allCategories.filter((c) => !c.parentCategory);
  const tree = roots.map((root) => ({
    ...root.toObject(),
    children: allCategories.filter((c) => c.parentCategory?.toString() === root._id.toString()),
  }));

  res.json({ success: true, data: tree });
});

module.exports = Object.assign(module.exports, { reorderCategories, getCategoryTree });
