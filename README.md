# Inventory Management System

A comprehensive inventory management system built for the Hackathon. This application helps businesses track inventory, manage products, and generate reports.

## Features

- **User Authentication & Authorization**

  - Secure login and registration
  - Role-based access control (Admin and Staff)
  - JWT-based authentication

- **Product Management**

  - Add, edit, and delete products
  - Categorize products
  - Track product details (SKU, barcode, price, etc.)
  - Set stock thresholds for low stock alerts

- **Inventory Control**

  - Track stock levels
  - Log inventory movements (additions, removals, adjustments)
  - View inventory history

- **Notifications**

  - Low stock alerts
  - Customizable notification preferences
  - Email notifications

- **Reporting**
  - Inventory value reports
  - Stock movement analysis
  - Low stock reports
  - Product expiry tracking

## Tech Stack

### Backend

- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JWT Authentication

### Frontend

- React.js
- React Router
- Context API for state management
- Axios for API requests
- Tailwind CSS for styling
- Dark Mode (class-based)

## Project Structure

```
├── client/                 # Frontend React application
│   ├── public/             # Static files
│   └── src/                # React source code
│       ├── assets/         # Images, fonts, etc.
│       ├── components/     # Reusable components
│       ├── contexts/       # React contexts
│       ├── hooks/          # Custom hooks
│       ├── pages/          # Page components
│       ├── services/       # API services
│       └── utils/          # Utility functions
│
├── server/                 # Backend Node.js application
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Sequelize models
│   ├── routes/             # Express routes
│   ├── services/           # Business logic
│   └── utils/              # Utility functions
│
├── database/               # Database scripts and migrations
└── docs/                   # Project documentation
    └── dark_mode.md        # Detailed documentation on dark mode implementation
    └── api/                # Contains API documentation for various modules.

## Documentation

- [Dark Mode Implementation](docs/dark_mode.md)
- [API Documentation - Authentication](docs/api/auth.api.md)
- [API Documentation - Users](docs/api/user.api.md)
- [API Documentation - Products](docs/api/product.api.md)
- [API Documentation - Inventory](docs/api/inventory.api.md)
- [API Documentation - Notifications](docs/api/notification.api.md)
- [API Documentation - Reports](docs/api/report.api.md)


## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository
```

git clone <repository-url>
cd inventory-management-system

```

2. Install backend dependencies
```

cd server
npm install

```

3. Install frontend dependencies
```

cd ../client
npm install

```

4. Set up environment variables
- Create a `.env` file in the server directory based on the `.env.example` template
- Configure your database connection and other settings

5. Start the development servers
- Backend: `cd server && npm run dev`
- Frontend: `cd client && npm start`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID (Admin only)
- `POST /api/users` - Create a new user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/categories` - Get product categories
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create a new product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Inventory
- `POST /api/inventory/update` - Update product stock
- `GET /api/inventory/logs` - Get inventory logs
- `GET /api/inventory/low-stock` - Get low stock products
- `GET /api/inventory/stats` - Get inventory statistics

### Notifications
- `GET /api/notifications/preferences` - Get notification preferences
- `PUT /api/notifications/preferences` - Update notification preferences
- `POST /api/notifications/test` - Send test notification

### Reports
- `GET /api/reports/inventory-value` - Get inventory value report (Admin only)
- `GET /api/reports/stock-movement` - Get stock movement report (Admin only)
- `GET /api/reports/low-stock` - Get low stock report (Admin only)
- `GET /api/reports/expiry` - Get product expiry report (Admin only)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Express.js](https://expressjs.com/)
- [React.js](https://reactjs.org/)
- [Sequelize](https://sequelize.org/)
- [PostgreSQL](https://www.postgresql.org/)
```
