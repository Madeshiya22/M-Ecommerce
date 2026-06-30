const Product = require('../models/Product');
const AppError = require('../utils/AppError');

const getProducts = async (query) => {
  const {
    keyword, category, type, size, color, minPrice, maxPrice,
    sort, page = 1, limit = 12, featured, newArrival, bestSeller, gender, fit
  } = query;

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

  return { products, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } };
};

const getProductById = async (id) => {
  const product = await Product.findById(id)
    .populate('category', 'name slug type')
    .populate('reviews.user', 'name avatar');
  if (!product || !product.isActive) {
    throw new AppError('Product not found', 404);
  }
  return product;
};

const getProductBySlug = async (slug) => {
  const product = await Product.findOne({ slug, isActive: true })
    .populate('category', 'name slug type')
    .populate('reviews.user', 'name avatar');
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  return product;
};

const createProduct = async (data, files) => {
  const {
    name, description, shortDescription, price, discountPrice, category,
    type, sizes, colors, stock, sku, tags, fabric, fit, gender,
    isFeatured, isNewArrival, isBestSeller, isActive,
  } = data;

  const images = files
    ? files.map((file) => ({ url: `/uploads/${file.filename}`, alt: name }))
    : [];

  const productData = {
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
    tags: typeof tags === 'string' ? JSON.parse(tags) : tags || [],
    fabric,
    fit: fit || 'regular',
    gender: gender || 'men',
    isFeatured: isFeatured === 'true' || isFeatured === true,
    isNewArrival: isNewArrival === 'true' || isNewArrival === true,
    isBestSeller: isBestSeller === 'true' || isBestSeller === true,
    isActive: isActive !== 'false' && isActive !== false,
  };

  if (sku) {
    productData.sku = sku;
  }

  const product = await Product.create(productData);
  return product;
};

const updateProduct = async (id, data, files) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const updates = { ...data };
  if (updates.price) updates.price = Number(updates.price);
  if (updates.discountPrice !== undefined) updates.discountPrice = Number(updates.discountPrice);
  if (updates.stock !== undefined) updates.stock = Number(updates.stock);
  if (typeof updates.sizes === 'string') updates.sizes = JSON.parse(updates.sizes);
  if (typeof updates.colors === 'string') updates.colors = JSON.parse(updates.colors);
  if (typeof updates.tags === 'string') updates.tags = JSON.parse(updates.tags);

  if (updates.sku === '') {
    updates.$unset = { sku: 1 };
    delete updates.sku;
  }

  if (files && files.length > 0) {
    const newImages = files.map((file) => ({ url: `/uploads/${file.filename}`, alt: updates.name || product.name }));
    updates.images = [...(product.images || []), ...newImages];
  }

  if (updates.isFeatured !== undefined) updates.isFeatured = updates.isFeatured === 'true' || updates.isFeatured === true;
  if (updates.isNewArrival !== undefined) updates.isNewArrival = updates.isNewArrival === 'true' || updates.isNewArrival === true;
  if (updates.isBestSeller !== undefined) updates.isBestSeller = updates.isBestSeller === 'true' || updates.isBestSeller === true;
  if (updates.isActive !== undefined) updates.isActive = updates.isActive !== 'false' && updates.isActive !== false;

  const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  return updatedProduct;
};

const deleteProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product) throw new AppError('Product not found', 404);
  await product.deleteOne();
  return { message: 'Product deleted successfully' };
};

const addReview = async (id, user, data) => {
  const { rating, comment } = data;
  const product = await Product.findById(id);
  if (!product) throw new AppError('Product not found', 404);

  const alreadyReviewed = product.reviews.find((r) => r.user.toString() === user._id.toString());
  if (alreadyReviewed) {
    throw new AppError('You have already reviewed this product', 400);
  }

  product.reviews.push({ user: user._id, name: user.name, rating: Number(rating), comment });
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
  await product.save();

  return { message: 'Review added successfully' };
};

