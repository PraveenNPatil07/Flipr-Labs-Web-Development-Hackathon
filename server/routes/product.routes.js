import express from 'express';
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct, getProductCategories } from '../controllers/product.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';
const router = express.Router();

// Get all products and categories
router.get('/', protect, getProducts);
router.get('/categories', protect, getProductCategories);

// Get, update, delete specific product
router.get('/:id', protect, getProductById);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

// Create new product
router.post('/', protect, admin, createProduct);

export default router;