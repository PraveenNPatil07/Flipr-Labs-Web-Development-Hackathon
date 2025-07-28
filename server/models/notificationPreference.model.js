import { sequelize } from '../config/database.js';
import { DataTypes } from 'sequelize';

const NotificationPreference = sequelize.define('NotificationPreference', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    unique: true
  },
  emailEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  browserEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  slackEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lowStockThreshold: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  }
}, {
  timestamps: true
});

export default NotificationPreference;