# Product API Endpoints

This document outlines the API endpoints related to product management.

## Base URL
`/api/products`

## Endpoints

### 1. Get All Products
- **URL**: `/api/products`
- **Method**: `GET`
- **Access**: Private (requires authentication)
- **Description**: Retrieves a list of all products.
- **Query Parameters**:
  - `category`: Filter products by category.
  - `search`: Search products by name or SKU.
  - `minPrice`: Filter products by minimum price.
  - `maxPrice`: Filter products by maximum price.
  - `minStock`: Filter products by minimum stock.
  - `maxStock`: Filter products by maximum stock.
  - `sortBy`: Sort products by a specific field (e.g., `name`, `price`, `stock`).
  - `order`: Sort order (`ASC` or `DESC`).
  - `page`: Page number for pagination.
  - `limit`: Number of products per page.
- **Success Response (200 OK)**:
  ```json
  {
    "products": [
      {
        "id": "string",
        "name": "string",
        "sku": "string",
        "category": "string",
        "description": "string",
        "price": "number",
        "stock": "number",
        "imageUrl": "string",
        "supplier": "string",
        "threshold": "number",
        "createdAt": "datetime",
        "updatedAt": "datetime"
      }
    ],
    "totalProducts": "number",
    "totalPages": "number",
    "currentPage": "number"
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: If no token or invalid token.
  - `500 Internal Server Error`: For other server-side issues.

### 2. Get Product Categories
- **URL**: `/api/products/categories`
- **Method**: `GET`
- **Access**: Private (requires authentication)
- **Description**: Retrieves a list of all unique product categories.
- **Success Response (200 OK)**:
  ```json
  [
    "string",
    "string"
  ]
  ```
- **Error Responses**:
  - `401 Unauthorized`: If no token or invalid token.
  - `500 Internal Server Error`: For other server-side issues.

### 3. Get Product by ID
- **URL**: `/api/products/:id`
- **Method**: `GET`
- **Access**: Private (requires authentication)
- **Description**: Retrieves a single product's details by its ID.
- **URL Parameters**:
  - `id`: The ID of the product.
- **Success Response (200 OK)**:
  ```json
  {
    "id": "string",
    "name": "string",
    "sku": "string",
    "category": "string",
    "description": "string",
    "price": "number",
    "stock": "number",
    "imageUrl": "string",
    "supplier": "string",
    "threshold": "number",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: If no token or invalid token.
  - `404 Not Found`: If product not found.
  - `500 Internal Server Error`: For other server-side issues.

### 4. Update Product
- **URL**: `/api/products/:id`
- **Method**: `PUT`
- **Access**: Private/Admin
- **Description**: Updates an existing product's details by its ID.
- **URL Parameters**:
  - `id`: The ID of the product to update.
- **Request Body (JSON)**:
  ```json
  {
    "name": "string (optional)",
    "sku": "string (optional)",
    "category": "string (optional)",
    "description": "string (optional)",
    "price": "number (optional)",
    "stock": "number (optional)",
    "imageUrl": "string (optional)",
    "supplier": "string (optional)",
    "threshold": "number (optional)"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "id": "string",
    "name": "string",
    "sku": "string",
    "category": "string",
    "description": "string",
    "price": "number",
    "stock": "number",
    "imageUrl": "string",
    "supplier": "string",
    "threshold": "number",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: If validation fails.
  - `401 Unauthorized`: If no token or invalid token.
  - `403 Forbidden`: If the authenticated user is not an Admin.
  - `404 Not Found`: If product not found.
  - `500 Internal Server Error`: For other server-side issues.

### 5. Delete Product
- **URL**: `/api/products/:id`
- **Method**: `DELETE`
- **Access**: Private/Admin
- **Description**: Deletes a product by its ID.
- **URL Parameters**:
  - `id`: The ID of the product to delete.
- **Success Response (200 OK)**:
  ```json
  {
    "message": "Product removed"
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: If no token or invalid token.
  - `403 Forbidden`: If the authenticated user is not an Admin.
  - `404 Not Found`: If product not found.
  - `500 Internal Server Error`: For other server-side issues.

### 6. Create New Product
- **URL**: `/api/products`
- **Method**: `POST`
- **Access**: Private/Admin
- **Description**: Creates a new product.
- **Request Body (JSON)**:
  ```json
  {
    "name": "string",
    "sku": "string",
    "category": "string",
    "description": "string (optional)",
    "price": "number",
    "stock": "number",
    "imageUrl": "string (optional)",
    "supplier": "string (optional)",
    "threshold": "number (optional)"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "id": "string",
    "name": "string",
    "sku": "string",
    "category": "string",
    "description": "string",
    "price": "number",
    "stock": "number",
    "imageUrl": "string",
    "supplier": "string",
    "threshold": "number",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: If product with same SKU exists or validation fails.
  - `401 Unauthorized`: If no token or invalid token.
  - `403 Forbidden`: If the authenticated user is not an Admin.
  - `500 Internal Server Error`: For other server-side issues.