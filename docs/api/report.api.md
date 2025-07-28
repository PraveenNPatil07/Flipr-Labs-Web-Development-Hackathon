# Report API Documentation

This document outlines the API endpoints for managing reports within the inventory management system.

## Get Inventory Value Report

Generates a report on the total inventory value, broken down by category, and lists top products by value.

- **URL:** `/api/reports/inventory-value`
- **Method:** `GET`
- **Access:** Private/Admin
- **Description:** Retrieves a comprehensive report detailing the monetary value of inventory, categorized breakdowns, and the top 10 products by value.

### Success Response:

- **Code:** `200 OK`
- **Content:**
```json
{
  "categoryValues": [
    {
      "category": "Electronics",
      "productCount": 10,
      "totalStock": 150,
      "totalValue": "15000.00"
    }
  ],
  "totalValue": "50000.00",
  "totalProducts": 100,
  "topProducts": [
    {
      "id": 1,
      "name": "Laptop",
      "sku": "LAP-001",
      "category": "Electronics",
      "stock": 10,
      "price": "1000.00",
      "totalValue": "10000.00"
    }
  ]
}
```

### Error Response:

- **Code:** `500 Internal Server Error`
- **Content:**
```json
{
  "message": "Server error",
  "error": "Error details"
}
```

## Get Stock Movement Report

Generates a report on stock movements, including movements by action, by day, top moved products, and top active users.

- **URL:** `/api/reports/stock-movement`
- **Method:** `GET`
- **Access:** Private/Admin
- **Description:** Provides a detailed report on inventory stock movements over a specified period, including breakdowns by action (e.g., 'in', 'out'), daily movements, top products with the most movements, and users with the highest activity.

### Query Parameters:

- `startDate` (optional): Start date for the report (ISO 8601 format, e.g., `2023-01-01`). Defaults to one month ago.
- `endDate` (optional): End date for the report (ISO 8601 format, e.g., `2023-01-31`). Defaults to current date.

### Success Response:

- **Code:** `200 OK`
- **Content:**
```json
{
  "dateRange": {
    "startDate": "2023-01-01T00:00:00.000Z",
    "endDate": "2023-01-31T23:59:59.999Z"
  },
  "movementByAction": [
    {
      "action": "in",
      "count": 50,
      "totalQuantity": 500
    }
  ],
  "movementByDay": [
    {
      "date": "2023-01-01",
      "action": "in",
      "totalQuantity": 50
    }
  ],
  "topMovedProducts": [
    {
      "productId": 1,
      "totalQuantity": 100,
      "movementCount": 10,
      "Product": {
        "name": "Product A",
        "sku": "PA-001",
        "category": "Category 1"
      }
    }
  ],
  "topActiveUsers": [
    {
      "userId": 1,
      "activityCount": 20,
      "User": {
        "username": "admin",
        "email": "admin@example.com",
        "role": "admin"
      }
    }
  ]
}
```

### Error Response:

- **Code:** `400 Bad Request` (if date format is invalid)
- **Content:**
```json
{
  "message": "Invalid date format"
}
```

- **Code:** `500 Internal Server Error`
- **Content:**
```json
{
  "message": "Server error",
  "error": "Error details"
}
```

## Get Low Stock Report

Generates a report on products that are currently in low stock, categorized and ordered by stock ratio.

- **URL:** `/api/reports/low-stock`
- **Method:** `GET`
- **Access:** Private/Admin
- **Description:** Retrieves a report identifying products with low stock levels, including counts for out-of-stock and critical-stock items, and provides detailed lists categorized by stock status.

### Success Response:

- **Code:** `200 OK`
- **Content:**
```json
{
  "lowStockCount": 5,
  "outOfStockCount": 2,
  "criticalStockCount": 3,
  "lowStockProducts": [
    {
      "id": 1,
      "name": "Product A",
      "sku": "PA-001",
      "stock": 5,
      "threshold": 10,
      "ratio": 0.5
    }
  ],
  "lowStockByCategory": [
    {
      "category": "Electronics",
      "productCount": 3
    }
  ],
  "outOfStockProducts": [
    {
      "id": 2,
      "name": "Product B",
      "sku": "PB-002",
      "stock": 0
    }
  ],
  "criticalStockProducts": [
    {
      "id": 3,
      "name": "Product C",
      "sku": "PC-003",
      "stock": 2,
      "threshold": 20,
      "ratio": 0.1
    }
  ]
}
```

