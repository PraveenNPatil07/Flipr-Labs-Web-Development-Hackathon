import React, { useState, useEffect } from 'react';
import '../styles/ReportsPage.css';

const ReportsPage = () => {
  const [activeReport, setActiveReport] = useState('inventory');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const renderInventoryValueReport = () => {
    if (!reportData) return null;

    return (
      <div className="report-content space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card-bg p-4 rounded-lg shadow-md">
            <h3>Total Inventory Value</h3>
            <p className="summary-value">{formatCurrency(reportData.totalValue)}</p>
          </div>
          <div className="bg-card-bg p-4 rounded-lg shadow-md">
            <h3>Total Products</h3>
            <p className="summary-value">{reportData.totalProducts || 0}</p>
          </div>
          <div className="bg-card-bg p-4 rounded-lg shadow-md">
            <h3>Categories</h3>
            <p className="summary-value">{reportData.categoryValues?.length || 0}</p>
          </div>
        </div>

        <div className="bg-card-bg p-4 rounded-lg shadow-md">
          <h3>Value by Category</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-card-bg">
              <thead>
                <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Category</th>
                  <th className="py-3 px-6 text-left">Number of Products</th>
                  <th className="py-3 px-6 text-left">Total Value</th>
                </tr>
              </thead>
              <tbody>
                {reportData.categoryValues?.map((category, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-6 text-left">{category.category}</td>
                    <td className="py-3 px-6 text-left">{category.productCount}</td>
                    <td className="py-3 px-6 text-left">{formatCurrency(category.totalValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card-bg p-4 rounded-lg shadow-md">
          <h3>Top Valuable Products</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-card-bg">
              <thead>
                <tr>
                  <th className="py-3 px-6 text-left">Product</th>
                  <th className="py-3 px-6 text-left">Category</th>
                  <th className="py-3 px-6 text-left">Stock</th>
                  <th className="py-3 px-6 text-left">Unit Price</th>
                  <th className="py-3 px-6 text-left">Total Value</th>
                </tr>
              </thead>
              <tbody>
                {reportData.topProducts?.map((product, index) => (
                  <tr key={index}>
                    <td className="py-3 px-6 text-left">{product.name}</td>
                    <td className="py-3 px-6 text-left">{product.category}</td>
                    <td className="py-3 px-6 text-left">{product.stock}</td>
                    <td className="py-3 px-6 text-left">{formatCurrency(product.price)}</td>
                    <td className="py-3 px-6 text-left">{formatCurrency(product.totalValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderSalesPerformanceReport = () => {
    if (!reportData) return null;

    return (
      <div className="report-content space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card-bg p-4 rounded-lg shadow-md">
            <h3>Total Sales Revenue</h3>
            <p className="summary-value">{formatCurrency(reportData.totalRevenue)}</p>
          </div>
          <div className="bg-card-bg p-4 rounded-lg shadow-md">
            <h3>Total Items Sold</h3>
            <p className="summary-value">{reportData.totalItemsSold || 0}</p>
          </div>
          <div className="bg-card-bg p-4 rounded-lg shadow-md">
            <h3>Total Orders</h3>
            <p className="summary-value">{reportData.totalOrders || 0}</p>
          </div>
        </div>

        <div className="bg-card-bg p-4 rounded-lg shadow-md">
          <h3>Sales by Category</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-card-bg">
              <thead>
                <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Category</th>
                  <th className="py-3 px-6 text-left">Items Sold</th>
                  <th className="py-3 px-6 text-left">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {reportData.salesByCategory?.map((category, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-6 text-left">{category.category}</td>
                    <td className="py-3 px-6 text-left">{category.itemsSold}</td>
                    <td className="py-3 px-6 text-left">{formatCurrency(category.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card-bg p-4 rounded-lg shadow-md">
          <h3>Top Selling Products</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-card-bg">
              <thead>
                <tr>
                  <th className="py-3 px-6 text-left">Product</th>
                  <th className="py-3 px-6 text-left">Category</th>
                  <th className="py-3 px-6 text-left">Items Sold</th>
                  <th className="py-3 px-6 text-left">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {reportData.topSellingProducts?.map((product, index) => (
                  <tr key={index}>
                    <td className="py-3 px-6 text-left">{product.name}</td>
                    <td className="py-3 px-6 text-left">{product.category}</td>
                    <td className="py-3 px-6 text-left">{product.itemsSold}</td>
                    <td className="py-3 px-6 text-left">{formatCurrency(product.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderPurchaseHistoryReport = () => {
    if (!reportData) return null;

    return (
      <div className="report-content space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card-bg p-4 rounded-lg shadow-md">
            <h3>Total Purchases</h3>
            <p className="summary-value">{formatCurrency(reportData.totalPurchases)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3>Total Items Purchased</h3>
            <p className="summary-value">{reportData.totalItemsPurchased || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3>Total Orders</h3>
            <p className="summary-value">{reportData.totalOrders || 0}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3>Purchases by Category</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-card-bg">
              <thead>
                <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Category</th>
                  <th className="py-3 px-6 text-left">Items Purchased</th>
                  <th className="py-3 px-6 text-left">Cost</th>
                </tr>
              </thead>
              <tbody>
                {reportData.purchasesByCategory?.map((category, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-6 text-left">{category.category}</td>
                    <td className="py-3 px-6 text-left">{category.itemsPurchased}</td>
                    <td className="py-3 px-6 text-left">{formatCurrency(category.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3>Top Purchased Products</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-card-bg">
              <thead>
                <tr>
                  <th className="py-3 px-6 text-left">Product</th>
                  <th className="py-3 px-6 text-left">Category</th>
                  <th className="py-3 px-6 text-left">Items Purchased</th>
                  <th className="py-3 px-6 text-left">Cost</th>
                </tr>
              </thead>
              <tbody>
                {reportData.topPurchasedProducts?.map((product, index) => (
                  <tr key={index}>
                    <td className="py-3 px-6 text-left">{product.name}</td>
                    <td className="py-3 px-6 text-left">{product.category}</td>
                    <td className="py-3 px-6 text-left">{product.itemsPurchased}</td>
                    <td className="py-3 px-6 text-left">{formatCurrency(product.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderLowStockReport = () => {
    if (!reportData) return null;

    return (
      <div className="report-content space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
            <h3>Low Stock Products</h3>
            <p className="summary-value">{reportData.lowStockCount}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
            <h3>Out of Stock Products</h3>
            <p className="summary-value">{reportData.outOfStockCount}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-700">
            <h3>Critical Stock Products</h3>
            <p className="summary-value">{reportData.criticalStockCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3>Low Stock by Category</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Low Stock</th>
                  <th>Out of Stock</th>
                  <th>Critical</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {reportData.lowStockByCategory?.map((cat, index) => (
                  <tr key={index}>
                    <td>{cat.category}</td>
                    <td>{cat.lowStock}</td>
                    <td>{cat.outOfStock}</td>
                    <td>{cat.criticalStock}</td>
                    <td>{cat.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3>Products Requiring Attention</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Min Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.products?.map((product, index) => (
                  <tr key={index}>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{product.currentStock}</td>
                    <td>{product.minStock}</td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        product.status.toLowerCase() === 'low' ? 'bg-yellow-200 text-yellow-800' :
                        product.status.toLowerCase() === 'outofstock' ? 'bg-red-200 text-red-800' :
                        'bg-green-200 text-green-800'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const reportTypes = [
    { id: 'inventory', name: 'Inventory Value', render: renderInventoryValueReport },
    { id: 'lowstock', name: 'Low Stock', render: renderLowStockReport },
  ];

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      setError(null);

      try {
        let url = '';
        const params = new URLSearchParams({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }).toString();

        switch (activeReport) {
          case 'inventory': url = `/api/reports/inventory-value?${params}`; break;
          case 'lowstock': url = `/api/reports/low-stock?${params}`; break;
          case 'sales': url = `/api/reports/sales-performance?${params}`; break;
          case 'purchase': url = `/api/reports/purchase-history?${params}`; break;
          default: url = `/api/reports/inventory-value?${params}`; break;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch ${activeReport} report`);
        const data = await response.json();
        setReportData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [activeReport, dateRange]);

  return (
    <div className="container mx-auto p-4 bg-gray-50 text-gray-800 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Reports</h1>

      <div className="flex border-b border-gray-300 mb-6">
        {reportTypes.map((report) => (
          <button
            key={report.id}
            className={`py-2 px-4 -mb-px border-b-2 transition-all duration-150 ${
              activeReport === report.id
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveReport(report.id)}
          >
            {report.name}
          </button>
        ))}
      </div>

      <div className="mb-6 flex gap-4 flex-wrap">
        <label className="block">
          <span>Start Date:</span>
          <input
            type="date"
            name="startDate"
            value={dateRange.startDate}
            onChange={handleDateChange}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 bg-white"
          />
        </label>
        <label className="block">
          <span>End Date:</span>
          <input
            type="date"
            name="endDate"
            value={dateRange.endDate}
            onChange={handleDateChange}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 bg-white"
          />
        </label>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 animate-spin"></div>
          <p className="ml-3">Loading report...</p>
        </div>
      )}

      {error && <p className="text-red-500 text-center">{error}</p>}

      {!loading && !error && reportData && (
        <div className="report-display">
          {reportTypes.find(type => type.id === activeReport)?.render()}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
