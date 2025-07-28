# User API Endpoints

This document outlines the API endpoints related to user management, accessible by administrators.

## Base URL
`/api/users`

## Endpoints

### 1. Get All Users
- **URL**: `/api/users`
- **Method**: `GET`
- **Access**: Private/Admin
- **Description**: Retrieves a list of all registered users.
- **Success Response (200 OK)**:
  ```json
  [
    {
      "id": "string",
      "username": "string",
      "email": "string",
      "firstName": "string",
      "lastName": "string",
      "role": "string",
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ]
  ```
- **Error Responses**:
  - `401 Unauthorized`: If no token or invalid token.
  - `403 Forbidden`: If the authenticated user is not an Admin.
  - `500 Internal Server Error`: For other server-side issues.

### 2. Create a New User
- **URL**: `/api/users`
- **Method**: `POST`
- **Access**: Private/Admin
- **Description**: Creates a new user account.
- **Request Body (JSON)**:
  ```json
  {
    "username": "string",
    "email": "string (email format)",
    "password": "string (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)",
    "role": "string (e.g., 'Admin', 'Staff', optional, defaults to 'Staff')"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "id": "string",
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "string"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: If user already exists or validation fails.
  - `401 Unauthorized`: If no token or invalid token.
  - `403 Forbidden`: If the authenticated user is not an Admin.
  - `422 Unprocessable Entity`: If validation fails.
  - `500 Internal Server Error`: For other server-side issues.

### 3. Get User by ID
- **URL**: `/api/users/:id`
- **Method**: `GET`
- **Access**: Private/Admin
- **Description**: Retrieves a single user's details by their ID.
- **URL Parameters**:
  - `id`: The ID of the user.
- **Success Response (200 OK)**:
  ```json
  {
    "id": "string",
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "NotificationPreference": { ... }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: If no token or invalid token.
  - `403 Forbidden`: If the authenticated user is not an Admin.
  - `404 Not Found`: If user not found.
  - `500 Internal Server Error`: For other server-side issues.

### 4. Update User
- **URL**: `/api/users/:id`
- **Method**: `PUT`
- **Access**: Private/Admin
- **Description**: Updates an existing user's details by their ID.
- **URL Parameters**:
  - `id`: The ID of the user to update.
- **Request Body (JSON)**:
  ```json
  {
    "username": "string (optional)",
    "email": "string (email format, optional)",
    "password": "string (optional)",
    "role": "string (optional)",
    "firstName": "string (optional)",
    "lastName": "string (optional)"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "id": "string",
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "string"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: If validation fails.
  - `401 Unauthorized`: If no token or invalid token.
  - `403 Forbidden`: If the authenticated user is not an Admin.
  - `404 Not Found`: If user not found.
  - `422 Unprocessable Entity`: If validation fails.
  - `500 Internal Server Error`: For other server-side issues.

### 5. Delete User
- **URL**: `/api/users/:id`
- **Method**: `DELETE`
- **Access**: Private/Admin
- **Description**: Deletes a user by their ID.
- **URL Parameters**:
  - `id`: The ID of the user to delete.
- **Success Response (200 OK)**:
  ```json
  {
    "message": "User removed"
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: If no token or invalid token.
  - `403 Forbidden`: If the authenticated user is not an Admin.
  - `404 Not Found`: If user not found.
  - `500 Internal Server Error`: For other server-side issues.