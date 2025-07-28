import { expect } from 'chai';
import sinon from 'sinon';
import { getInventoryValueReport, getStockMovementReport, getLowStockReport, getSalesPerformanceReport, getPurchaseHistoryReport, getExpiryReport } from '../controllers/report.controller.js';
import Product from '../models/product.model.js';
import InventoryLog from '../models/inventoryLog.model.js';
import User from '../models/user.model.js';
import { sequelize } from '../config/database.js';

describe('Report Controller Tests', () => {
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

  // Test cases for getInventoryValueReport
  describe('getInventoryValueReport', () => {
    it('should return inventory value report', async () => {
      const req = {};
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Product, 'findAll').resolves([]);
      sinon.stub(Product, 'count').resolves(0);
      sinon.stub(sequelize, 'query').resolves([[{ totalValue: 0 }]]);

      await getInventoryValueReport(req, res);

      expect(jsonStub.calledOnce).to.be.true;
      expect(jsonStub.args[0][0]).to.have.all.keys('categoryValues', 'totalValue', 'totalProducts', 'topProducts');
    });

    it('should handle errors', async () => {
      const req = {};
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Product, 'findAll').throws(new Error('Test Error'));

      await getInventoryValueReport(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Server error', error: 'Test Error' })).to.be.true;
    });
  });

  // Test cases for getStockMovementReport
  describe('getStockMovementReport', () => {
    it('should return stock movement report', async () => {
      const req = { query: {} };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(InventoryLog, 'findAll').resolves([]);
      sinon.stub(User, 'findAll').resolves([]);

      await getStockMovementReport(req, res);

      expect(jsonStub.calledOnce).to.be.true;
      expect(jsonStub.args[0][0]).to.have.all.keys('dateRange', 'movementByAction', 'movementByDay', 'topMovedProducts', 'topActiveUsers');
    });

    it('should handle invalid date format', async () => {
      const req = { query: { startDate: 'invalid' } };
      const res = { status: statusStub, json: jsonStub };

      await getStockMovementReport(req, res);

      expect(statusStub.calledWith(400)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Invalid date format' })).to.be.true;
    });

    it('should handle errors', async () => {
      const req = { query: {} };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(InventoryLog, 'findAll').throws(new Error('Test Error'));

      await getStockMovementReport(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Server error', error: 'Test Error' })).to.be.true;
    });
  });

  // Test cases for getLowStockReport
  describe('getLowStockReport', () => {
    it('should return low stock report', async () => {
      const req = {};
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Product, 'findAll').resolves([]);

      await getLowStockReport(req, res);

      expect(jsonStub.calledOnce).to.be.true;
      expect(jsonStub.args[0][0]).to.have.property('lowStockProducts');
    });

    it('should handle errors', async () => {
      const req = {};
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Product, 'findAll').throws(new Error('Test Error'));

      await getLowStockReport(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Server error', error: 'Test Error' })).to.be.true;
    });
  });

  // Test cases for getSalesPerformanceReport
  describe('getSalesPerformanceReport', () => {
    it('should return sales performance report', async () => {
      const req = { query: {} };
      const res = { status: statusStub, json: jsonStub };

      await getSalesPerformanceReport(req, res);

      expect(jsonStub.calledOnce).to.be.true;
      expect(jsonStub.args[0][0]).to.have.all.keys('dateRange', 'totalSales', 'totalUnitsSold', 'salesTrend');
    });

    it('should handle invalid date format', async () => {
      const req = { query: { startDate: 'invalid' } };
      const res = { status: statusStub, json: jsonStub };

      await getSalesPerformanceReport(req, res);

      expect(statusStub.calledWith(400)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Invalid date format' })).to.be.true;
    });

    it('should handle errors', async () => {
      const req = { query: {} };
      const res = { status: statusStub, json: jsonStub };

      // No specific error handling in the controller for this placeholder, so we'll test the catch block
      const originalDate = Date;
      global.Date = class extends originalDate {
        constructor(dateString) {
          if (dateString === undefined) {
            throw new Error('Test Error');
          }
          return super(dateString);
        }
      };

      await getSalesPerformanceReport(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Server error', error: 'Test Error' })).to.be.true;

      global.Date = originalDate; // Restore Date object
    });
  });

  // Test cases for getPurchaseHistoryReport
  describe('getPurchaseHistoryReport', () => {
    it('should return purchase history report', async () => {
      const req = { query: {} };
      const res = { status: statusStub, json: jsonStub };

      await getPurchaseHistoryReport(req, res);

      expect(jsonStub.calledOnce).to.be.true;
      expect(jsonStub.args[0][0]).to.have.all.keys('dateRange', 'totalPurchases', 'totalItemsPurchased', 'purchaseTrend');
    });

    it('should handle invalid date format', async () => {
      const req = { query: { startDate: 'invalid' } };
      const res = { status: statusStub, json: jsonStub };

      await getPurchaseHistoryReport(req, res);

      expect(statusStub.calledWith(400)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Invalid date format' })).to.be.true;
    });

    it('should handle errors', async () => {
      const req = { query: {} };
      const res = { status: statusStub, json: jsonStub };

      // No specific error handling in the controller for this placeholder, so we'll test the catch block
      const originalDate = Date;
      global.Date = class extends originalDate {
        constructor(dateString) {
          if (dateString === undefined) {
            throw new Error('Test Error');
          }
          return super(dateString);
        }
      };

      await getPurchaseHistoryReport(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Server error', error: 'Test Error' })).to.be.true;

      global.Date = originalDate; // Restore Date object
    });
  });

  // Test cases for getExpiryReport
  describe('getExpiryReport', () => {
    it('should return expiry report', async () => {
      const req = {};
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Product, 'findAll').resolves([]);

      await getExpiryReport(req, res);

      expect(jsonStub.calledOnce).to.be.true;
      expect(jsonStub.args[0][0]).to.have.all.keys('expiredProducts', 'expiringProducts', 'expiryByMonth', 'summary');
    });

    it('should handle errors', async () => {
      const req = {};
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Product, 'findAll').throws(new Error('Test Error'));

      await getExpiryReport(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Server error', error: 'Test Error' })).to.be.true;
    });
  });
});