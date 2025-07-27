import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import './App.css';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import InventoryPage from './pages/InventoryPage';
import ProfilePage from './pages/ProfilePage';
import UsersPage from './pages/UsersPage';
import ReportsPage from './pages/ReportsPage';
import NotFoundPage from './pages/NotFoundPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import UpdateStockPage from './pages/UpdateStockPage';

// Components
import DashboardLayout from './components/DashboardLayout';

function App() {
    return (
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    );
  }
  
 function AppContent() {
    const { theme } = useTheme();

    useEffect(() => {
      document.body.dataset.theme = theme;
    }, [theme]);

    return (
      <Router>
        <AuthProvider>
          {/* Auth provider content */}
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes using DashboardLayout */}
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/products/:id" element={<ProductDetailsPage />} />
              <Route path="/inventory/update/:productId" element={<InventoryPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>

            {/* Redirect root to dashboard if logged in, otherwise to login */}
            <Route path="/" element={<Navigate to="/dashboard" />} />

            {/* Catch all route - show 404 page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </Router>
    );
  }

export default App;
