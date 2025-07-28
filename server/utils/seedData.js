import { col } from 'sequelize';
import { hashPassword } from './auth.utils.js';
import { User, NotificationPreference, Product } from '../models/index.js';


/**
 * Seed the database with initial data
 */
const seedDatabase = async () => {
  try {
    console.log('Seeding database...');
    
    // Create admin user
    const adminExists = await User.findOne({ where: { email: 'admin@example.com' } });
    
    if (!adminExists) {
      const admin = await User.create({
        username: 'Admin User',
        email: 'admin@example.com',
        password: 'Admin123',
        role: 'Admin'
      });
      
      await NotificationPreference.create({
        userId: admin.id,
        emailEnabled: true,
        browserEnabled: true,
        slackEnabled: false,
        lowStockThreshold: 5
      });
      
      console.log('Admin user created');
    }
    
    // Create staff user
    const staffExists = await User.findOne({ where: { email: 'staff@example.com' } });
    
    if (!staffExists) {
      const staff = await User.create({
        username: 'Staff User',
        email: 'staff@example.com',
        password: 'Staff123',
        role: 'Staff'
      });
      
      await NotificationPreference.create({
        userId: staff.id,
        emailEnabled: true,
        browserEnabled: true,
        slackEnabled: false,
        lowStockThreshold: 10
      });
      
      console.log('Staff user created');
    }
    
    // Create sample products
    const productCount = await Product.count();
    
    if (productCount === 0) {
      const products = [
        {
          sku: 'ELEC-001',
          name: 'Smartphone X',
          barcode: '123456789012',
          category: 'Electronics',
          stock: 25,
          threshold: 10,
          expiryDate: null,
          description: 'Latest smartphone with advanced features',
          price: 799.99,
          imageUrl: 'https://example.com/smartphone.jpg'
        },
        {
          sku: 'ELEC-002',
          name: 'Laptop Pro',
          barcode: '223456789012',
          category: 'Electronics',
          stock: 15,
          threshold: 5,
          expiryDate: null,
          description: 'High-performance laptop for professionals',
          price: 1299.99,
          imageUrl: 'https://example.com/laptop.jpg'
        },
        {
          sku: 'ELEC-003',
          name: 'Wireless Earbuds',
          barcode: '323456789012',
          category: 'Electronics',
          stock: 50,
          threshold: 15,
          expiryDate: null,
          description: 'Premium wireless earbuds with noise cancellation',
          price: 149.99,
          imageUrl: 'https://example.com/earbuds.jpg'
        },
        {
          sku: 'FOOD-001',
          name: 'Organic Coffee',
          barcode: '423456789012',
          category: 'Food & Beverage',
          stock: 30,
          threshold: 10,
          expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
          description: 'Premium organic coffee beans',
          price: 12.99,
          imageUrl: 'https://example.com/coffee.jpg'
        },
        {
          sku: 'FOOD-002',
          name: 'Chocolate Bar',
          barcode: '523456789012',
          category: 'Food & Beverage',
          stock: 100,
          threshold: 25,
          expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
          description: 'Gourmet dark chocolate bar',
          price: 3.99,
          imageUrl: 'https://example.com/chocolate.jpg'
        },
        {
          sku: 'CLOTH-001',
          name: 'T-Shirt',
          barcode: '623456789012',
          category: 'Clothing',
          stock: 75,
          threshold: 20,
          expiryDate: null,
          description: 'Cotton t-shirt, various sizes',
          price: 19.99,
          imageUrl: 'https://example.com/tshirt.jpg'
        },
        {
          sku: 'CLOTH-002',
          name: 'Jeans',
          barcode: '723456789012',
          category: 'Clothing',
          stock: 40,
          threshold: 15,
          expiryDate: null,
          description: 'Denim jeans, various sizes',
          price: 49.99,
          imageUrl: 'https://example.com/jeans.jpg'
        },
        {
          sku: 'HOME-001',
          name: 'Desk Lamp',
          barcode: '823456789012',
          category: 'Home & Garden',
          stock: 35,
          threshold: 10,
          expiryDate: null,
          description: 'LED desk lamp with adjustable brightness',
          price: 29.99,
          imageUrl: 'https://example.com/lamp.jpg'
        },
        {
          sku: 'HOME-002',
          name: 'Throw Pillow',
          barcode: '923456789012',
          category: 'Home & Garden',
          stock: 60,
          threshold: 15,
          expiryDate: null,
          description: 'Decorative throw pillow',
          price: 24.99,
          imageUrl: 'https://example.com/pillow.jpg'
        },
        {
          sku: 'TOOL-001',
          name: 'Screwdriver Set',
          barcode: '023456789012',
          category: 'Tools',
          stock: 20,
          threshold: 8,
          expiryDate: null,
          description: 'Professional screwdriver set with various sizes',
          price: 34.99,
          imageUrl: 'https://example.com/screwdriver.jpg'
        }
      ];
      
      await Product.bulkCreate(products);
      console.log(`${products.length} sample products created`);
    }
    
    console.log('Database seeding completed');
  } catch (error) {
    console.error('Database seeding failed:', error);
    throw error;
  }
};

export { seedDatabase };