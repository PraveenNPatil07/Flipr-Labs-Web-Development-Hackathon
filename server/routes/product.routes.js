const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductCategories
} = require('../controllers/product.controller');
const { protect, admin } = require('../middleware/auth.middleware');

// Get all products and categories
router.get('/', protect, getProducts);
router.get('/categories', protect, getProductCategories);

// Get, update, delete specific product
router.get('/:id', protect, getProductById);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

// Create new product
router.post('/', protect, admin, createProduct);

module.exports = router;