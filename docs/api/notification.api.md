# Notification API Endpoints

This document outlines the API endpoints related to user notifications and preferences.

## Base URL
`/api/notifications`

## Endpoints

### 1. Get Notification Preferences
- **URL**: `/api/notifications/preferences`
- **Method**: `GET`
- **Access**: Private (requires authentication)
- **Description**: Retrieves the notification preferences for the authenticated user.
- **Success Response (200 OK)**:
  ```json
  {
    "id": "string",
    "userId": "string",
    "emailNotifications": "boolean",
    "smsNotifications": "boolean",
    "appNotifications": "boolean",
    "lowStockThreshold": "number",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: If no token or invalid token.
  - `500 Internal Server Error`: For other server-side issues.

### 2. Update Notification Preferences
- **URL**: `/api/notifications/preferences`
- **Method**: `PUT`
- **Access**: Private (requires authentication)
- **Description**: Updates the notification preferences for the authenticated user.
- **Request Body (JSON)**:
  ```json
  {
    "emailNotifications": "boolean (optional)",
    "smsNotifications": "boolean (optional)",
    "appNotifications": "boolean (optional)",
    "lowStockThreshold": "number (optional)"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "id": "string",
    "userId": "string",
    "emailNotifications": "boolean",
    "smsNotifications": "boolean",
    "appNotifications": "boolean",
    "lowStockThreshold": "number",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: If no token or invalid token.
  - `500 Internal Server Error`: For other server-side issues.

### 3. Send Test Notification
- **URL**: `/api/notifications/test`
- **Method**: `POST`
- **Access**: Private (requires authentication)
- **Description**: Sends a test notification to the authenticated user based on their preferences.
- **Success Response (200 OK)**:
  ```json
  {
    "message": "Test notification sent successfully"
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: If no token or invalid token.
  - `500 Internal Server Error`: For other server-side issues.

### 4. Get Notifications
- **URL**: `/api/notifications`
- **Method**: `GET`
- **Access**: Private (requires authentication)
- **Description**: Retrieves a list of notifications for the authenticated user.
- **Query Parameters**:
  - `read`: Filter notifications by read status (`true` or `false`).
  - `page`: Page number for pagination.
  - `limit`: Number of notifications per page.
- **Success Response (200 OK)**:
  ```json
  {
    "notifications": [
      {
        "id": "string",
        "userId": "string",
        "type": "string",
        "message": "string",
        "isRead": "boolean",
        "createdAt": "datetime",
        "updatedAt": "datetime"
      }
    ],
    "totalNotifications": "number",
    "totalPages": "number",
    "currentPage": "number"
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: If no token or invalid token.
  - `500 Internal Server Error`: For other server-side issues.

### 5. Mark Notification as Read
- **URL**: `/api/notifications/:id/read`
- **Method**: `PUT`
- **Access**: Private (requires authentication)
- **Description**: Marks a specific notification as read.
- **URL Parameters**:
  - `id`: The ID of the notification to mark as read.
- **Success Response (200 OK)**:
  ```json
  {
    "message": "Notification marked as read"
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: If no token or invalid token.
  - `404 Not Found`: If notification not found.
  - `500 Internal Server Error`: For other server-side issues.

### 6. Mark All Notifications as Read
- **URL**: `/api/notifications/read-all`
- **Method**: `PUT`
- **Access**: Private (requires authentication)
- **Description**: Marks all notifications for the authenticated user as read.
- **Success Response (200 OK)**:
  ```json
  {
    "message": "All notifications marked as read"
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: If no token or invalid token.
  - `500 Internal Server Error`: For other server-side issues.