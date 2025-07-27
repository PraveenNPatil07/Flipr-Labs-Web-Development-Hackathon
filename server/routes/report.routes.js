const express = require('express');
const router = express.Router();
const {
  getInventoryValueReport,
  getStockMovementReport,
  getLowStockReport,
  getExpiryReport,
  getSalesPerformanceReport,
  getPurchaseHistoryReport
} = require('../controllers/report.controller');
const { protect, admin } = require('../middleware/auth.middleware');

// All report routes are admin-only
router.get('/inventory-value', protect, admin, getInventoryValueReport);
router.get('/stock-movement', protect, admin, getStockMovementReport);
router.get('/low-stock', protect, admin, getLowStockReport);
router.get('/expiry', protect, admin, getExpiryReport);
router.get('/sales-performance', protect, admin, getSalesPerformanceReport);
router.get('/purchase-history', protect, admin, getPurchaseHistoryReport);

module.exports = router;