-- Database Schema for Inventory Management System

-- Users Table
CREATE TABLE Users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  firstName VARCHAR(255),
  lastName VARCHAR(255),
  password VARCHAR(255) NOT NULL,
  role ENUM('Admin', 'Staff') DEFAULT 'Staff',
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE Products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  barcode VARCHAR(255) UNIQUE,
  category VARCHAR(255) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  threshold INTEGER NOT NULL DEFAULT 10 CHECK (threshold >= 1),
  expiryDate DATE,
  description TEXT,
  price DECIMAL(10, 2),
  imageUrl VARCHAR(255),
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- NotificationPreferences Table
CREATE TABLE NotificationPreferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId UUID NOT NULL UNIQUE,
  emailEnabled BOOLEAN DEFAULT TRUE,
  browserEnabled BOOLEAN DEFAULT TRUE,
  slackEnabled BOOLEAN DEFAULT FALSE,
  lowStockThreshold INTEGER DEFAULT 10,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

-- Notifications Table
CREATE TABLE Notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId UUID NOT NULL,
  type VARCHAR(255) NOT NULL,
  message VARCHAR(255) NOT NULL,
  isRead BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

-- InventoryLogs Table
CREATE TABLE InventoryLogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  productId UUID NOT NULL,
  userId UUID NOT NULL,
  action ENUM('Add', 'Remove', 'Update') NOT NULL,
  quantity INTEGER NOT NULL,
  previousStock INTEGER NOT NULL,
  newStock INTEGER NOT NULL,
  notes TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

-- Indexes for performance optimization
CREATE INDEX idx_products_category ON Products(category);
CREATE INDEX idx_products_stock ON Products(stock);
CREATE INDEX idx_inventory_logs_product_id ON InventoryLogs(productId);
CREATE INDEX idx_inventory_logs_user_id ON InventoryLogs(userId);
CREATE INDEX idx_inventory_logs_created_at ON InventoryLogs(createdAt);
CREATE INDEX idx_notifications_user_id ON Notifications(userId);
CREATE INDEX idx_notifications_is_read ON Notifications(isRead);

-- Business Rules and Constraints

-- 1. Ensure stock cannot go below zero
ALTER TABLE Products ADD CONSTRAINT check_stock_non_negative CHECK (stock >= 0);

-- 2. Ensure threshold is at least 1
ALTER TABLE Products ADD CONSTRAINT check_threshold_positive CHECK (threshold >= 1);

-- 3. Trigger to create notification when stock falls below threshold
CREATE OR REPLACE FUNCTION notify_low_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stock < NEW.threshold THEN
    INSERT INTO Notifications (userId, type, message)
    SELECT u.id, 'Low Stock', CONCAT('Product ', NEW.name, ' is low in stock (', NEW.stock, ' remaining)')
    FROM Users u
    JOIN NotificationPreferences np ON u.id = np.userId
    WHERE u.role = 'Admin' OR np.lowStockThreshold >= NEW.stock;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_stock_update
AFTER UPDATE OF stock ON Products
FOR EACH ROW
EXECUTE FUNCTION notify_low_stock();

-- 4. Trigger to log inventory changes
CREATE OR REPLACE FUNCTION log_inventory_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.stock != NEW.stock THEN
    INSERT INTO InventoryLogs (productId, userId, action, quantity, previousStock, newStock)
    VALUES (
      NEW.id,
      current_setting('app.current_user_id')::UUID,
      CASE
        WHEN NEW.stock > OLD.stock THEN 'Add'
        WHEN NEW.stock < OLD.stock THEN 'Remove'
        ELSE 'Update'
      END,
      ABS(NEW.stock - OLD.stock),
      OLD.stock,
      NEW.stock
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_inventory_change
AFTER UPDATE OF stock ON Products
FOR EACH ROW
EXECUTE FUNCTION log_inventory_change();

-- Notes on Business Rules:
-- 1. Users with Admin role have access to all inventory management features
-- 2. Staff users have limited access based on their assigned permissions
-- 3. Low stock notifications are sent based on individual user notification preferences
-- 4. All inventory changes are logged with user attribution for audit purposes
-- 5. Products cannot have negative stock values
-- 6. Each user can have only one notification preference record
-- 7. When a user is deleted, all related records (notifications, logs, preferences) are cascaded