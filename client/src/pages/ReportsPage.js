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
      <div className="report-container">
        <div className="report-summary">
          <div className="summary-card">
            <h3>Total Inventory Value</h3>
            <p className="summary-value">{formatCurrency(reportData.totalValue)}</p>
          </div>
          <div className="summary-card">
            <h3>Total Products</h3>
            <p className="summary-value">{reportData.totalProducts || 0}</p>
          </div>
          <div className="summary-card">
            <h3>Categories</h3>
            <p className="summary-value">{reportData.categoryValues?.length || 0}</p>
          </div>
        </div>
        <div className="report-section">
          <h3>Value by Category</h3>
          <div className="table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Number of Products</th>
                  <th>Total Value</th>
                </tr>
              </thead>
              <tbody>
                {reportData.categoryValues?.map((category, index) => (
                  <tr key={index}>
                    <td>{category.category}</td>
                    <td>{category.productCount}</td>
                    <td>{formatCurrency(category.totalValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="report-section">
          <h3>Top Valuable Products</h3>
          <div className="table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Unit Price</th>
                  <th>Total Value</th>
                </tr>
              </thead>
              <tbody>
                {reportData.topProducts?.map((product, index) => (
                  <tr key={index}>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{product.stock}</td>
                    <td>{formatCurrency(product.price)}</td>
                    <td>{formatCurrency(product.totalValue)}</td>
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
      <div className="report-container">
        <div className="report-summary">
          <div className="summary-card warning">
            <h3>Low Stock Products</h3>
            <p className="summary-value">{reportData.lowStockCount}</p>
          </div>
          <div className="summary-card danger">
            <h3>Out of Stock Products</h3>
            <p className="summary-value">{reportData.outOfStockCount}</p>
          </div>
          <div className="summary-card critical">
            <h3>Critical Stock Products</h3>
            <p className="summary-value">{reportData.criticalStockCount}</p>
          </div>
        </div>
        <div className="report-section">
          <h3>Low Stock by Category</h3>
          <div className="table-container">
            <table className="report-table">
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
        <div className="report-section">
          <h3>Products Requiring Attention</h3>
          <div className="table-container">
            <table className="report-table">
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
                      <span className={`stock-status ${product.status.toLowerCase()}`}>
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
    <div className="reports-container">
      <h1>Reports</h1>
      <div className="report-tabs">
        {reportTypes.map((report) => (
          <button
            key={report.id}
            className={`report-tab ${activeReport === report.id ? 'active' : ''}`}
            onClick={() => setActiveReport(report.id)}
          >
            {report.name}
          </button>
        ))}
      </div>
      <div className="date-range-selector">
        <label>
          <span>Start Date:</span>
          <input
            type="date"
            name="startDate"
            value={dateRange.startDate}
            onChange={handleDateChange}
          />
        </label>
        <label>
          <span>End Date:</span>
          <input
            type="date"
            name="endDate"
            value={dateRange.endDate}
            onChange={handleDateChange}
          />
        </label>
      </div>
      {loading && <div className="report-loading">Loading report...</div>}
      {error && <div className="report-error">{error}</div>}
      {!loading && !error && reportData && (
        <div>
          {reportTypes.find(type => type.id === activeReport)?.render()}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;