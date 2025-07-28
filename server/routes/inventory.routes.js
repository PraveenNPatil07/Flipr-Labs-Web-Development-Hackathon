import express from 'express';
import { updateStock, getInventoryLogs, getLowStockProducts, getInventoryStats } from '../controllers/inventory.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';
const router = express.Router();

// Stock update and logs
router.post('/update', protect, updateStock);
router.get('/logs', protect, getInventoryLogs);

// Low stock and statistics
router.get('/low-stock', protect, getLowStockProducts);
router.get('/stats', protect, getInventoryStats);

export default router;