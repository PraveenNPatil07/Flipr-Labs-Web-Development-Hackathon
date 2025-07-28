import express from 'express';
const router = express.Router();
import {
  getInventoryValueReport,
  getStockMovementReport,
  getLowStockReport,
  getExpiryReport,
  getSalesPerformanceReport,
  getPurchaseHistoryReport
} from '../controllers/report.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

// All report routes are admin-only
router.get('/inventory-value', protect, admin, getInventoryValueReport);
router.get('/stock-movement', protect, admin, getStockMovementReport);
router.get('/low-stock', protect, admin, getLowStockReport);
router.get('/expiry', protect, admin, getExpiryReport);
router.get('/sales-performance', protect, admin, getSalesPerformanceReport);
router.get('/purchase-history', protect, admin, getPurchaseHistoryReport);

export default router;