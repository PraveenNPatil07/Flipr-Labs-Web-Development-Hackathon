import { User, NotificationPreference, Product } from '../models/index.js';
import { sequelize } from '../config/database.js';
import nodemailer from 'nodemailer';


// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Send email notification
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML content
 * @returns {Promise}
 */
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"Inventory System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

/**
 * Send low stock notification
 * @param {Object} product - Product that is low in stock
 * @returns {Promise}
 */
const sendLowStockNotification = async (product) => {
  try {
    // Find users with admin role
    const admins = await User.findAll({
      where: { role: 'Admin' },
      include: [{ model: NotificationPreference }]
    });

    const notificationPromises = [];

    for (const admin of admins) {
      const preferences = admin.NotificationPreference;
      
      // Skip if user has no preferences or email notifications disabled
      if (!preferences || !preferences.emailEnabled) continue;
      
      // Skip if product stock is above user's threshold
      if (product.stock > preferences.lowStockThreshold) continue;

      const emailHtml = `
        <h2>Low Stock Alert</h2>
        <p>The following product is running low on stock:</p>
        <div style="margin: 20px 0; padding: 15px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <p><strong>Product:</strong> ${product.name}</p>
          <p><strong>SKU:</strong> ${product.sku}</p>
          <p><strong>Current Stock:</strong> ${product.stock}</p>
          <p><strong>Threshold:</strong> ${product.threshold}</p>
        </div>
        <p>Please take action to replenish the inventory.</p>
        <p>This is an automated notification from your Inventory Management System.</p>
      `;

      notificationPromises.push(
        sendEmail(admin.email, `Low Stock Alert: ${product.name}`, emailHtml)
      );
    }

    return await Promise.allSettled(notificationPromises);
  } catch (error) {
    console.error('Low stock notification failed:', error);
    throw error;
  }
};

/**
 * Check for low stock products and send notifications
 * @returns {Promise}
 */
const checkLowStockAndNotify = async () => {
  try {
    // Find all products with stock <= threshold
    const lowStockProducts = await Product.findAll({
      where: sequelize.literal('stock <= threshold')
    });

    const notificationPromises = lowStockProducts.map(product => 
      sendLowStockNotification(product)
    );

    return await Promise.allSettled(notificationPromises);
  } catch (error) {
    console.error('Low stock check failed:', error);
    throw error;
  }
};

export {
  sendEmail,
  sendLowStockNotification,
  checkLowStockAndNotify
};