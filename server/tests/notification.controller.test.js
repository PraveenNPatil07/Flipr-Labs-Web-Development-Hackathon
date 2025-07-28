import { expect } from 'chai';
import sinon from 'sinon';
import { createNotification, getNotifications, getNotificationById, updateNotification, deleteNotification } from '../controllers/notification.controller.js';
import Notification from '../models/notification.model.js';

describe('Notification Controller Tests', () => {
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

  // Test cases for createNotification
  describe('createNotification', () => {
    it('should create a notification successfully', async () => {
      const req = { body: { userId: 1, message: 'Test Notification', type: 'info' } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Notification, 'create').resolves({ id: 1, userId: 1, message: 'Test Notification', type: 'info' });

      await createNotification(req, res);

      expect(statusStub.calledWith(201)).to.be.true;
      expect(jsonStub.calledOnce).to.be.true;
      expect(jsonStub.args[0][0]).to.have.property('message', 'Notification created successfully');
    });

    it('should handle validation errors', async () => {
      const req = { body: { userId: null, message: '', type: 'invalid' } };
      const res = { status: statusStub, json: jsonStub };

      await createNotification(req, res);

      expect(statusStub.calledWith(400)).to.be.true;
      expect(jsonStub.calledOnce).to.be.true;
    });

    it('should handle server errors', async () => {
      const req = { body: { userId: 1, message: 'Test Notification', type: 'info' } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Notification, 'create').throws(new Error('Database error'));

      await createNotification(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Server error', error: 'Database error' })).to.be.true;
    });
  });

  // Test cases for getNotifications
  describe('getNotifications', () => {
    it('should return all notifications', async () => {
      const req = { query: {} };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Notification, 'findAll').resolves([{ id: 1, message: 'Test Notification' }]);

      await getNotifications(req, res);

      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledOnce).to.be.true;
      expect(jsonStub.args[0][0]).to.have.property('notifications');
    });

    it('should handle server errors', async () => {
      const req = { query: {} };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Notification, 'findAll').throws(new Error('Database error'));

      await getNotifications(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Server error', error: 'Database error' })).to.be.true;
    });
  });

  // Test cases for getNotificationById
  describe('getNotificationById', () => {
    it('should return a notification by ID', async () => {
      const req = { params: { id: 1 } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Notification, 'findByPk').resolves({ id: 1, message: 'Test Notification' });

      await getNotificationById(req, res);

      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledOnce).to.be.true;
      expect(jsonStub.args[0][0]).to.have.property('notification');
    });

    it('should return 404 if notification not found', async () => {
      const req = { params: { id: 999 } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Notification, 'findByPk').resolves(null);

      await getNotificationById(req, res);

      expect(statusStub.calledWith(404)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Notification not found' })).to.be.true;
    });

    it('should handle server errors', async () => {
      const req = { params: { id: 1 } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Notification, 'findByPk').throws(new Error('Database error'));

      await getNotificationById(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Server error', error: 'Database error' })).to.be.true;
    });
  });

  // Test cases for updateNotification
  describe('updateNotification', () => {
    it('should update a notification successfully', async () => {
      const req = { params: { id: 1 }, body: { message: 'Updated Notification' } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Notification, 'findByPk').resolves({ id: 1, message: 'Test Notification', save: sinon.stub().resolves() });

      await updateNotification(req, res);

      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledOnce).to.be.true;
      expect(jsonStub.args[0][0]).to.have.property('message', 'Notification updated successfully');
    });

    it('should return 404 if notification not found', async () => {
      const req = { params: { id: 999 }, body: { message: 'Updated Notification' } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Notification, 'findByPk').resolves(null);

      await updateNotification(req, res);

      expect(statusStub.calledWith(404)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Notification not found' })).to.be.true;
    });

    it('should handle validation errors', async () => {
      const req = { params: { id: 1 }, body: { message: '' } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Notification, 'findByPk').resolves({ id: 1, message: 'Test Notification' });

      await updateNotification(req, res);

      expect(statusStub.calledWith(400)).to.be.true;
      expect(jsonStub.calledOnce).to.be.true;
    });

    it('should handle server errors', async () => {
      const req = { params: { id: 1 }, body: { message: 'Updated Notification' } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Notification, 'findByPk').throws(new Error('Database error'));

      await updateNotification(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Server error', error: 'Database error' })).to.be.true;
    });
  });

  // Test cases for deleteNotification
  describe('deleteNotification', () => {
    it('should delete a notification successfully', async () => {
      const req = { params: { id: 1 } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Notification, 'findByPk').resolves({ id: 1, destroy: sinon.stub().resolves() });

      await deleteNotification(req, res);

      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledOnce).to.be.true;
      expect(jsonStub.args[0][0]).to.have.property('message', 'Notification deleted successfully');
    });

    it('should return 404 if notification not found', async () => {
      const req = { params: { id: 999 } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Notification, 'findByPk').resolves(null);

      await deleteNotification(req, res);

      expect(statusStub.calledWith(404)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Notification not found' })).to.be.true;
    });

    it('should handle server errors', async () => {
      const req = { params: { id: 1 } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(Notification, 'findByPk').throws(new Error('Database error'));

      await deleteNotification(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Server error', error: 'Database error' })).to.be.true;
    });
  });
});