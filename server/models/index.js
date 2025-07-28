import InventoryLog from './inventoryLog.model.js';
import NotificationPreference from './notificationPreference.model.js';
import Notification from './notification.model.js';
import Product from './product.model.js';
import User from './user.model.js';
import { sequelize } from '../config/database.js';

// Define relationships
User.hasMany(InventoryLog, { foreignKey: 'userId' });
InventoryLog.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(InventoryLog, { foreignKey: 'productId' });
InventoryLog.belongsTo(Product, { foreignKey: 'productId' });

User.hasOne(NotificationPreference, { foreignKey: 'userId' });
NotificationPreference.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// Sync all models with database
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Database models synchronized');
  } catch (error) {
    console.error('Error synchronizing database models:', error);
  }
};

export {
  User,
  InventoryLog,
  NotificationPreference,
  Notification,
  syncDatabase
};
export { default as Product } from './product.model.js';