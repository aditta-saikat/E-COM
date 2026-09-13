const requireInternalKey = (req, res, next) => {
  const providedKey = req.get('x-internal-api-key');

  if (!process.env.INTERNAL_API_KEY || providedKey !== process.env.INTERNAL_API_KEY) {
    return res.status(401).json({ error: 'A valid internal API key is required' });
  }

  return next();
};

module.exports = { requireInternalKey };
