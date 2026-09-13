const { validationResult } = require('express-validator');
const shopService = require('../services/shop.service');

const listShops = async (req, res) => {
  const shops = req.user?.role === 'admin'
    ? await shopService.listAllShops()
    : await shopService.listApprovedShops();

  return res.status(200).json({ items: shops });
};

const listPendingShops = async (req, res) => {
  const shops = await shopService.listPendingShops();
  return res.status(200).json({ items: shops });
};

const getMyShop = async (req, res) => {
  const shop = await shopService.getShopByOwner(req.user.uid);

  if (!shop) {
    return res.status(404).json({ error: 'You have not requested a shop yet' });
  }

  return res.status(200).json(shop);
};

const getShop = async (req, res) => {
  const shop = await shopService.getShopById(req.params.id);

  if (!shop || shop.status !== 'approved') {
    return res.status(404).json({ error: 'Shop not found' });
  }

  return res.status(200).json(shop);
};

const requestShop = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const result = await shopService.requestShop(req.user.uid, req.body);

  if (result.error === 'already_requested') {
    return res.status(409).json({ error: 'You already have a shop or a pending request' });
  }

  return res.status(201).json(result.shop);
};

const updateShop = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const result = await shopService.updateShop(
    req.params.id,
    req.body,
    req.user.uid,
    req.user.role === 'admin',
  );

  if (result.error === 'not_found') {
    return res.status(404).json({ error: 'Shop not found' });
  }

  if (result.error === 'forbidden') {
    return res.status(403).json({ error: 'You do not own this shop' });
  }

  return res.status(200).json(result.shop);
};

const approveShop = async (req, res, next) => {
  try {
    const result = await shopService.approveShop(req.params.id);

    if (result.error === 'not_found') {
      return res.status(404).json({ error: 'Shop not found' });
    }

    return res.status(200).json(result.shop);
  } catch (error) {
    return next(error);
  }
};

const rejectShop = async (req, res) => {
  const result = await shopService.rejectShop(req.params.id, req.body.reason);

  if (result.error === 'not_found') {
    return res.status(404).json({ error: 'Shop not found' });
  }

  return res.status(200).json(result.shop);
};

module.exports = {
  listShops,
  listPendingShops,
  getMyShop,
  getShop,
  requestShop,
  updateShop,
  approveShop,
  rejectShop,
};
