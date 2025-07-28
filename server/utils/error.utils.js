/**
 * @class ApiError
 * @augments Error
 * @description Custom error class for API errors with a specific status code.
 */
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * @class NotFoundError
 * @augments ApiError
 * @description Represents a 404 Not Found error.
 */
class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

/**
 * @class BadRequestError
 * @augments ApiError
 * @description Represents a 400 Bad Request error.
 */
class BadRequestError extends ApiError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

/**
 * @class UnauthorizedError
 * @augments ApiError
 * @description Represents a 401 Unauthorized error.
 */
class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

/**
 * @class ForbiddenError
 * @augments ApiError
 * @description Represents a 403 Forbidden error.
 */
class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

/**
 * @class ValidationError
 * @augments ApiError
 * @description Represents a 422 Unprocessable Entity error, typically used for validation failures.
 */
class ValidationError extends ApiError {
  constructor(message = 'Validation failed', errors = {}) {
    super(message, 422);
    this.errors = errors;
  }
}

/**
 * @function errorHandler
 * @description Global error handling middleware for Express.
 * @param {Error} err - The error object.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void} Sends a JSON response with error details.
 */
const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';
  let errors = err.errors || null;

  // Handle Sequelize errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 422;
    message = 'Validation error';
    errors = {};
    
    err.errors.forEach((error) => {
      errors[error.path] = error.message;
    });
  }

  // Send response
  res.status(statusCode).json({
    message,
    errors,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

export {
  ApiError,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  errorHandler
};