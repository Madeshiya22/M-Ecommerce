const Settings = require('../models/Settings');
const AppError = require('../utils/AppError');

// Helper: Get or create singleton settings document
const getOrCreateSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return settings;
};

const getPublicSettings = async () => {
  const settings = await getOrCreateSettings();
  return {
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
  };
};

const getSettings = async () => {
  const settings = await getOrCreateSettings();
  return settings;
};

const updateSettings = async (data) => {
  const settings = await getOrCreateSettings();
  const {
    storeName, storeTagline, storeEmail, storePhone, storeAddress,
    taxRate, freeShippingThreshold, defaultShippingRate, lowStockThreshold,
    metaTitle, metaDescription, metaKeywords, socialLinks,
    maintenanceMode, allowGuestCheckout, orderPrefix,
  } = data;

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
  return settings;
};

const getBanners = async () => {
  const settings = await getOrCreateSettings();
  return settings.banners.sort((a, b) => a.sortOrder - b.sortOrder);
};

const addBanner = async (data, file) => {
  const settings = await getOrCreateSettings();
  const { title, subtitle, link, buttonText, isActive, sortOrder } = data;
  const image = file ? `/uploads/${file.filename}` : data.image || '';

  if (!image) {
    throw new AppError('Banner image is required', 400);
  }

  settings.banners.push({ title, subtitle, image, link, buttonText, isActive, sortOrder });
  await settings.save();
  return settings.banners[settings.banners.length - 1];
};

const updateBanner = async (bannerId, data, file) => {
  const settings = await getOrCreateSettings();
  const banner = settings.banners.id(bannerId);
  if (!banner) {
    throw new AppError('Banner not found', 404);
  }

  const { title, subtitle, link, buttonText, isActive, sortOrder } = data;
  if (file) banner.image = `/uploads/${file.filename}`;
  if (title !== undefined) banner.title = title;
  if (subtitle !== undefined) banner.subtitle = subtitle;
  if (link !== undefined) banner.link = link;
  if (buttonText !== undefined) banner.buttonText = buttonText;
  if (isActive !== undefined) banner.isActive = isActive;
  if (sortOrder !== undefined) banner.sortOrder = Number(sortOrder);

  await settings.save();
  return banner;
};

const deleteBanner = async (bannerId) => {
  const settings = await getOrCreateSettings();
  settings.banners = settings.banners.filter((b) => b._id.toString() !== bannerId);
  await settings.save();
  return { message: 'Banner deleted' };
};

const getShippingRules = async () => {
  const settings = await getOrCreateSettings();
  return settings.shippingRules;
};

const updateShippingRules = async (rules) => {
  const settings = await getOrCreateSettings();
  settings.shippingRules = rules;
  await settings.save();
  return settings.shippingRules;
};

module.exports = {
  getPublicSettings,
  getSettings,
  updateSettings,
  getBanners,
  addBanner,
  updateBanner,
  deleteBanner,
  getShippingRules,
  updateShippingRules,
};
