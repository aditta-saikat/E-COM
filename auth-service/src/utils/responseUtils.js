/**
 * Success Response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {object} data - Response data
 */
const successResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message,
    ...(data && { data }),
  };

  return res.status(statusCode).json(response);
};

/**
 * Error Response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {object} errors - Validation errors (optional)
 */
const errorResponse = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message,
    ...(errors && { errors }),
  };

  return res.status(statusCode).json(response);
};

/**
 * Pagination Response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {Array} data - Array of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 */
const paginationResponse = (res, statusCode, message, data, page, limit, total) => {
  const response = {
    success: true,
    message,
    data,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    },
  };

  return res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  errorResponse,
  paginationResponse,
};