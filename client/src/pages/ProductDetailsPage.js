import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProduct(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  if (loading) {
    return <div className="p-6 bg-card-bg rounded-xl shadow-lg text-primary-text">Loading product details...</div>;
  }

  if (error) {
    return <div className="p-6 bg-card-bg rounded-xl shadow-lg text-danger">Error: {error}</div>;
  }

  if (!product) {
    return <div className="p-6 bg-card-bg rounded-xl shadow-lg text-primary-text">Product not found.</div>;
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="p-6 bg-card-bg rounded-xl shadow-lg text-primary-text">
      <h1 className="text-2xl font-semibold mb-4">Product Details: {product.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <p><strong>SKU:</strong> {product.sku}</p>
        <p><strong>Category:</strong> {product.category}</p>
        <p><strong>Price:</strong> ${parseFloat(product.price).toFixed(2)}</p>
        <p><strong>Quantity:</strong> {product.quantity}</p>
        <p><strong>Reorder Level:</strong> {product.reorderLevel}</p>
        <p><strong>Expiry Date:</strong> {formatDate(product.expiryDate)}</p>
      </div>
      <div className="mt-4">
        <p><strong>Description:</strong> {product.description}</p>
      </div>
    </div>
  );
};

export default ProductDetailsPage;