import { expect } from 'chai';
import sinon from 'sinon';
import { createInventoryLog, getInventoryLogs, getInventoryLogById, updateInventoryLog, deleteInventoryLog } from '../controllers/inventory.controller.js';
import InventoryLog from '../models/inventoryLog.model.js';
import Product from '../models/product.model.js';
import User from '../models/user.model.js';

describe('Inventory Controller Tests', () => {
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

  // Test cases for createInventoryLog
  describe('createInventoryLog', () => {
    it('should create an inventory log successfully', async () => {
      const req = { body: { productId: 1, quantity: 10, action: 'add', userId: 1 } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Product, 'findByPk').resolves({ id: 1, stock: 50, save: sinon.stub().resolves() });
      sinon.stub(InventoryLog, 'create').resolves({ id: 1, productId: 1, quantity: 10, action: 'add', userId: 1 });

      await createInventoryLog(req, res);

      expect(statusStub.calledWith(201)).to.be.true;
      expect(jsonStub.calledOnce).to.be.true;
      expect(jsonStub.args[0][0]).to.have.property('message', 'Inventory log created successfully');
    });

    it('should return 404 if product not found', async () => {
      const req = { body: { productId: 999, quantity: 10, action: 'add', userId: 1 } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Product, 'findByPk').resolves(null);

      await createInventoryLog(req, res);

      expect(statusStub.calledWith(404)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Product not found' })).to.be.true;
    });

    it('should return 400 if insufficient stock for removal', async () => {
      const req = { body: { productId: 1, quantity: 60, action: 'remove', userId: 1 } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Product, 'findByPk').resolves({ id: 1, stock: 50, save: sinon.stub().resolves() });

      await createInventoryLog(req, res);

      expect(statusStub.calledWith(400)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Insufficient stock' })).to.be.true;
    });

    it('should handle server errors', async () => {
      const req = { body: { productId: 1, quantity: 10, action: 'add', userId: 1 } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Product, 'findByPk').throws(new Error('Database error'));

      await createInventoryLog(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Server error', error: 'Database error' })).to.be.true;
    });
  });

  // Test cases for getInventoryLogs
  describe('getInventoryLogs', () => {
    it('should return all inventory logs', async () => {
      const req = { query: {} };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(InventoryLog, 'findAll').resolves([]);

      await getInventoryLogs(req, res);

      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledOnce).to.be.true;
      expect(jsonStub.args[0][0]).to.have.property('inventoryLogs');
    });

    it('should handle server errors', async () => {
      const req = { query: {} };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(InventoryLog, 'findAll').throws(new Error('Database error'));

      await getInventoryLogs(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Server error', error: 'Database error' })).to.be.true;
    });
  });

  // Test cases for getInventoryLogById
  describe('getInventoryLogById', () => {
    it('should return an inventory log by ID', async () => {
      const req = { params: { id: 1 } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(InventoryLog, 'findByPk').resolves({ id: 1 });

      await getInventoryLogById(req, res);

      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledOnce).to.be.true;
      expect(jsonStub.args[0][0]).to.have.property('inventoryLog');
    });

    it('should return 404 if inventory log not found', async () => {
      const req = { params: { id: 999 } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(InventoryLog, 'findByPk').resolves(null);

      await getInventoryLogById(req, res);

      expect(statusStub.calledWith(404)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Inventory log not found' })).to.be.true;
    });

    it('should handle server errors', async () => {
      const req = { params: { id: 1 } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(InventoryLog, 'findByPk').throws(new Error('Database error'));

      await getInventoryLogById(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Server error', error: 'Database error' })).to.be.true;
    });
  });

  // Test cases for updateInventoryLog
  describe('updateInventoryLog', () => {
    it('should update an inventory log successfully', async () => {
      const req = { params: { id: 1 }, body: { quantity: 20 } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(InventoryLog, 'findByPk').resolves({ id: 1, quantity: 10, save: sinon.stub().resolves() });

      await updateInventoryLog(req, res);

      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledOnce).to.be.true;
      expect(jsonStub.args[0][0]).to.have.property('message', 'Inventory log updated successfully');
    });

    it('should return 404 if inventory log not found', async () => {
      const req = { params: { id: 999 }, body: { quantity: 20 } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(InventoryLog, 'findByPk').resolves(null);

      await updateInventoryLog(req, res);

      expect(statusStub.calledWith(404)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Inventory log not found' })).to.be.true;
    });

    it('should handle server errors', async () => {
      const req = { params: { id: 1 }, body: { quantity: 20 } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(InventoryLog, 'findByPk').throws(new Error('Database error'));

      await updateInventoryLog(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Server error', error: 'Database error' })).to.be.true;
    });
  });

  // Test cases for deleteInventoryLog
  describe('deleteInventoryLog', () => {
    it('should delete an inventory log successfully', async () => {
      const req = { params: { id: 1 } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(InventoryLog, 'findByPk').resolves({ id: 1, destroy: sinon.stub().resolves() });

      await deleteInventoryLog(req, res);

      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledOnce).to.be.true;
      expect(jsonStub.args[0][0]).to.have.property('message', 'Inventory log deleted successfully');
    });

    it('should return 404 if inventory log not found', async () => {
      const req = { params: { id: 999 } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(InventoryLog, 'findByPk').resolves(null);

      await deleteInventoryLog(req, res);

      expect(statusStub.calledWith(404)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Inventory log not found' })).to.be.true;
    });

    it('should handle server errors', async () => {
      const req = { params: { id: 1 } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(InventoryLog, 'findByPk').throws(new Error('Database error'));

      await deleteInventoryLog(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Server error', error: 'Database error' })).to.be.true;
    });
  });
});