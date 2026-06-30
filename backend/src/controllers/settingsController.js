const asyncHandler = require('express-async-handler');
const settingsService = require('../services/settingsService');

// @desc   Get store settings (Public — limited fields)
// @route  GET /api/settings
// @access Public
const getPublicSettings = asyncHandler(async (req, res) => {
  const data = await settingsService.getPublicSettings();
  res.json({ success: true, data });
});

// @desc   Get full store settings (Admin)
// @route  GET /api/admin/settings
// @access Private/Admin
const getSettings = asyncHandler(async (req, res) => {
  const data = await settingsService.getSettings();
  res.json({ success: true, data });
});

// @desc   Update store settings (Admin)
// @route  PUT /api/admin/settings
// @access Private/Admin
const updateSettings = asyncHandler(async (req, res) => {
  const data = await settingsService.updateSettings(req.body);
  res.json({ success: true, data });
});

// @desc   Get all banners (Admin)
// @route  GET /api/admin/settings/banners
// @access Private/Admin
const getBanners = asyncHandler(async (req, res) => {
  const data = await settingsService.getBanners();
  res.json({ success: true, data });
});

// @desc   Add banner (Admin)
// @route  POST /api/admin/settings/banners
// @access Private/Admin
const addBanner = asyncHandler(async (req, res) => {
  const data = await settingsService.addBanner(req.body, req.file);
  res.status(201).json({ success: true, data });
});

// @desc   Update banner (Admin)
// @route  PUT /api/admin/settings/banners/:bannerId
// @access Private/Admin
const updateBanner = asyncHandler(async (req, res) => {
  const data = await settingsService.updateBanner(req.params.bannerId, req.body, req.file);
  res.json({ success: true, data });
});

// @desc   Delete banner (Admin)
// @route  DELETE /api/admin/settings/banners/:bannerId
// @access Private/Admin
const deleteBanner = asyncHandler(async (req, res) => {
  const result = await settingsService.deleteBanner(req.params.bannerId);
  res.json({ success: true, message: result.message });
});

// @desc   Get shipping rules (Admin)
// @route  GET /api/admin/settings/shipping
// @access Private/Admin
const getShippingRules = asyncHandler(async (req, res) => {
  const data = await settingsService.getShippingRules();
  res.json({ success: true, data });
});

// @desc   Update shipping rules (Admin)
// @route  PUT /api/admin/settings/shipping
// @access Private/Admin
const updateShippingRules = asyncHandler(async (req, res) => {
  const data = await settingsService.updateShippingRules(req.body.shippingRules);
  res.json({ success: true, data });
});

module.exports = {
  getPublicSettings, getSettings, updateSettings,
  getBanners, addBanner, updateBanner, deleteBanner,
  getShippingRules, updateShippingRules,
};
