import Product from '../models/product.model.js';
import InventoryLog from '../models/inventoryLog.model.js';
import User from '../models/user.model.js';
import { Op, literal, fn } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * @desc Generates a report on the total inventory value, broken down by category, and lists top products by value.
 * @route GET /api/reports/inventory-value
 * @access Private/Admin
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void} Sends a JSON response with inventory value statistics.
 */
const getInventoryValueReport = async (req, res) => {
  try {
    const categoryValues = await Product.findAll({
      attributes: [
        'category',
        [fn('COUNT', sequelize.literal('id')), 'productCount'],
        [fn('SUM', sequelize.literal('stock')), 'totalStock'],
        [fn('SUM', sequelize.literal('CAST(stock AS DECIMAL) * CAST(price AS DECIMAL)')), 'totalValue']
      ],
      group: ['category'],
      order: [[literal('"totalValue"'), 'DESC']]
    });

    const totalValueResult = await sequelize.query(
      `SELECT SUM(CAST(stock AS DECIMAL) * CAST(price AS DECIMAL)) AS "totalValue" FROM "Products";`,
      { type: sequelize.QueryTypes.SELECT }
    );
    const totalValue = totalValueResult?.[0]?.totalValue || 0;

    const totalProductsCount = await Product.count();

    const topProducts = await Product.findAll({
      attributes: [
        'id', 'name', 'sku', 'category', 'stock', 'price',
        [literal('"stock" * "price"'), 'totalValue']
      ],
      order: [[literal('"totalValue"'), 'DESC']],
      limit: 10
    });

    res.json({
      categoryValues,
      totalValue: totalValue || 0,
      totalProducts: totalProductsCount,
      topProducts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc Generates a report on stock movements, including movements by action, by day, top moved products, and top active users.
 * @route GET /api/reports/stock-movement
 * @access Private/Admin
 * @param {Object} req - The request object.
 * @param {Object} req.query - Query parameters for date range.
 * @param {string} [req.query.startDate] - Start date for the report (ISO 8601 format). Defaults to one month ago.
 * @param {string} [req.query.endDate] - End date for the report (ISO 8601 format). Defaults to current date.
 * @param {Object} res - The response object.
 * @returns {void} Sends a JSON response with stock movement statistics.
 */
const getStockMovementReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const movementByAction = await InventoryLog.findAll({
      attributes: [
        'action',
        [fn('COUNT', sequelize.literal('id')), 'count'],
        [fn('SUM', sequelize.literal('quantity')), 'totalQuantity']
      ],
      where: {
        createdAt: {
          [Op.between]: [start, end]
        }
      },
      group: ['action']
    });

    const movementByDay = await InventoryLog.findAll({
      attributes: [
        [fn('DATE', sequelize.literal('createdAt')), 'date'],
        'action',
        [fn('SUM', sequelize.literal('quantity')), 'totalQuantity']
      ],
      where: {
        createdAt: {
          [Op.between]: [start, end]
        }
      },
      group: [fn('DATE', sequelize.literal('createdAt')), 'action'],
      order: [['date', 'ASC']]
    });

    const topMovedProducts = await InventoryLog.findAll({
      attributes: [
        'productId',
        [fn('SUM', sequelize.literal('quantity')), 'totalQuantity'],
        [fn('COUNT', sequelize.literal('id')), 'movementCount']
      ],
      where: {
        createdAt: {
          [Op.between]: [start, end]
        }
      },
      include: [{
        model: Product,
        attributes: ['name', 'sku', 'category']
      }],
      group: ['productId', 'Product.id'],
      order: [['totalQuantity', 'DESC']],
      limit: 10
    });

    const topActiveUsers = await InventoryLog.findAll({
      attributes: [
        'userId',
        [fn('COUNT', sequelize.literal('id')), 'activityCount']
      ],
      where: {
        createdAt: {
          [Op.between]: [start, end]
        }
      },
      include: [{
        model: User,
        attributes: ['username', 'email', 'role']
      }],
      group: ['userId', 'User.id'],
      order: [['activityCount', 'DESC']],
      limit: 5
    });

    console.log('movementByAction:', movementByAction);
    console.log('movementByDay:', movementByDay);
    console.log('topMovedProducts:', topMovedProducts);
    console.log('topActiveUsers:', topActiveUsers);

    res.json({
      dateRange: {
        startDate: start,
        endDate: end
      },
      movementByAction,
      movementByDay,
      topMovedProducts,
      topActiveUsers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc Generates a report on products that are currently in low stock, categorized and ordered by stock ratio.
 * @route GET /api/reports/low-stock
 * @access Private/Admin
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void} Sends a JSON response with low stock product details.
 */
const getLowStockReport = async (req, res) => {
  try {
    const lowStockProducts = await Product.findAll({
      where: {
        stock: {
          [Op.lte]: sequelize.literal('threshold')
        }
      },
      attributes: {
        include: [[literal('"stock" / "threshold"'), 'ratio']]
      },
      order: [['ratio', 'ASC']]
    });

    res.json({
      lowStockProducts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }}
/**
 * @desc Generates a sales performance report.
 * @route GET /api/reports/sales-performance
 * @access Private/Admin
 * @param {Object} req - The request object.
 * @param {Object} req.query - Query parameters for date range.
 * @param {string} [req.query.startDate] - Start date for the report (ISO 8601 format). Defaults to one month ago.
 * @param {string} [req.query.endDate] - End date for the report (ISO 8601 format). Defaults to current date.
 * @param {Object} res - The response object.
 * @returns {void} Sends a JSON response with sales performance data.
 */
const getSalesPerformanceReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Placeholder for sales data - in a real app, this would query sales transactions
    const salesData = [
      { date: '2023-01-01', sales: 1000, units: 50 },
      { date: '2023-01-02', sales: 1200, units: 60 },
      { date: '2023-01-03', sales: 900, units: 45 },
    ];

    res.json({
      dateRange: { startDate: start, endDate: end },
      totalSales: salesData.reduce((sum, item) => sum + item.sales, 0),
      totalUnitsSold: salesData.reduce((sum, item) => sum + item.units, 0),
      salesTrend: salesData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc Generates a purchase history report.
 * @route GET /api/reports/purchase-history
 * @access Private/Admin
 * @param {Object} req - The request object.
 * @param {Object} req.query - Query parameters for date range.
 * @param {string} [req.query.startDate] - Start date for the report (ISO 8601 format). Defaults to one month ago.
 * @param {string} [req.query.endDate] - End date for the report (ISO 8601 format). Defaults to current date.
 * @param {Object} res - The response object.
 * @returns {void} Sends a JSON response with purchase history data.
 */
const getPurchaseHistoryReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Placeholder for purchase data - in a real app, this would query purchase transactions
    const purchaseData = [
      { date: '2023-01-01', purchases: 800, items: 40 },
      { date: '2023-01-02', purchases: 1100, items: 55 },
      { date: '2023-01-03', purchases: 700, items: 35 },
    ];

    res.json({
      dateRange: { startDate: start, endDate: end },
      totalPurchases: purchaseData.reduce((sum, item) => sum + item.purchases, 0),
      totalItemsPurchased: purchaseData.reduce((sum, item) => sum + item.items, 0),
      purchaseTrend: purchaseData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc Generates a report on product expiry, including expired, expiring soon, and expiry by month.
 * @route GET /api/reports/expiry
 * @access Private/Admin
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void} Sends a JSON response with product expiry statistics.
 */
const getExpiryReport = async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const expiredProducts = await Product.findAll({
      where: {
        expiryDate: {
          [Op.lt]: today
        },
        stock: {
          [Op.gt]: 0
        }
      },
      order: [['expiryDate', 'ASC']]
    });

    const expiringProducts = await Product.findAll({
      where: {
        expiryDate: {
          [Op.between]: [today, thirtyDaysFromNow]
        },
        stock: {
          [Op.gt]: 0
        }
      },
      order: [['expiryDate', 'ASC']]
    });

    const expiryByMonth = await Product.findAll({
      attributes: [
        [fn('DATE_TRUNC', 'month', sequelize.literal('expiryDate')), 'month'],
        [fn('COUNT', sequelize.literal('id')), 'productCount'],
        [fn('SUM', sequelize.literal('stock')), 'totalStock']
      ],
      where: {
        expiryDate: {
          [Op.not]: null
        },
        stock: {
          [Op.gt]: 0
        }
      },
      group: [fn('DATE_TRUNC', 'month', sequelize.literal('expiryDate'))],
      order: [['month', 'ASC']]
    });

    res.json({
      expiredProducts,
      expiringProducts,
      expiryByMonth,
      summary: {
        totalExpired: expiredProducts.length,
        totalExpiringSoon: expiringProducts.length
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
export {
  getInventoryValueReport,
  getStockMovementReport,
  getLowStockReport,
  getExpiryReport,
  getSalesPerformanceReport,
  getPurchaseHistoryReport
}
