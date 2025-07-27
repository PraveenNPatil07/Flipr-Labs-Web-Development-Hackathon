import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';


const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    stockValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // This would be replaced with an actual API call
        const response = await fetch('/api/inventory/stats', {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="text-center p-10 text-primary-text">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-primary-text mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-primary-bg rounded-lg shadow-md p-6 transform transition duration-300 hover:scale-105">
          <h3 className="text-lg font-semibold text-primary-text mb-2">Total Products</h3>
          <p className="text-4xl font-bold text-blue-600">{stats.totalProducts}</p>
        </div>
        
        <div className="bg-primary-bg rounded-lg shadow-md p-6 transform transition duration-300 hover:scale-105">
          <h3 className="text-lg font-semibold text-primary-text mb-2">Inventory Value</h3>
          <p className="text-4xl font-bold text-green-600">${stats.stockValue.toFixed(2)}</p>
        </div>
        
        <div className="bg-primary-bg rounded-lg shadow-md p-6 transform transition duration-300 hover:scale-105">
          <h3 className="text-lg font-semibold text-primary-text mb-2">Low Stock Items</h3>
          <p className="text-4xl font-bold text-yellow-600">{stats.lowStockCount}</p>
        </div>
        
        <div className="bg-primary-bg rounded-lg shadow-md p-6 transform transition duration-300 hover:scale-105">
          <h3 className="text-lg font-semibold text-primary-text mb-2">Out of Stock</h3>
          <p className="text-4xl font-bold text-red-600">{stats.outOfStockCount}</p>
        </div>
      </div>
      
      <div className="bg-primary-bg rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-primary-text mb-4">Recent Activity</h2>
        {stats.recentActivity.length > 0 ? (
          <div className="space-y-4">
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center p-4 bg-secondary-bg rounded-lg shadow-sm hover:shadow-md transition duration-200">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xl font-bold mr-4 flex-shrink-0">
                  {activity.action === 'Add' && '+'}
                  {activity.action === 'Remove' && '-'}
                  {activity.action === 'Update' && '⟳'}
                </div>
                <div className="flex-1">
                  <p className="text-primary-text font-semibold text-lg">
                    <span className="text-blue-500">{activity.action}</span> {activity.quantity} units of{' '}
                    <span className="text-green-500">{activity.Product.name}</span>
                  </p>
                  <p className="text-gray-500 text-sm">
                    By {activity.User.username} • {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 italic p-4">No recent activity</p>
        )}
      </div>
      
      <div className="bg-primary-bg rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-primary-text mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/products" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg text-center transition duration-200">Add Product</Link>
          <Link to="/inventory" className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg text-center transition duration-200">Update Stock</Link>
          <Link to="/reports" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-lg text-center transition duration-200">View Reports</Link>
          <Link to="/users" className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded-lg text-center transition duration-200">Manage Users</Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;