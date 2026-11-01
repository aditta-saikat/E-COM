// Clients must never be able to present the internal key (or fake a forwarded identity) from the outside.
const INTERNAL_HEADERS = ['x-internal-api-key', 'x-user-id', 'x-user-role'];

const stripInternalHeaders = (req, res, next) => {
  INTERNAL_HEADERS.forEach((name) => delete req.headers[name]);
  next();
};

module.exports = stripInternalHeaders;
