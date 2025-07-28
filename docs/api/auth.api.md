# Authentication API Endpoints

This document outlines the API endpoints related to user authentication, including registration, login, logout, and profile management.

## Base URL
`/api/auth`

## Endpoints

### 1. Register a New User
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Access**: Public
- **Description**: Registers a new user with the system.
- **Request Body (JSON)**:
  ```json
  {
    "username": "string",
    "email": "string (email format)",
    "password": "string (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)"
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
  - `500 Internal Server Error`: For other server-side issues.

### 2. User Login
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Access**: Public
- **Description**: Authenticates a user and returns a JWT token (set as a cookie).
- **Request Body (JSON)**:
  ```json
  {
    "email": "string (email format)",
    "password": "string"
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
  - `401 Unauthorized`: If invalid credentials.
  - `500 Internal Server Error`: For other server-side issues.

### 3. User Logout
- **URL**: `/api/auth/logout`
- **Method**: `POST`
- **Access**: Public
- **Description**: Logs out the current user by clearing the JWT cookie.
- **Success Response (200 OK)**:
  ```json
  {
    "message": "Logged out successfully"
  }
  ```
- **Error Responses**:
  - `500 Internal Server Error`: For server-side issues.

### 4. Get User Profile
- **URL**: `/api/auth/profile`
- **Method**: `GET`
- **Access**: Private (requires authentication)
- **Description**: Retrieves the profile of the authenticated user.
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
    "updatedAt": "datetime"
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: If no token or invalid token.
  - `404 Not Found`: If user profile not found.
  - `500 Internal Server Error`: For other server-side issues.

### 5. Update User Profile
- **URL**: `/api/auth/profile`
- **Method**: `PUT`
- **Access**: Private (requires authentication)
- **Description**: Updates the profile of the authenticated user.
- **Request Body (JSON)**:
  ```json
  {
    "username": "string (optional)",
    "email": "string (email format, optional)",
    "password": "string (optional)",
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
  - `404 Not Found`: If user profile not found.
  - `500 Internal Server Error`: For other server-side issues.