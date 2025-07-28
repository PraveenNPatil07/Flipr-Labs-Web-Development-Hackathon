import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/ProductsPage.css';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: '',
    description: '',
    price: '',
    quantity: '',
    reorderLevel: '10',
    expiryDate: ''
  });

  // Fetch products and categories
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://flipr-labs-web-development-hackathon.onrender.com/api/products');
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        setProducts(data);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(data.map(product => product.category))];
        setCategories(uniqueCategories);
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Handle input change for new product form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: value
    });
  };

  // Handle form submission for new product
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('https://flipr-labs-web-development-hackathon.onrender.com/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProduct)
      });
      
      if (!response.ok) {
        throw new Error('Failed to add product');
      }
      
      const addedProduct = await response.json();
      
      // Update products list
      setProducts([...products, addedProduct]);
      
      // Reset form and close modal
      setNewProduct({
        name: '',
        sku: '',
        category: '',
        description: '',
        price: '',
        quantity: '',
        reorderLevel: '10',
        expiryDate: ''
      });
      setShowAddModal(false);
      
    } catch (err) {
      setError(err.message);
    }
  };

  // Filter products based on search term and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === '' || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Determine stock status
  const getStockStatus = (quantity, reorderLevel) => {
    if (quantity <= 0) return 'out-of-stock';
    if (quantity <= reorderLevel) return 'low-stock';
    return 'in-stock';
  };

  if (loading) {
    return <div className="products-loading">Loading products...</div>;
  }

  if (error) {
    return <div className="products-error">Error: {error}</div>;
  }

  return (
    <div className="products-container">
      <div className="products-header">
        <h1>Products</h1>
        <button className="add-product-btn" onClick={() => setShowAddModal(true)}>
          Add New Product
        </button>
      </div>
      
      <div className="products-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="category-filter">
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>
      
      {filteredProducts.length === 0 ? (
        <div className="no-products">No products found matching your criteria.</div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div className="product-card" key={product.id}>
              <div className="product-header">
                <h3 className="product-name">{product.name}</h3>
                <span className={`stock-badge ${getStockStatus(product.quantity, product.reorderLevel)}`}>
                  {product.quantity <= 0 ? 'Out of Stock' : 
                   product.quantity <= product.reorderLevel ? 'Low Stock' : 'In Stock'}
                </span>
              </div>
              
              <div className="product-details">
                <p><strong>SKU:</strong> {product.sku}</p>
                <p><strong>Category:</strong> {product.category}</p>
                <p><strong>Price:</strong> ${parseFloat(product.price).toFixed(2)}</p>
                <p><strong>Quantity:</strong> {product.quantity}</p>
                <p><strong>Reorder Level:</strong> {product.reorderLevel}</p>
                <p><strong>Expiry Date:</strong> {formatDate(product.expiryDate)}</p>
              </div>
              
              <div className="product-description">
                <p>{product.description}</p>
              </div>
              
              <div className="product-actions">
                <Link to={`/products/${product.id}`} className="view-btn">View Details</Link>
                <Link to={`/inventory/update/${product.id}`} className="update-stock-btn">Update Stock</Link>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Product</h2>
              <button className="close-modal" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-group">
                <label htmlFor="name">Product Name*</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newProduct.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="sku">SKU*</label>
                <input
                  type="text"
                  id="sku"
                  name="sku"
                  value={newProduct.sku}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="category">Category*</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={newProduct.category}
                  onChange={handleInputChange}
                  required
                  list="category-list"
                />
                <datalist id="category-list">
                  {categories.map(category => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={newProduct.description}
                  onChange={handleInputChange}
                  rows="3"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Price*</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    min="0"
                    step="0.01"
                    value={newProduct.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="quantity">Initial Quantity*</label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    min="0"
                    value={newProduct.quantity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="reorderLevel">Reorder Level</label>
                  <input
                    type="number"
                    id="reorderLevel"
                    name="reorderLevel"
                    min="0"
                    value={newProduct.reorderLevel}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="expiryDate">Expiry Date</label>
                  <input
                    type="date"
                    id="expiryDate"
                    name="expiryDate"
                    value={newProduct.expiryDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;