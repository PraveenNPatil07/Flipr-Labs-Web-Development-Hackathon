# Inventory Management System Database Schema Documentation

## Overview

This document provides a comprehensive explanation of the database schema for the Inventory Management System. The system is designed to track inventory, manage products, handle user notifications, and maintain audit logs of all inventory-related activities.

## Entity-Relationship Diagram

The ER diagram (`database_schema.svg`) visually represents the database structure, including all entities, their attributes, and the relationships between them.

## Database Entities

### 1. User

The User entity represents system users who can interact with the inventory management system.

**Attributes:**
- `id` (UUID, PK): Unique identifier for each user
- `username` (STRING, UNIQUE): User's login name
- `email` (STRING, UNIQUE): User's email address
- `firstName` (STRING): User's first name
- `lastName` (STRING): User's last name
- `password` (STRING): Hashed password for authentication
- `role` (ENUM: 'Admin', 'Staff'): User's role in the system
- `createdAt` (DATETIME): Timestamp when the user was created
- `updatedAt` (DATETIME): Timestamp when the user was last updated

### 2. Product

The Product entity represents items in the inventory.

**Attributes:**
- `id` (UUID, PK): Unique identifier for each product
- `sku` (STRING, UNIQUE): Stock Keeping Unit, a unique product identifier
- `name` (STRING): Product name
- `barcode` (STRING, UNIQUE): Product barcode
- `category` (STRING): Product category
- `stock` (INTEGER): Current quantity in stock
- `threshold` (INTEGER): Minimum stock level before triggering low stock alerts
- `expiryDate` (DATE): Product expiration date
- `description` (TEXT): Detailed product description
- `price` (DECIMAL(10,2)): Product price
- `imageUrl` (STRING): URL to product image
- `createdAt` (DATETIME): Timestamp when the product was created
- `updatedAt` (DATETIME): Timestamp when the product was last updated

### 3. NotificationPreference

The NotificationPreference entity stores user preferences for receiving notifications.

**Attributes:**
- `id` (UUID, PK): Unique identifier for each preference record
- `userId` (UUID, FK): Reference to the User entity
- `emailEnabled` (BOOLEAN): Whether email notifications are enabled
- `browserEnabled` (BOOLEAN): Whether browser notifications are enabled
- `slackEnabled` (BOOLEAN): Whether Slack notifications are enabled
- `lowStockThreshold` (INTEGER): Custom threshold for low stock notifications
- `createdAt` (DATETIME): Timestamp when the preference was created
- `updatedAt` (DATETIME): Timestamp when the preference was last updated

### 4. Notification

The Notification entity stores notifications sent to users.

**Attributes:**
- `id` (UUID, PK): Unique identifier for each notification
- `userId` (UUID, FK): Reference to the User entity
- `type` (STRING): Type of notification
- `message` (STRING): Notification message content
- `isRead` (BOOLEAN): Whether the notification has been read
- `createdAt` (DATETIME): Timestamp when the notification was created
- `updatedAt` (DATETIME): Timestamp when the notification was last updated

### 5. InventoryLog

The InventoryLog entity maintains an audit trail of all inventory changes.

**Attributes:**
- `id` (UUID, PK): Unique identifier for each log entry
- `productId` (UUID, FK): Reference to the Product entity
- `userId` (UUID, FK): Reference to the User entity who made the change
- `action` (ENUM: 'Add', 'Remove', 'Update'): Type of inventory action
- `quantity` (INTEGER): Quantity changed
- `previousStock` (INTEGER): Stock level before the change
- `newStock` (INTEGER): Stock level after the change
- `notes` (TEXT): Additional notes about the inventory change
- `createdAt` (DATETIME): Timestamp when the log was created
- `updatedAt` (DATETIME): Timestamp when the log was last updated

## Relationships

1. **User to NotificationPreference (One-to-One)**
   - Each User has exactly one NotificationPreference record
   - Each NotificationPreference belongs to exactly one User

2. **User to Notification (One-to-Many)**
   - Each User can have multiple Notifications
   - Each Notification belongs to exactly one User

3. **User to InventoryLog (One-to-Many)**
   - Each User can create multiple InventoryLog entries
   - Each InventoryLog entry is created by exactly one User

4. **Product to InventoryLog (One-to-Many)**
   - Each Product can have multiple InventoryLog entries
   - Each InventoryLog entry is associated with exactly one Product

## Business Rules and Constraints

1. **Stock Management**
   - Product stock cannot be negative
   - Threshold values must be at least 1

2. **User Roles and Permissions**
   - Admin users have full access to all features
   - Staff users have limited access based on assigned permissions

3. **Notification System**
   - Low stock notifications are triggered when product stock falls below threshold
   - Notifications are sent based on user preferences
   - Each user can customize their notification delivery methods

4. **Audit Trail**
   - All inventory changes are logged with user attribution
   - Logs include previous and new stock levels for traceability

5. **Data Integrity**
   - When a user is deleted, all related records are cascaded
   - Each user can have only one notification preference record
   - Products have unique SKUs and barcodes

## Indexes

The following indexes are implemented for performance optimization:

1. **Products Table**
   - `idx_products_category`: Improves queries filtering by category
   - `idx_products_stock`: Optimizes low stock queries

2. **InventoryLogs Table**
   - `idx_inventory_logs_product_id`: Improves queries filtering by product
   - `idx_inventory_logs_user_id`: Optimizes queries filtering by user
   - `idx_inventory_logs_created_at`: Enhances date-range queries

3. **Notifications Table**
   - `idx_notifications_user_id`: Improves queries filtering by user
   - `idx_notifications_is_read`: Optimizes queries for unread notifications

## Database Triggers

1. **Low Stock Notification Trigger**
   - Automatically creates notifications when product stock falls below threshold
   - Targets users based on role and notification preferences

2. **Inventory Change Logging Trigger**
   - Automatically logs all changes to product stock levels
   - Records user attribution, action type, and stock levels

## Implementation Notes

The database schema is implemented using Sequelize ORM with PostgreSQL as the underlying database system. The schema supports:

1. **Data Validation**: Constraints are enforced at both the database and application levels
2. **Audit Trail**: Complete history of inventory changes
3. **Notification System**: Flexible notification delivery based on user preferences
4. **Role-Based Access**: Different capabilities for Admin and Staff users
5. **Performance Optimization**: Strategic indexes for common query patterns