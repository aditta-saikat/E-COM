const Shop = require('../models/shop.model');
const authServiceClient = require('./authService.client');

const listApprovedShops = async () => Shop.find({ status: 'approved' }).sort({ createdAt: -1 });

const listAllShops = async () => Shop.find().sort({ createdAt: -1 });

const listPendingShops = async () => Shop.find({ status: 'pending' }).sort({ createdAt: 1 });

const getShopByOwner = async (ownerId) => Shop.findOne({ ownerId });

const getShopById = async (id) => Shop.findById(id);

const requestShop = async (ownerId, { name, description }) => {
  const existingShop = await Shop.findOne({ ownerId });

  if (existingShop) {
    return { error: 'already_requested' };
  }

  const shop = await Shop.create({ ownerId, name, description });

  return { shop };
};

const updateShop = async (id, updates, requesterUid, isAdmin) => {
  const shop = await Shop.findById(id);

  if (!shop) {
    return { error: 'not_found' };
  }

  if (shop.ownerId !== requesterUid && !isAdmin) {
    return { error: 'forbidden' };
  }

  Object.assign(shop, updates);
  await shop.save();

  return { shop };
};

const approveShop = async (id) => {
  const shop = await Shop.findById(id);

  if (!shop) {
    return { error: 'not_found' };
  }

  shop.status = 'approved';
  shop.rejectionReason = '';
  await shop.save();

  await authServiceClient.setUserRole(shop.ownerId, 'shop_admin');

  return { shop };
};

const rejectShop = async (id, reason) => {
  const shop = await Shop.findById(id);

  if (!shop) {
    return { error: 'not_found' };
  }

  shop.status = 'rejected';
  shop.rejectionReason = reason || '';
  await shop.save();

  return { shop };
};

module.exports = {
  listApprovedShops,
  listAllShops,
  listPendingShops,
  getShopByOwner,
  getShopById,
  requestShop,
  updateShop,
  approveShop,
  rejectShop,
};
