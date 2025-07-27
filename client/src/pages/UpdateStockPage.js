import React from 'react';
import { useParams } from 'react-router-dom';

const UpdateStockPage = () => {
  const { id } = useParams();

  return (
    <div className="update-stock-container">
      <h1>Update Stock for Product ID: {id}</h1>
      <p>This page will allow updating the stock for the specified product.</p>
    </div>
  );
};

export default UpdateStockPage;