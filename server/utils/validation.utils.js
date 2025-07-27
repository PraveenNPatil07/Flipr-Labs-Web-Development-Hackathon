/**
 * Validate email format
 * @param {String} email - Email to validate
 * @returns {Boolean} True if email is valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {String} password - Password to validate
 * @returns {Object} Validation result with isValid and message
 */
const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long'
    };
  }

  // Check for at least one uppercase letter, one lowercase letter, and one number
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasUppercase || !hasLowercase || !hasNumber) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    };
  }

  return {
    isValid: true,
    message: 'Password is valid'
  };
};

/**
 * Validate product data
 * @param {Object} productData - Product data to validate
 * @returns {Object} Validation result with isValid and errors
 */
const validateProductData = (productData) => {
  const errors = {};

  // Required fields
  if (!productData.name) errors.name = 'Product name is required';
  if (!productData.sku) errors.sku = 'SKU is required';
  
  // Numeric fields
  if (productData.price && isNaN(productData.price)) {
    errors.price = 'Price must be a number';
  }
  
  if (productData.stock && isNaN(productData.stock)) {
    errors.stock = 'Stock must be a number';
  }
  
  if (productData.threshold && isNaN(productData.threshold)) {
    errors.threshold = 'Threshold must be a number';
  }
  
  // Date fields
  if (productData.expiryDate && isNaN(Date.parse(productData.expiryDate))) {
    errors.expiryDate = 'Expiry date must be a valid date';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate inventory update data
 * @param {Object} updateData - Inventory update data to validate
 * @returns {Object} Validation result with isValid and errors
 */
const validateInventoryUpdate = (updateData) => {
  const errors = {};

  // Required fields
  if (!updateData.productId) errors.productId = 'Product ID is required';
  if (!updateData.action) errors.action = 'Action is required';
  if (updateData.quantity === undefined) errors.quantity = 'Quantity is required';
  
  // Validate action
  if (updateData.action && !['Add', 'Remove', 'Update'].includes(updateData.action)) {
    errors.action = 'Action must be Add, Remove, or Update';
  }
  
  // Validate quantity
  if (updateData.quantity !== undefined) {
    if (isNaN(updateData.quantity)) {
      errors.quantity = 'Quantity must be a number';
    } else if (updateData.quantity <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

module.exports = {
  isValidEmail,
  validatePassword,
  validateProductData,
  validateInventoryUpdate
};