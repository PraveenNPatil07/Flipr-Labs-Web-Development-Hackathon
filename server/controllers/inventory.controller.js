import { Op, col, fn, literal } from 'sequelize';
import { sequelize } from '../config/database.js';
import Product from '../models/product.model.js';
import InventoryLog from '../models/inventoryLog.model.js';
import User from '../models/user.model.js';

// @desc Update product stock
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

// @desc Get inventory logs
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

// @desc Get low stock products
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

// @desc Get inventory statistics
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
