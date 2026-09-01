const Product = require('../models/product.model');

const PAGE_SIZE = 20;

const listProducts = async ({ category, search, page = 1 } = {}) => {
  const filter = { isActive: true };

  if (category) {
    filter.category = category;
  }

  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }

  const skip = (Math.max(Number(page), 1) - 1) * PAGE_SIZE;

  const [items, total] = await Promise.all([
    Product.find(filter).skip(skip).limit(PAGE_SIZE).sort({ createdAt: -1 }),
    Product.countDocuments(filter),
  ]);

  return { items, total, page: Math.max(Number(page), 1), pageSize: PAGE_SIZE };
};

const getProductById = async (id) => Product.findById(id);

const createProduct = async (data, createdBy) => Product.create({ ...data, createdBy });

const updateProduct = async (id, updates, requesterUid) => {
  const product = await Product.findById(id);

  if (!product) {
    return { error: 'not_found' };
  }

  if (product.createdBy !== requesterUid) {
    return { error: 'forbidden' };
  }

  Object.assign(product, updates);
  await product.save();

  return { product };
};

const deleteProduct = async (id, requesterUid) => {
  const product = await Product.findById(id);

  if (!product) {
    return { error: 'not_found' };
  }

  if (product.createdBy !== requesterUid) {
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
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  verifyProducts,
  decrementStock,
  incrementStock,
};
