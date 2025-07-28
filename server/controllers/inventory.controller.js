import { Op, col, fn, literal } from 'sequelize';
import { sequelize } from '../config/database.js';
import Product from '../models/product.model.js';
import InventoryLog from '../models/inventoryLog.model.js';
import User from '../models/user.model.js';

/**
 * @desc Updates the stock of a product and logs the inventory movement.
 * @route POST /api/inventory/update
 * @access Private
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing inventory update details.
 * @param {string} req.body.productId - The ID of the product to update.
 * @param {'Add'|'Remove'|'Update'} req.body.action - The type of inventory action.
 * @param {number} req.body.quantity - The quantity to add, remove, or set.
 * @param {string} [req.body.notes] - Optional notes for the inventory log.
 * @param {Object} res - The response object.
 * @returns {void} Sends a JSON response with the updated inventory log details.
 */
const updateStock = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { productId, action, quantity, notes } = req.body;

    if (!['Add', 'Remove', 'Update'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be Add, Remove, or Update' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    const product = await Product.findByPk(productId, { transaction });

    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Product not found' });
    }

    const previousStock = product.stock;
    let newStock = previousStock;

    switch (action) {
      case 'Add':
        newStock += quantity;
        break;
      case 'Remove':
        if (previousStock < quantity) {
          await transaction.rollback();
          return res.status(400).json({
            message: 'Insufficient stock',
            currentStock: previousStock,
            requestedQuantity: quantity
          });
        }
        newStock -= quantity;
        break;
      case 'Update':
        newStock = quantity;
        break;
    }

    product.stock = newStock;
    await product.save({ transaction });

    const log = await InventoryLog.create({
      productId,
      userId: req.user.id,
      action,
      quantity,
      previousStock,
      newStock,
      notes: notes || ''
    }, { transaction });

    await transaction.commit();

    const logWithDetails = await InventoryLog.findByPk(log.id, {
      include: [
        { model: Product, attributes: ['id', 'name', 'sku'] },
        { model: User, attributes: ['id', 'username'] }
      ]
    });

    res.status(200).json(logWithDetails);
  } catch (error) {
    await transaction.rollback();
    console.error('[Update Stock Error]', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc Retrieves a list of inventory logs with optional filtering and pagination.
 * @route GET /api/inventory/logs
 * @access Private
 * @param {Object} req - The request object.
 * @param {Object} req.query - The query parameters for filtering and pagination.
 * @param {string} [req.query.productId] - Filter logs by product ID.
 * @param {string} [req.query.userId] - Filter logs by user ID.
 * @param {'Add'|'Remove'|'Update'} [req.query.action] - Filter logs by action type.
 * @param {string} [req.query.startDate] - Filter logs from this date (ISO 8601).
 * @param {string} [req.query.endDate] - Filter logs up to this date (ISO 8601).
 * @param {number} [req.query.limit=50] - The maximum number of logs to return per page.
 * @param {number} [req.query.page=1] - The page number for pagination.
 * @param {Object} res - The response object.
 * @returns {void} Sends a JSON response with the paginated inventory logs and total count.
 */
const getInventoryLogs = async (req, res) => {
  try {
    const { productId, userId, action, startDate, endDate, limit = 50, page = 1 } = req.query;

    const whereClause = {};

    if (productId) whereClause.productId = productId;
    if (userId) whereClause.userId = userId;
    if (action) whereClause.action = action;

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
      if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
    }

    const offset = (page - 1) * limit;

    const logs = await InventoryLog.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        { model: Product, attributes: ['id', 'name', 'sku'] },
        { model: User, attributes: ['id', 'username'] }
      ]
    });

    res.json({
      logs: logs.rows,
      page: parseInt(page),
      pages: Math.ceil(logs.count / limit),
      total: logs.count
    });
  } catch (error) {
    console.error('[Get Inventory Logs Error]', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc Retrieves a list of products that are currently in low stock (stock <= threshold).
 * @route GET /api/inventory/low-stock
 * @access Private
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void} Sends a JSON response with an array of low stock products.
 */
const getLowStockProducts = async (req, res) => {
  try {
    const lowStockProducts = await Product.findAll({
      where: literal('"stock" <= "threshold"'), // ✅ FIX: Replaces Op.lte with raw literal condition
      order: [
        [literal('(stock * 1.0 / threshold)'), 'ASC'] // Avoid integer division
      ]
    });

    res.json(lowStockProducts);
  } catch (error) {
    console.error('[Get Low Stock Products Error]', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc Retrieves various statistics about the inventory, including total products, stock value, low stock count, out of stock count, and recent activity.
 * @route GET /api/inventory/stats
 * @access Private
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void} Sends a JSON response with inventory statistics.
 */
const getInventoryStats = async (req, res) => {
  try {
    const totalProducts = await Product.count();

    const stockValueResult = await Product.findOne({
      attributes: [[fn('SUM', literal('"stock" * "price"')), 'value']]
    });

    const stockValue = parseFloat(stockValueResult?.dataValues?.value || 0);

    const lowStockCountResult = await Product.count({
      where: literal('"stock" <= "threshold"') // ✅ FIX: literal used directly
    });

    const outOfStockCount = await Product.count({ where: { stock: 0 } });

    const recentActivity = await InventoryLog.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        { model: Product, attributes: ['id', 'name', 'sku'] },
        { model: User, attributes: ['id', 'username'] }
      ]
    });

    res.json({
      totalProducts,
      stockValue,
      lowStockCount: lowStockCountResult,
      outOfStockCount,
      recentActivity
    });
  } catch (error) {
    console.error('[Get Inventory Stats Error]', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export {
  updateStock,
  getInventoryLogs,
  getLowStockProducts,
  getInventoryStats
};
