const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc   Get all products
// @route  GET /api/products
// @access Public
const getProducts = asyncHandler(async (req, res) => {
  const {
    keyword, category, type, size, color, minPrice, maxPrice,
    sort, page = 1, limit = 12, featured, newArrival, bestSeller, gender, fit
  } = req.query;

  const filter = { isActive: true };

  if (keyword) filter.name = { $regex: keyword, $options: 'i' };
  if (category) filter.category = category;
  if (type) filter.type = type;
  if (size) filter.sizes = { $in: size.split(',') };
  if (color) filter['colors.name'] = { $regex: color, $options: 'i' };
  if (minPrice || maxPrice) {
    filter.$or = [
      { discountPrice: { ...(minPrice && { $gte: Number(minPrice) }), ...(maxPrice && { $lte: Number(maxPrice) }) } },
      {
        price: { ...(minPrice && { $gte: Number(minPrice) }), ...(maxPrice && { $lte: Number(maxPrice) }) },
        discountPrice: 0,
      },
    ];
  }
  if (featured === 'true') filter.isFeatured = true;
  if (newArrival === 'true') filter.isNewArrival = true;
  if (bestSeller === 'true') filter.isBestSeller = true;
  if (gender) filter.gender = gender;
  if (fit) filter.fit = fit;

  const sortOptions = {
    newest: { createdAt: -1 },
    price_asc: { discountPrice: 1, price: 1 },
    price_desc: { discountPrice: -1, price: -1 },
    rating: { rating: -1 },
    popular: { soldCount: -1 },
  };
  const sortBy = sortOptions[sort] || { createdAt: -1 };

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter).populate('category', 'name slug type').sort(sortBy).skip(skip).limit(limitNum),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: products,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

// @desc   Get single product
// @route  GET /api/products/:id
// @access Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name slug type')
    .populate('reviews.user', 'name avatar');
  if (!product || !product.isActive) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ success: true, data: product });
});

// @desc   Get product by slug
// @route  GET /api/products/slug/:slug
// @access Public
const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true })
    .populate('category', 'name slug type')
    .populate('reviews.user', 'name avatar');
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ success: true, data: product });
});

// @desc   Create product
// @route  POST /api/products
// @access Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const {
    name, description, shortDescription, price, discountPrice, category,
    type, sizes, colors, stock, sku, tags, fabric, fit, gender,
    isFeatured, isNewArrival, isBestSeller, isActive,
  } = req.body;

  const images = req.files
    ? req.files.map((file) => ({ url: `/uploads/${file.filename}`, alt: name }))
    : [];

  const product = await Product.create({
    name,
    description,
    shortDescription,
    price: Number(price),
    discountPrice: Number(discountPrice) || 0,
    images,
    category,
    type,
    sizes: typeof sizes === 'string' ? JSON.parse(sizes) : sizes || [],
    colors: typeof colors === 'string' ? JSON.parse(colors) : colors || [],
    stock: Number(stock) || 0,
    sku,
    tags: typeof tags === 'string' ? JSON.parse(tags) : tags || [],
    fabric,
    fit: fit || 'regular',
    gender: gender || 'men',
    isFeatured: isFeatured === 'true' || isFeatured === true,
    isNewArrival: isNewArrival === 'true' || isNewArrival === true,
    isBestSeller: isBestSeller === 'true' || isBestSeller === true,
    isActive: isActive !== 'false' && isActive !== false,
  });

  res.status(201).json({ success: true, data: product });
});

// @desc   Update product
// @route  PUT /api/products/:id
// @access Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const updates = { ...req.body };
  if (updates.price) updates.price = Number(updates.price);
  if (updates.discountPrice !== undefined) updates.discountPrice = Number(updates.discountPrice);
  if (updates.stock !== undefined) updates.stock = Number(updates.stock);
  if (typeof updates.sizes === 'string') updates.sizes = JSON.parse(updates.sizes);
  if (typeof updates.colors === 'string') updates.colors = JSON.parse(updates.colors);
  if (typeof updates.tags === 'string') updates.tags = JSON.parse(updates.tags);

  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((file) => ({ url: `/uploads/${file.filename}`, alt: updates.name || product.name }));
    updates.images = [...(product.images || []), ...newImages];
  }

  if (updates.isFeatured !== undefined) updates.isFeatured = updates.isFeatured === 'true' || updates.isFeatured === true;
  if (updates.isNewArrival !== undefined) updates.isNewArrival = updates.isNewArrival === 'true' || updates.isNewArrival === true;
  if (updates.isBestSeller !== undefined) updates.isBestSeller = updates.isBestSeller === 'true' || updates.isBestSeller === true;
  if (updates.isActive !== undefined) updates.isActive = updates.isActive !== 'false' && updates.isActive !== false;

  const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  res.json({ success: true, data: updatedProduct });
});

// @desc   Delete product
// @route  DELETE /api/products/:id
// @access Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted successfully' });
});

// @desc   Add product review
// @route  POST /api/products/:id/reviews
// @access Private
const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user._id.toString());
  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }

  product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
  await product.save();

  res.status(201).json({ success: true, message: 'Review added successfully' });
});

// @desc   Delete product image
// @route  DELETE /api/products/:id/images/:imageIndex
// @access Private/Admin
const deleteProductImage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  product.images.splice(Number(req.params.imageIndex), 1);
  await product.save();
  res.json({ success: true, data: product });
});

module.exports = { getProducts, getProductById, getProductBySlug, createProduct, updateProduct, deleteProduct, addReview, deleteProductImage };
