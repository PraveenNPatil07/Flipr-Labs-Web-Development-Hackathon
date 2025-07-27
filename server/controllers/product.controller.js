import { Product, InventoryLog } from '../models/index.js';
import { sequelize } from '../config/database.js';
import { Op, where } from 'sequelize';

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
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

// @desc    Get all products
// @route   GET /api/products
// @access  Private
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

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Private
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

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
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

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
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

// @desc    Get unique product categories
// @route   GET /api/products/categories
// @access  Private
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
