const asyncHandler = require('express-async-handler');
const productService = require('../services/productService');

// @desc   Get all products
// @route  GET /api/products
// @access Public
const getProducts = asyncHandler(async (req, res) => {
  const { products, pagination } = await productService.getProducts(req.query);
  res.json({
    success: true,
    data: products,
    pagination,
  });
});

// @desc   Get single product
// @route  GET /api/products/:id
// @access Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  res.json({ success: true, data: product });
});

// @desc   Get product by slug
// @route  GET /api/products/slug/:slug
// @access Public
const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await productService.getProductBySlug(req.params.slug);
  res.json({ success: true, data: product });
});

// @desc   Create product
// @route  POST /api/products
// @access Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body, req.files);
  res.status(201).json({ success: true, data: product });
});

// @desc   Update product
// @route  PUT /api/products/:id
// @access Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const updatedProduct = await productService.updateProduct(req.params.id, req.body, req.files);
  res.json({ success: true, data: updatedProduct });
});

// @desc   Delete product
// @route  DELETE /api/products/:id
// @access Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const result = await productService.deleteProduct(req.params.id);
  res.json({ success: true, message: result.message });
});

// @desc   Add product review
// @route  POST /api/products/:id/reviews
// @access Private
const addReview = asyncHandler(async (req, res) => {
  const result = await productService.addReview(req.params.id, req.user, req.body);
  res.status(201).json({ success: true, message: result.message });
});

// @desc   Delete product image
// @route  DELETE /api/products/:id/images/:imageIndex
// @access Private/Admin
const deleteProductImage = asyncHandler(async (req, res) => {
  const product = await productService.deleteProductImage(req.params.id, req.params.imageIndex);
  res.json({ success: true, data: product });
});

// @desc   Get product statistics (Admin)
// @route  GET /api/admin/products/stats
// @access Private/Admin
const getProductStats = asyncHandler(async (req, res) => {
  const data = await productService.getProductStats();
  res.json({ success: true, data });
});

// @desc   Get low stock products (Admin)
// @route  GET /api/admin/products/low-stock
// @access Private/Admin
const getLowStockProducts = asyncHandler(async (req, res) => {
  const { count, products } = await productService.getLowStockProducts(req.query.threshold);
  res.json({ success: true, count, data: products });
});

// @desc   Bulk update products (Admin)
// @route  PUT /api/admin/products/bulk
// @access Private/Admin
const bulkUpdateProducts = asyncHandler(async (req, res) => {
  const result = await productService.bulkUpdateProducts(req.body.ids, req.body.updates);
  res.json({ success: true, message: result.message });
});

// @desc   Bulk delete products (Admin)
// @route  DELETE /api/admin/products/bulk
// @access Private/Admin
const bulkDeleteProducts = asyncHandler(async (req, res) => {
  const result = await productService.bulkDeleteProducts(req.body.ids);
  res.json({ success: true, message: result.message });
});

// @desc   Export products as CSV (Admin)
// @route  GET /api/admin/products/export
// @access Private/Admin
const exportProductsCSV = asyncHandler(async (req, res) => {
  const csv = await productService.exportProductsCSV(req.query);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');
  res.send(csv);
});

module.exports = {
  getProducts, getProductById, getProductBySlug,
  createProduct, updateProduct, deleteProduct,
  addReview, deleteProductImage,
  getProductStats, getLowStockProducts,
  bulkUpdateProducts, bulkDeleteProducts, exportProductsCSV,
};
