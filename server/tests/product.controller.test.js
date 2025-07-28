import { expect } from 'chai';
import sinon from 'sinon';
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct } from '../controllers/product.controller.js';
import Product from '../models/product.model.js';

describe('Product Controller Tests', () => {
  let statusStub, jsonStub, sendStub, consoleErrorStub;

  beforeEach(() => {
    statusStub = sinon.stub();
    jsonStub = sinon.stub();
    sendStub = sinon.stub();
    consoleErrorStub = sinon.stub(console, 'error');

    statusStub.returns({ json: jsonStub, send: sendStub });
  });

  afterEach(() => {
    sinon.restore();
  });

  // Test cases for createProduct
  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      const req = { body: { name: 'Test Product', price: 10.99, stock: 100 } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Product, 'create').resolves({ id: 1, name: 'Test Product', price: 10.99, stock: 100 });

      await createProduct(req, res);

      expect(statusStub.calledWith(201)).to.be.true;
      expect(jsonStub.calledOnce).to.be.true;
      expect(jsonStub.args[0][0]).to.have.property('message', 'Product created successfully');
    });

    it('should handle validation errors', async () => {
      const req = { body: { name: '', price: -10, stock: -5 } };
      const res = { status: statusStub, json: jsonStub };

      await createProduct(req, res);

      expect(statusStub.calledWith(400)).to.be.true;
      expect(jsonStub.calledOnce).to.be.true;
    });

    it('should handle server errors', async () => {
      const req = { body: { name: 'Test Product', price: 10.99, stock: 100 } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Product, 'create').throws(new Error('Database error'));

      await createProduct(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Server error', error: 'Database error' })).to.be.true;
    });
  });

  // Test cases for getProducts
  describe('getProducts', () => {
    it('should return all products', async () => {
      const req = { query: {} };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Product, 'findAll').resolves([{ id: 1, name: 'Test Product' }]);

      await getProducts(req, res);

      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledOnce).to.be.true;
      expect(jsonStub.args[0][0]).to.have.property('products');
    });

    it('should handle server errors', async () => {
      const req = { query: {} };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Product, 'findAll').throws(new Error('Database error'));

      await getProducts(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Server error', error: 'Database error' })).to.be.true;
    });
  });

  // Test cases for getProductById
  describe('getProductById', () => {
    it('should return a product by ID', async () => {
      const req = { params: { id: 1 } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Product, 'findByPk').resolves({ id: 1, name: 'Test Product' });

      await getProductById(req, res);

      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledOnce).to.be.true;
      expect(jsonStub.args[0][0]).to.have.property('product');
    });

    it('should return 404 if product not found', async () => {
      const req = { params: { id: 999 } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Product, 'findByPk').resolves(null);

      await getProductById(req, res);

      expect(statusStub.calledWith(404)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Product not found' })).to.be.true;
    });

    it('should handle server errors', async () => {
      const req = { params: { id: 1 } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Product, 'findByPk').throws(new Error('Database error'));

      await getProductById(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Server error', error: 'Database error' })).to.be.true;
    });
  });

  // Test cases for updateProduct
  describe('updateProduct', () => {
    it('should update a product successfully', async () => {
      const req = { params: { id: 1 }, body: { name: 'Updated Product', price: 15.99 } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Product, 'findByPk').resolves({ id: 1, name: 'Test Product', save: sinon.stub().resolves() });

      await updateProduct(req, res);

      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledOnce).to.be.true;
      expect(jsonStub.args[0][0]).to.have.property('message', 'Product updated successfully');
    });

    it('should return 404 if product not found', async () => {
      const req = { params: { id: 999 }, body: { name: 'Updated Product' } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Product, 'findByPk').resolves(null);

      await updateProduct(req, res);

      expect(statusStub.calledWith(404)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Product not found' })).to.be.true;
    });

    it('should handle validation errors', async () => {
      const req = { params: { id: 1 }, body: { name: '', price: -10 } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Product, 'findByPk').resolves({ id: 1, name: 'Test Product' });

      await updateProduct(req, res);

      expect(statusStub.calledWith(400)).to.be.true;
      expect(jsonStub.calledOnce).to.be.true;
    });

    it('should handle server errors', async () => {
      const req = { params: { id: 1 }, body: { name: 'Updated Product' } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Product, 'findByPk').throws(new Error('Database error'));

      await updateProduct(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Server error', error: 'Database error' })).to.be.true;
    });
  });

  // Test cases for deleteProduct
  describe('deleteProduct', () => {
    it('should delete a product successfully', async () => {
      const req = { params: { id: 1 } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Product, 'findByPk').resolves({ id: 1, destroy: sinon.stub().resolves() });

      await deleteProduct(req, res);

      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledOnce).to.be.true;
      expect(jsonStub.args[0][0]).to.have.property('message', 'Product deleted successfully');
    });

    it('should return 404 if product not found', async () => {
      const req = { params: { id: 999 } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Product, 'findByPk').resolves(null);

      await deleteProduct(req, res);

      expect(statusStub.calledWith(404)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Product not found' })).to.be.true;
    });

    it('should handle server errors', async () => {
      const req = { params: { id: 1 } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Product, 'findByPk').throws(new Error('Database error'));

      await deleteProduct(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Server error', error: 'Database error' })).to.be.true;
    });
  });
});