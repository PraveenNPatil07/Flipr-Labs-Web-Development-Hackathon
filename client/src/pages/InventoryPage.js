import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../styles/InventoryPage.css';

const InventoryPage = () => {
  const { productId } = useParams(); // Get product ID from URL
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(productId || ''); // Set initial selected product from URL
  const [actionType, setActionType] = useState('Add');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  // Fetch inventory logs and products
  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        setLoading(true);
        
        // Fetch inventory logs
        let url = `https://flipr-labs-web-development-hackathon.onrender.com/api/inventory/logs?page=${page}&limit=10`;
        if (actionFilter) url += `&action=${actionFilter}`;
        if (dateFilter) url += `&date=${dateFilter}`;
        
        const logsResponse = await fetch(url);
        
        if (!logsResponse.ok) {
          throw new Error('Failed to fetch inventory logs');
        }
        
        const logsData = await logsResponse.json();
        setInventoryLogs(logsData.logs);
        setTotalPages(logsData.totalPages || 1);
        
        // Fetch products for the dropdown
        const productsResponse = await fetch('https://flipr-labs-web-development-hackathon.onrender.com/api/products');
        
        if (!productsResponse.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const productsData = await productsResponse.json();
        setProducts(productsData);

        // If productId is in URL, open the modal and pre-select the product
        if (productId && productsData.some(p => p.id === productId)) {
          setSelectedProduct(productId);
          setShowUpdateModal(true);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchInventoryData();
  }, [page, actionFilter, dateFilter, productId]); // Add productId to dependency array

  // Handle inventory update submission
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      setUpdateError('Please select a product');
      return;
    }
    
    try {
      setUpdateError(null);
      
      const response = await fetch('https://flipr-labs-web-development-hackathon.onrender.com/api/inventory/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: selectedProduct,
          action: actionType,
          quantity: parseInt(quantity),
          notes: notes
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update inventory');
      }
      
      // Reset form
      setSelectedProduct('');
      setActionType('Add');
      setQuantity(1);
      setNotes('');
      
      // Show success message
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
      
      // Refresh inventory logs
      const logsResponse = await fetch(`https://flipr-labs-web-development-hackathon.onrender.com/api/inventory/logs?page=${page}&limit=10`);
      const logsData = await logsResponse.json();
      setInventoryLogs(logsData.logs);
      
      // Close modal
      setShowUpdateModal(false);
      
    } catch (err) {
      setUpdateError(err.message);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get product name by ID
  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setActionFilter('');
    setDateFilter('');
  };

  if (loading && page === 1) {
    return <div className="inventory-loading">Loading inventory data...</div>;
  }

  if (error && page === 1) {
    return <div className="inventory-error">Error: {error}</div>;
  }

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <h1>Inventory Management</h1>
        <button 
          className="update-inventory-btn" 
          onClick={() => setShowUpdateModal(true)}
        >
          Update Inventory
        </button>
      </div>
      
      <div className="inventory-filters">
        <div className="filter-group">
          <label>Filter by Action:</label>
          <select 
            value={actionFilter} 
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="">All Actions</option>
            <option value="Add">Add</option>
            <option value="Remove">Remove</option>
            <option value="Update">Update</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Filter by Date:</label>
          <input 
            type="date" 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
        
        <button className="reset-filters-btn" onClick={resetFilters}>
          Reset Filters
        </button>
      </div>
      
      {updateSuccess && (
        <div className="update-success-message">
          Inventory updated successfully!
        </div>
      )}
      
      {inventoryLogs.length === 0 ? (
        <div className="no-logs">No inventory logs found matching your criteria.</div>
      ) : (
        <>
          <div className="inventory-table-container">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Action</th>
                  <th>Quantity</th>
                  <th>Previous Stock</th>
                  <th>New Stock</th>
                  <th>Notes</th>
                  <th>User</th>
                </tr>
              </thead>
              <tbody>
                {inventoryLogs.map(log => (
                  <tr key={log.id} className={`action-${log.action.toLowerCase()}`}>
                    <td>{formatDate(log.createdAt)}</td>
                    <td>
                      <Link to={`/products/${log.productId}`}>
                        {getProductName(log.productId)}
                      </Link>
                    </td>
                    <td>
                      <span className={`action-badge ${log.action.toLowerCase()}`}>
                        {log.action}
                      </span>
                    </td>
                    <td>{log.quantity}</td>
                    <td>{log.previousStock}</td>
                    <td>{log.newStock}</td>
                    <td>{log.notes || '-'}</td>
                    <td>{log.userId ? log.userId : 'System'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="pagination">
            <button 
              onClick={() => handlePageChange(page - 1)} 
              disabled={page === 1}
              className="pagination-btn"
            >
              Previous
            </button>
            
            <span className="page-info">
              Page {page} of {totalPages}
            </span>
            
            <button 
              onClick={() => handlePageChange(page + 1)} 
              disabled={page === totalPages}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        </>
      )}
      
      {/* Update Inventory Modal */}
      {showUpdateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Update Inventory</h2>
              <button 
                className="close-modal" 
                onClick={() => setShowUpdateModal(false)}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleUpdateSubmit} className="inventory-form">
              {updateError && (
                <div className="update-error">{updateError}</div>
              )}
              
              <div className="form-group">
                <label htmlFor="product">Select Product*</label>
                <select
                  id="product"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  required
                >
                  <option value="">-- Select a Product --</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} (SKU: {product.sku}, Current Stock: {product.quantity})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="action">Action Type*</label>
                <select
                  id="action"
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  required
                >
                  <option value="Add">Add Stock</option>
                  <option value="Remove">Remove Stock</option>
                  <option value="Adjust">Adjust Stock (Set to specific value)</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="quantity">Quantity*</label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes about this inventory update"
                  rows="3"
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={() => setShowUpdateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Update Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="inventory-links">
        <Link to="/reports/inventory-value" className="report-link">
          View Inventory Value Report
        </Link>
        <Link to="/reports/low-stock" className="report-link">
          View Low Stock Report
        </Link>
      </div>
    </div>
  );
};

export default InventoryPage;