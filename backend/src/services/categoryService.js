const Category = require('../models/Category');
const AppError = require('../utils/AppError');

const getCategories = async (query) => {
  const { type, isActive } = query;
  const filter = {};
  if (type) filter.type = type;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const categories = await Category.find(filter).sort({ sortOrder: 1, createdAt: -1 });
  return { count: categories.length, categories };
};

const getCategoryById = async (id) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new AppError('Category not found', 404);
  }
  return category;
};

const createCategory = async (data, file) => {
  const { name, type, description, parentCategory, sortOrder, isActive } = data;
  let image = '';
  if (file) {
    image = `/uploads/${file.filename}`;
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

  return category;
};

const updateCategory = async (id, data, file) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const { name, type, description, parentCategory, sortOrder, isActive } = data;
  if (file) category.image = `/uploads/${file.filename}`;
  if (name) category.name = name;
  if (type) category.type = type;
  if (description !== undefined) category.description = description;
  if (parentCategory !== undefined) category.parentCategory = parentCategory || null;
  if (sortOrder !== undefined) category.sortOrder = sortOrder;
  if (isActive !== undefined) category.isActive = isActive;

  return await category.save();
};

const deleteCategory = async (id) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new AppError('Category not found', 404);
  }
  await category.deleteOne();
  return { message: 'Category deleted successfully' };
};

const reorderCategories = async (orders) => {
  if (!orders || !Array.isArray(orders)) {
    throw new AppError('Orders array is required', 400);
  }

  const bulkOps = orders.map(({ id, sortOrder }) => ({
    updateOne: { filter: { _id: id }, update: { sortOrder: Number(sortOrder) } },
  }));

  await Category.bulkWrite(bulkOps);
  return { message: 'Categories reordered' };
};

const getCategoryTree = async (query) => {
  const { type } = query;
  const filter = { isActive: true };
  if (type) filter.type = type;

  const allCategories = await Category.find(filter).sort({ sortOrder: 1 });

  // Build tree: root categories with their children
  const roots = allCategories.filter((c) => !c.parentCategory);
  const tree = roots.map((root) => ({
    ...root.toObject(),
    children: allCategories.filter((c) => c.parentCategory?.toString() === root._id.toString()),
  }));

  return tree;
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  getCategoryTree,
};