### Error Response:

- **Code:** `500 Internal Server Error`
- **Content:**
```json
{
  "message": "Server error",
  "error": "Error details"
}
```

## Get Sales Performance Report

Generates a sales performance report.

- **URL:** `/api/reports/sales-performance`
- **Method:** `GET`
- **Access:** Private/Admin
- **Description:** Provides a report on sales performance, including total sales, total units sold, and sales trends over a specified period.

### Query Parameters:

- `startDate` (optional): Start date for the report (ISO 8601 format, e.g., `2023-01-01`). Defaults to one month ago.
- `endDate` (optional): End date for the report (ISO 8601 format, e.g., `2023-01-31`). Defaults to current date.

### Success Response:

- **Code:** `200 OK`
- **Content:**
```json
{
  "dateRange": {
    "startDate": "2023-01-01T00:00:00.000Z",
    "endDate": "2023-01-31T23:59:59.999Z"
  },
  "totalSales": 3100,
  "totalUnitsSold": 155,
  "salesTrend": [
    { "date": "2023-01-01", "sales": 1000, "units": 50 },
    { "date": "2023-01-02", "sales": 1200, "units": 60 },
    { "date": "2023-01-03", "sales": 900, "units": 45 }
  ]
}
```

### Error Response:

- **Code:** `400 Bad Request` (if date format is invalid)
- **Content:**
```json
{
  "message": "Invalid date format"
}
```

- **Code:** `500 Internal Server Error`
- **Content:**
```json
{
  "message": "Server error",
  "error": "Error details"
}
```

## Get Purchase History Report

Generates a purchase history report.

- **URL:** `/api/reports/purchase-history`
- **Method:** `GET`
- **Access:** Private/Admin
- **Description:** Provides a report on purchase history, including total purchases, total items purchased, and purchase trends over a specified period.

### Query Parameters:

- `startDate` (optional): Start date for the report (ISO 8601 format, e.g., `2023-01-01`). Defaults to one month ago.
- `endDate` (optional): End date for the report (ISO 8601 format, e.g., `2023-01-31`). Defaults to current date.

### Success Response:

- **Code:** `200 OK`
- **Content:**
```json
{
  "dateRange": {
    "startDate": "2023-01-01T00:00:00.000Z",
    "endDate": "2023-01-31T23:59:59.999Z"
  },
  "totalPurchases": 2600,
  "totalItemsPurchased": 130,
  "purchaseTrend": [
    { "date": "2023-01-01", "purchases": 800, "items": 40 },
    { "date": "2023-01-02", "purchases": 1100, "items": 55 },
    { "date": "2023-01-03", "purchases": 700, "items": 35 }
  ]
}
```

### Error Response:

- **Code:** `400 Bad Request` (if date format is invalid)
- **Content:**
```json
{
  "message": "Invalid date format"
}
```

- **Code:** `500 Internal Server Error`
- **Content:**
```json
{
  "message": "Server error",
  "error": "Error details"
}
```

## Get Product Expiry Report

Generates a report on product expiry, including expired, expiring soon, and expiry by month.

- **URL:** `/api/reports/expiry`
- **Method:** `GET`
- **Access:** Private/Admin
- **Description:** Provides a report on product expiry dates, categorizing products as expired or expiring soon, and offering a monthly breakdown of expiring stock.

### Success Response:

- **Code:** `200 OK`
- **Content:**
```json
{
  "expiredProducts": [
    {
      "id": 1,
      "name": "Expired Product A",
      "expiryDate": "2023-01-01T00:00:00.000Z",
      "stock": 10
    }
  ],
  "expiringProducts": [
    {
      "id": 2,
      "name": "Expiring Product B",
      "expiryDate": "2023-03-15T00:00:00.000Z",
      "stock": 20
    }
  ],
  "expiryByMonth": [
    {
      "month": "2023-03-01T00:00:00.000Z",
      "productCount": 5,
      "totalStock": 100
    }
  ],
  "summary": {
    "totalExpired": 1,
    "totalExpiringSoon": 1
  }
}
```

### Error Response:

- **Code:** `500 Internal Server Error`
- **Content:**
```json
{
  "message": "Server error",
  "error": "Error details"
}
```