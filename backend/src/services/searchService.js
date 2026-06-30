const Product = require('../models/Product');
const Category = require('../models/Category');

const searchProducts = async (query) => {
  const { q, type, category, minPrice, maxPrice, size, sort = 'newest', page = 1, limit = 12 } = query;

  if (!q || q.trim().length < 2) {
    return { data: [], suggestions: [], total: 0, query: q };
  }

  const keyword = q.trim();
  const filter = {
    isActive: true,
    status: { $ne: 'draft' },
    $or: [
      { name: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } },
      { tags: { $regex: keyword, $options: 'i' } },
      { fabric: { $regex: keyword, $options: 'i' } },
      { brand: { $regex: keyword, $options: 'i' } },
      { seoKeywords: { $regex: keyword, $options: 'i' } },
    ],
  };

  if (type) filter.type = type;
  if (category) filter.category = category;
  if (size) filter.sizes = { $in: size.split(',') };
  if (minPrice || maxPrice) {
    filter.$and = [
      {
        $or: [
          {
            discountPrice: {
              $gt: 0,
              ...(minPrice && { $gte: Number(minPrice) }),
              ...(maxPrice && { $lte: Number(maxPrice) }),
            },
          },
          {
            discountPrice: { $eq: 0 },
            price: {
              ...(minPrice && { $gte: Number(minPrice) }),
              ...(maxPrice && { $lte: Number(maxPrice) }),
            },
          },
        ],
      },
    ];
  }

  const sortMap = {
    newest: { createdAt: -1 },
    price_asc: { discountPrice: 1, price: 1 },
    price_desc: { discountPrice: -1, price: -1 },
    rating: { rating: -1 },
    popular: { soldCount: -1 },
    relevance: { soldCount: -1 },
  };
  const sortBy = sortMap[sort] || { createdAt: -1 };

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug type')
      .sort(sortBy)
      .skip(skip)
      .limit(limitNum)
      .select('-reviews'),
    Product.countDocuments(filter),
  ]);

  return { products, total, query: keyword, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } };
};

const getSearchSuggestions = async (query) => {
  const { q } = query;
  if (!q || q.trim().length < 2) {
    return { data: [] };
  }

  const keyword = q.trim();

  // Get product name suggestions
  const products = await Product.find(
    { isActive: true, name: { $regex: keyword, $options: 'i' } },
    'name slug type images'
  ).limit(5);

  // Get category suggestions
  const categories = await Category.find(
    { isActive: true, name: { $regex: keyword, $options: 'i' } },
    'name slug type'
  ).limit(3);

  // Popular tag suggestions
  const tagDocs = await Product.aggregate([
    { $match: { isActive: true, tags: { $regex: keyword, $options: 'i' } } },
    { $unwind: '$tags' },
    { $match: { tags: { $regex: keyword, $options: 'i' } } },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 4 },
  ]);

  return {
    products: products.map((p) => ({
      id: p._id,
      name: p.name,
      slug: p.slug,
      type: p.type,
      image: p.images?.[0]?.url || '',
      kind: 'product',
    })),
    categories: categories.map((c) => ({
      id: c._id,
      name: c.name,
      slug: c.slug,
      type: c.type,
      kind: 'category',
    })),
    tags: tagDocs.map((t) => ({ name: t._id, count: t.count, kind: 'tag' })),
  };
};

module.exports = {
  searchProducts,
  getSearchSuggestions,
};
