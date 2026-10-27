const Product = require('../models/product.model');

const PAGE_SIZE = 20;

const SORTS = { 'price-asc': { price: 1 }, 'price-desc': { price: -1 } };

const listCategories = async () => (await Product.distinct('category', { isActive: true })).filter(Boolean).sort();

const listProducts = async ({ category, search, page = 1, shopId, sort } = {}) => {
  const filter = { isActive: true };

  if (category) {
    filter.category = category;
  }

  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }

  if (shopId) {
    filter.shopId = shopId;
  }

  const skip = (Math.max(Number(page), 1) - 1) * PAGE_SIZE;

  const [items, total] = await Promise.all([
    Product.find(filter).sort(SORTS[sort] || { createdAt: -1 }).skip(skip).limit(PAGE_SIZE),
    Product.countDocuments(filter),
  ]);

  return { items, total, page: Math.max(Number(page), 1), pageSize: PAGE_SIZE };
};

const LOW_STOCK_THRESHOLD = 5;

// Inventory snapshot for one shop owner's active listings.
const getInventorySummary = async (ownerUid) => {
  const products = await Product.find({ createdBy: ownerUid, isActive: true }).select('name stock price currency images');

  const outOfStock = products.filter((product) => product.stock === 0);
  const lowStock = products.filter((product) => product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD);

  return {
    products: products.length,
    unitsInStock: products.reduce((sum, product) => sum + product.stock, 0),
    inventoryValue: products.reduce((sum, product) => sum + product.stock * product.price, 0),
    outOfStock: outOfStock.length,
    lowStock: lowStock.length,
    lowStockThreshold: LOW_STOCK_THRESHOLD,
    needsAttention: [...outOfStock, ...lowStock]
      .slice(0, 5)
      .map((product) => ({ _id: product._id, name: product.name, stock: product.stock })),
  };
};

const getProductById = async (id) => Product.findById(id);

const createProduct = async (data, createdBy, shopId) => Product.create({ ...data, createdBy, shopId });

const updateProduct = async (id, updates, requesterUid, isAdmin) => {
  const product = await Product.findById(id);

  if (!product) {
    return { error: 'not_found' };
  }

  if (product.createdBy !== requesterUid && !isAdmin) {
    return { error: 'forbidden' };
  }

  Object.assign(product, updates);
  await product.save();

  return { product };
};

const deleteProduct = async (id, requesterUid, isAdmin) => {
  const product = await Product.findById(id);

  if (!product) {
    return { error: 'not_found' };
  }

  if (product.createdBy !== requesterUid && !isAdmin) {
    return { error: 'forbidden' };
  }

  product.isActive = false;
  await product.save();

  return {};
};

const verifyProducts = async (items) => {
  const results = await Promise.all(
    items.map(async ({ productId, quantity }) => {
      const product = await Product.findById(productId);

      if (!product || !product.isActive) {
        return { productId, quantity, ok: false, reason: 'not_found' };
      }

      if (product.stock < quantity) {
        return { productId, quantity, ok: false, reason: 'insufficient_stock' };
      }

      return { productId, quantity, ok: true, price: product.price, currency: product.currency };
    }),
  );

  return { allOk: results.every((result) => result.ok), items: results };
};

const decrementStock = async (id, quantity) => {
  const product = await Product.findOneAndUpdate(
    { _id: id, isActive: true, stock: { $gte: quantity } },
    { $inc: { stock: -quantity } },
    { new: true },
  );

  if (!product) {
    return { error: 'insufficient_stock_or_not_found' };
  }

  return { product };
};

const incrementStock = async (id, quantity) => {
  const product = await Product.findByIdAndUpdate(
    id,
    { $inc: { stock: quantity } },
    { new: true },
  );

  if (!product) {
    return { error: 'not_found' };
  }

  return { product };
};

module.exports = {
  listProducts,
  listCategories,
  getProductById,
  getInventorySummary,
  createProduct,
  updateProduct,
  deleteProduct,
  verifyProducts,
  decrementStock,
  incrementStock,
};
