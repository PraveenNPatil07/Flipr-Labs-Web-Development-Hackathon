import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import { syncDatabase } from './models/index.js';
import { seedDatabase } from './utils/seedData.js';

// Load environment variables
dotenv.config();

// Connect to database, sync models, and seed data
connectDB();
syncDatabase().then(() => {
  if (process.env.NODE_ENV === 'development') {
    seedDatabase();
  }
});

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.get('/', (req, res) => {
  res.send('Inventory Management System API');
});

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import productRoutes from './routes/product.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import reportRoutes from './routes/report.routes.js';

app.use('https://flipr-labs-web-development-hackathon.onrender.com/api/auth', authRoutes);
app.use('https://flipr-labs-web-development-hackathon.onrender.com/api/users', userRoutes);
app.use('https://flipr-labs-web-development-hackathon.onrender.com/api/products', productRoutes);
app.use('https://flipr-labs-web-development-hackathon.onrender.com/api/inventory', inventoryRoutes);
app.use('https://flipr-labs-web-development-hackathon.onrender.com/api/notifications', notificationRoutes);
app.use('https://flipr-labs-web-development-hackathon.onrender.com/api/reports', reportRoutes);

// Import error handler
import { errorHandler } from './utils/error.utils.js';

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});