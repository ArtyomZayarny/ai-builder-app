/**
 * Send a successful API response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {Object} data - Response data
 */
export const sendSuccess = (res, statusCode = 200, data = {}) => {
  res.status(statusCode).json({
    success: true,
    ...data,
  });
};

/**
 * Send an error API response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {string} [details] - Additional error details
 */
export const sendError = (res, statusCode = 500, message = 'Internal server error', details) => {
  const response = {
    success: false,
    error: message,
  };

  if (details && process.env.NODE_ENV === 'development') {
    response.details = details;
  }

  res.status(statusCode).json(response);
};
