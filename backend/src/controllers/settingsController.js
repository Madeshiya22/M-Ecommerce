const asyncHandler = require('express-async-handler');
const Settings = require('../models/Settings');
const upload = require('../middleware/upload');

// Helper: Get or create singleton settings document
const getOrCreateSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return settings;
};

// @desc   Get store settings (Public — limited fields)
// @route  GET /api/settings
// @access Public
const getPublicSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  res.json({
    success: true,
    data: {
      storeName: settings.storeName,
      storeTagline: settings.storeTagline,
      currency: settings.currency,
      currencySymbol: settings.currencySymbol,
      taxRate: settings.taxRate,
      freeShippingThreshold: settings.freeShippingThreshold,
      defaultShippingRate: settings.defaultShippingRate,
      banners: settings.banners.filter((b) => b.isActive).sort((a, b) => a.sortOrder - b.sortOrder),
      socialLinks: settings.socialLinks,
      metaTitle: settings.metaTitle,
      metaDescription: settings.metaDescription,
    },
  });
});

// @desc   Get full store settings (Admin)
// @route  GET /api/admin/settings
// @access Private/Admin
const getSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  res.json({ success: true, data: settings });
});

// @desc   Update store settings (Admin)
// @route  PUT /api/admin/settings
// @access Private/Admin
const updateSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  const {
    storeName, storeTagline, storeEmail, storePhone, storeAddress,
    taxRate, freeShippingThreshold, defaultShippingRate, lowStockThreshold,
    metaTitle, metaDescription, metaKeywords, socialLinks,
    maintenanceMode, allowGuestCheckout, orderPrefix,
  } = req.body;

  Object.assign(settings, {
    ...(storeName !== undefined && { storeName }),
    ...(storeTagline !== undefined && { storeTagline }),
    ...(storeEmail !== undefined && { storeEmail }),
    ...(storePhone !== undefined && { storePhone }),
    ...(storeAddress !== undefined && { storeAddress }),
    ...(taxRate !== undefined && { taxRate: Number(taxRate) }),
    ...(freeShippingThreshold !== undefined && { freeShippingThreshold: Number(freeShippingThreshold) }),
    ...(defaultShippingRate !== undefined && { defaultShippingRate: Number(defaultShippingRate) }),
    ...(lowStockThreshold !== undefined && { lowStockThreshold: Number(lowStockThreshold) }),
    ...(metaTitle !== undefined && { metaTitle }),
    ...(metaDescription !== undefined && { metaDescription }),
    ...(metaKeywords !== undefined && { metaKeywords }),
    ...(socialLinks !== undefined && { socialLinks }),
    ...(maintenanceMode !== undefined && { maintenanceMode: Boolean(maintenanceMode) }),
    ...(allowGuestCheckout !== undefined && { allowGuestCheckout: Boolean(allowGuestCheckout) }),
    ...(orderPrefix !== undefined && { orderPrefix }),
  });

  await settings.save();
  res.json({ success: true, data: settings });
});

// @desc   Get all banners (Admin)
// @route  GET /api/admin/settings/banners
// @access Private/Admin
const getBanners = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  res.json({ success: true, data: settings.banners.sort((a, b) => a.sortOrder - b.sortOrder) });
});

// @desc   Add banner (Admin)
// @route  POST /api/admin/settings/banners
// @access Private/Admin
const addBanner = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  const { title, subtitle, link, buttonText, isActive, sortOrder } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : req.body.image || '';

  if (!image) {
    res.status(400);
    throw new Error('Banner image is required');
  }

  settings.banners.push({ title, subtitle, image, link, buttonText, isActive, sortOrder });
  await settings.save();
  res.status(201).json({ success: true, data: settings.banners[settings.banners.length - 1] });
});

// @desc   Update banner (Admin)
// @route  PUT /api/admin/settings/banners/:bannerId
// @access Private/Admin
const updateBanner = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  const banner = settings.banners.id(req.params.bannerId);
  if (!banner) {
    res.status(404);
    throw new Error('Banner not found');
  }

  const { title, subtitle, link, buttonText, isActive, sortOrder } = req.body;
  if (req.file) banner.image = `/uploads/${req.file.filename}`;
  if (title !== undefined) banner.title = title;
  if (subtitle !== undefined) banner.subtitle = subtitle;
  if (link !== undefined) banner.link = link;
  if (buttonText !== undefined) banner.buttonText = buttonText;
  if (isActive !== undefined) banner.isActive = isActive;
  if (sortOrder !== undefined) banner.sortOrder = Number(sortOrder);

  await settings.save();
  res.json({ success: true, data: banner });
});

// @desc   Delete banner (Admin)
// @route  DELETE /api/admin/settings/banners/:bannerId
// @access Private/Admin
const deleteBanner = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  settings.banners = settings.banners.filter((b) => b._id.toString() !== req.params.bannerId);
  await settings.save();
  res.json({ success: true, message: 'Banner deleted' });
});

// @desc   Get shipping rules (Admin)
// @route  GET /api/admin/settings/shipping
// @access Private/Admin
const getShippingRules = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  res.json({ success: true, data: settings.shippingRules });
});

// @desc   Update shipping rules (Admin)
// @route  PUT /api/admin/settings/shipping
// @access Private/Admin
const updateShippingRules = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  settings.shippingRules = req.body.shippingRules;
  await settings.save();
  res.json({ success: true, data: settings.shippingRules });
});

module.exports = {
  getPublicSettings, getSettings, updateSettings,
  getBanners, addBanner, updateBanner, deleteBanner,
  getShippingRules, updateShippingRules,
};
