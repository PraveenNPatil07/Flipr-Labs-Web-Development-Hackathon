import { Product, InventoryLog } from '../models/index.js';
import { sequelize } from '../config/database.js';
import { Op, where } from 'sequelize';

/**
 * @desc Creates a new product in the inventory.
 * @route POST /api/products
 * @access Private/Admin
 * @param {Object} req - The request object.
 * @param {Object} req.body - The product details.
 * @param {string} req.body.sku - Stock Keeping Unit, must be unique.
 * @param {string} req.body.name - Name of the product.
 * @param {string} [req.body.barcode] - Barcode of the product.
 * @param {string} [req.body.category] - Category of the product.
 * @param {number} [req.body.stock=0] - Current stock level.
 * @param {number} [req.body.threshold=10] - Low stock threshold.
 * @param {Date} [req.body.expiryDate] - Expiry date of the product.
 * @param {string} [req.body.description] - Description of the product.
 * @param {number} [req.body.price] - Price of the product.
 * @param {string} [req.body.imageUrl] - URL of the product image.
 * @param {Object} res - The response object.
 * @returns {void} Sends a JSON response with the created product.
 */
const createProduct = async (req, res) => {
  try {
    const {
      sku, name, barcode, category,
      stock, threshold, expiryDate,
      description, price, imageUrl
    } = req.body;

    // Check for existing product
    const productExists = await Product.findOne({ where: { sku } });

    if (productExists) {
      return res.status(400).json({ message: 'Product with this SKU already exists' });
    }

    // Create product
    const product = await Product.create({
      sku,
      name,
      barcode,
      category,
      stock: stock || 0,
      threshold: threshold || 10,
      expiryDate,
      description,
      price,
      imageUrl
    });

    // Create inventory log
    if (stock > 0) {
      await InventoryLog.create({
        productId: product.id,
        userId: req.user.id,
        action: 'Add',
        quantity: stock,
        previousStock: 0,
        newStock: stock,
        notes: 'Initial stock'
      });
    }

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc Retrieves all products, with optional search, sorting, and low stock filtering.
 * @route GET /api/products
 * @access Private
 * @param {Object} req - The request object.
 * @param {Object} req.query - Query parameters for filtering and sorting.
 * @param {string} [req.query.search] - Search term for product name (case-insensitive).
 * @param {string} [req.query.sortBy] - Field to sort by (e.g., 'name', 'stock').
 * @param {'asc'|'desc'} [req.query.sortOrder='asc'] - Sort order.
 * @param {boolean} [req.query.lowStock] - If 'true', filters for products with stock <= threshold.
 * @param {Object} res - The response object.
 * @returns {void} Sends a JSON response with an array of products.
 */
const getProducts = async (req, res) => {
  try {
    const { search, sortBy, sortOrder, lowStock } = req.query;
    const whereClause = {};

    // Search by name
    if (search) {
      whereClause.name = {
        [Op.iLike]: `%${search}%`
      };
    }

    // Stock <= threshold
    if (lowStock === 'true') {
      whereClause.stock = {
        [Op.lte]: sequelize.literal('threshold')
      };
    }

    const orderClause = sortBy
      ? [[sortBy, sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']]
      : [];

    const products = await Product.findAll({
      where: whereClause,
      order: orderClause
    });

    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

/**
 * @desc Retrieves a single product by its ID.
 * @route GET /api/products/:id
 * @access Private
 * @param {Object} req - The request object.
 * @param {Object} req.params - The route parameters.
 * @param {string} req.params.id - The ID of the product to retrieve.
 * @param {Object} res - The response object.
 * @returns {void} Sends a JSON response with the product details.
 */
const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc Updates an existing product by its ID.
 * @route PUT /api/products/:id
 * @access Private/Admin
 * @param {Object} req - The request object.
 * @param {Object} req.params - The route parameters.
 * @param {string} req.params.id - The ID of the product to update.
 * @param {Object} req.body - The product details to update.
 * @param {string} [req.body.sku] - New SKU.
 * @param {string} [req.body.name] - New name.
 * @param {string} [req.body.barcode] - New barcode.
 * @param {string} [req.body.category] - New category.
 * @param {number} [req.body.threshold] - New low stock threshold.
 * @param {Date} [req.body.expiryDate] - New expiry date.
 * @param {string} [req.body.description] - New description.
 * @param {number} [req.body.price] - New price.
 * @param {string} [req.body.imageUrl] - New image URL.
 * @param {Object} res - The response object.
 * @returns {void} Sends a JSON response with the updated product.
 */
const updateProduct = async (req, res) => {
  try {
    const {
      sku, name, barcode, category,
      threshold, expiryDate, description,
      price, imageUrl
    } = req.body;

    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    Object.assign(product, {
      sku: sku ?? product.sku,
      name: name ?? product.name,
      barcode: barcode ?? product.barcode,
      category: category ?? product.category,
      threshold: threshold ?? product.threshold,
      expiryDate: expiryDate ?? product.expiryDate,
      description: description ?? product.description,
      price: price ?? product.price,
      imageUrl: imageUrl ?? product.imageUrl
    });

    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc Deletes a product by its ID.
 * @route DELETE /api/products/:id
 * @access Private/Admin
 * @param {Object} req - The request object.
 * @param {Object} req.params - The route parameters.
 * @param {string} req.params.id - The ID of the product to delete.
 * @param {Object} res - The response object.
 * @returns {void} Sends a JSON response indicating successful deletion.
 */
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.destroy();
    res.status(200).json({ message: 'Product removed' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc Retrieves a list of unique product categories.
 * @route GET /api/products/categories
 * @access Private
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void} Sends a JSON response with an array of unique category names.
 */
const getProductCategories = async (req, res) => {
  try {
    const categories = await Product.findAll({
      attributes: [
        [sequelize.fn('DISTINCT', sequelize.col('category')), 'category']
      ],
      raw: true
    });

    res.status(200).json(categories.map(c => c.category));
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductCategories
};