const deleteProductImage = async (id, imageIndex) => {
  const product = await Product.findById(id);
  if (!product) throw new AppError('Product not found', 404);
  product.images.splice(Number(imageIndex), 1);
  await product.save();
  return product;
};

const getProductStats = async () => {
  const [totalProducts, activeProducts, draftProducts, outOfStock, lowStock, featuredProducts, newArrivals, bestSellers] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ isActive: true, status: { $ne: 'draft' } }),
    Product.countDocuments({ status: 'draft' }),
    Product.countDocuments({ stock: 0 }),
    Product.countDocuments({ stock: { $gt: 0, $lte: 10 } }),
    Product.countDocuments({ isFeatured: true }),
    Product.countDocuments({ isNewArrival: true }),
    Product.countDocuments({ isBestSeller: true }),
  ]);

  const byType = await Product.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 } } },
  ]);

  const topRated = await Product.find({ numReviews: { $gt: 0 } })
    .sort({ rating: -1 })
    .limit(5)
    .select('name rating numReviews images price discountPrice');

  return {
    totalProducts, activeProducts, draftProducts, outOfStock, lowStock,
    featuredProducts, newArrivals, bestSellers,
    byType: byType.reduce((acc, t) => { acc[t._id] = t.count; return acc; }, {}),
    topRated,
  };
};

const getLowStockProducts = async (thresholdQuery) => {
  const threshold = parseInt(thresholdQuery) || 10;
  const products = await Product.find({ stock: { $gt: 0, $lte: threshold }, isActive: true })
    .populate('category', 'name')
    .sort({ stock: 1 })
    .select('name sku stock images price category type');
  return { count: products.length, products };
};

const bulkUpdateProducts = async (ids, updates) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new AppError('Product IDs are required', 400);
  }
  const allowed = ['isActive', 'isFeatured', 'isNewArrival', 'isBestSeller', 'status'];
  const safeUpdates = Object.fromEntries(Object.entries(updates || {}).filter(([k]) => allowed.includes(k)));
  if (Object.keys(safeUpdates).length === 0) {
    throw new AppError('No valid update fields provided', 400);
  }
  const result = await Product.updateMany({ _id: { $in: ids } }, safeUpdates);
  return { message: `${result.modifiedCount} products updated` };
};

const bulkDeleteProducts = async (ids) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new AppError('Product IDs are required', 400);
  }
  const result = await Product.deleteMany({ _id: { $in: ids } });
  return { message: `${result.deletedCount} products deleted` };
};

const exportProductsCSV = async (query) => {
  const { type, category } = query;
  const filter = {};
  if (type) filter.type = type;
  if (category) filter.category = category;

  const products = await Product.find(filter)
    .populate('category', 'name')
    .lean();

  const headers = [
    'Name', 'SKU', 'Type', 'Category', 'Brand', 'Price', 'Discount Price',
    'Stock', 'Fabric', 'Fit', 'Pattern', 'Gender', 'Sizes',
    'Featured', 'New Arrival', 'Best Seller', 'Status', 'Rating', 'Sold Count',
  ];

  const rows = products.map((p) => [
    `"${(p.name || '').replace(/"/g, '""')}"`,
    p.sku || '',
    p.type || '',
    `"${(p.category?.name || '').replace(/"/g, '""')}"`,
    p.brand || '',
    p.price || 0,
    p.discountPrice || 0,
    p.stock || 0,
    p.fabric || '',
    p.fit || '',
    p.pattern || '',
    p.gender || '',
    `"${(p.sizes || []).join(', ')}"`,
    p.isFeatured ? 'Yes' : 'No',
    p.isNewArrival ? 'Yes' : 'No',
    p.isBestSeller ? 'Yes' : 'No',
    p.status || 'published',
    p.rating || 0,
    p.soldCount || 0,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
};

module.exports = {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  deleteProductImage,
  getProductStats,
  getLowStockProducts,
  bulkUpdateProducts,
  bulkDeleteProducts,
  exportProductsCSV,
};
