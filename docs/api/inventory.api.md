# Inventory API Endpoints

This document outlines the API endpoints related to inventory management, including stock updates, logs, low stock alerts, and statistics.

## Base URL
`/api/inventory`

## Endpoints

### 1. Update Stock
- **URL**: `/api/inventory/update`
- **Method**: `POST`
- **Access**: Private (requires authentication)
- **Description**: Updates the stock quantity for a product and logs the transaction.
- **Request Body (JSON)**:
  ```json
  {
    "productId": "string",
    "quantity": "number",
    "action": "string (e.g., 'add', 'remove', 'adjust')",
    "reason": "string (optional)"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "message": "Stock updated successfully",
    "product": {
      "id": "string",
      "name": "string",
      "stock": "number"
    },
    "log": {
      "id": "string",
      "productId": "string",
      "quantity": "number",
      "action": "string",
      "reason": "string",
      "userId": "string",
      "createdAt": "datetime"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: If invalid input or insufficient stock.
  - `401 Unauthorized`: If no token or invalid token.
  - `404 Not Found`: If product not found.
  - `500 Internal Server Error`: For other server-side issues.

### 2. Get Inventory Logs
- **URL**: `/api/inventory/logs`
- **Method**: `GET`
- **Access**: Private (requires authentication)
- **Description**: Retrieves a paginated list of inventory logs.
- **Query Parameters**:
  - `productId`: Filter logs by product ID.
  - `action`: Filter logs by action type (e.g., 'add', 'remove', 'adjust').
  - `userId`: Filter logs by user ID.
  - `startDate`: Filter logs from this date (ISO 8601 format).
  - `endDate`: Filter logs up to this date (ISO 8601 format).
  - `page`: Page number for pagination.
  - `limit`: Number of logs per page.
- **Success Response (200 OK)**:
  ```json
  {
    "logs": [
      {
        "id": "string",
        "productId": "string",
        "quantity": "number",
        "action": "string",
        "reason": "string",
        "userId": "string",
        "createdAt": "datetime",
        "Product": { "name": "string", "sku": "string" },
        "User": { "username": "string" }
      }
    ],
    "totalLogs": "number",
    "totalPages": "number",
    "currentPage": "number"
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: If no token or invalid token.
  - `500 Internal Server Error`: For other server-side issues.

### 3. Get Low Stock Products
- **URL**: `/api/inventory/low-stock`
- **Method**: `GET`
- **Access**: Private (requires authentication)
- **Description**: Retrieves a list of products with stock levels below their defined threshold.
- **Success Response (200 OK)**:
  ```json
  [
    {
      "id": "string",
      "name": "string",
      "sku": "string",
      "stock": "number",
      "threshold": "number",
      "category": "string"
    }
  ]
  ```
- **Error Responses**:
  - `401 Unauthorized`: If no token or invalid token.
  - `500 Internal Server Error`: For other server-side issues.

### 4. Get Inventory Statistics
- **URL**: `/api/inventory/stats`
- **Method**: `GET`
- **Access**: Private (requires authentication)
- **Description**: Retrieves overall inventory statistics, such as total products, total stock value, low stock count, and out-of-stock count.
- **Success Response (200 OK)**:
  ```json
  {
    "totalProducts": "number",
    "totalStockValue": "number",
    "lowStockCount": "number",
    "outOfStockCount": "number",
    "recentActivity": [
      {
        "action": "string",
        "count": "number"
      }
    ]
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: If no token or invalid token.
  - `500 Internal Server Error`: For other server-side issues.