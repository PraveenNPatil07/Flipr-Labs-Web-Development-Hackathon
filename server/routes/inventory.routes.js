const express = require('express');
const router = express.Router();
const {
  updateStock,
  getInventoryLogs,
  getLowStockProducts,
  getInventoryStats
} = require('../controllers/inventory.controller');
const { protect, admin } = require('../middleware/auth.middleware');

// Stock update and logs
router.post('/update', protect, updateStock);
router.get('/logs', protect, getInventoryLogs);

// Low stock and statistics
router.get('/low-stock', protect, getLowStockProducts);
router.get('/stats', protect, getInventoryStats);

module.exports = router;