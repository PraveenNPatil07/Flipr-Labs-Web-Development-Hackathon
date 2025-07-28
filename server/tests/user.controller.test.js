import { expect } from 'chai';
import sinon from 'sinon';
import { registerUser, loginUser, logoutUser, getMe } from '../controllers/user.controller.js';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

describe('User Controller Tests', () => {
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

  // Test cases for registerUser
  describe('registerUser', () => {
    it('should register a user successfully', async () => {
      const req = { body: { username: 'testuser', email: 'test@example.com', password: 'password123' } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(User, 'findOne').resolves(null);
      sinon.stub(bcrypt, 'hash').resolves('hashedPassword');
      sinon.stub(User, 'create').resolves({ id: 1, username: 'testuser', email: 'test@example.com' });

      await registerUser(req, res);

      expect(statusStub.calledWith(201)).to.be.true;
      expect(jsonStub.calledOnce).to.be.true;
      expect(jsonStub.args[0][0]).to.have.property('message', 'User registered successfully');
    });

    it('should return 400 if user already exists', async () => {
      const req = { body: { username: 'testuser', email: 'test@example.com', password: 'password123' } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(User, 'findOne').resolves({ id: 1, username: 'testuser' });

      await registerUser(req, res);

      expect(statusStub.calledWith(400)).to.be.true;
      expect(jsonStub.calledWith({ message: 'User already exists' })).to.be.true;
    });

    it('should handle validation errors', async () => {
      const req = { body: { username: '', email: 'invalid', password: 'short' } };
      const res = { status: statusStub, json: jsonStub };

      await registerUser(req, res);

      expect(statusStub.calledWith(400)).to.be.true;
      expect(jsonStub.calledOnce).to.be.true;
    });

    it('should handle server errors', async () => {
      const req = { body: { username: 'testuser', email: 'test@example.com', password: 'password123' } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(User, 'findOne').throws(new Error('Database error'));

      await registerUser(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Server error', error: 'Database error' })).to.be.true;
    });
  });

  // Test cases for loginUser
  describe('loginUser', () => {
    it('should login a user successfully', async () => {
      const req = { body: { email: 'test@example.com', password: 'password123' } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(User, 'findOne').resolves({ id: 1, email: 'test@example.com', password: 'hashedPassword' });
      sinon.stub(bcrypt, 'compare').resolves(true);
      sinon.stub(jwt, 'sign').returns('testToken');

      await loginUser(req, res);

      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledOnce).to.be.true;
      expect(jsonStub.args[0][0]).to.have.property('token', 'testToken');
    });

    it('should return 401 if invalid credentials', async () => {
      const req = { body: { email: 'test@example.com', password: 'wrongpassword' } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(User, 'findOne').resolves({ id: 1, email: 'test@example.com', password: 'hashedPassword' });
      sinon.stub(bcrypt, 'compare').resolves(false);

      await loginUser(req, res);

      expect(statusStub.calledWith(401)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Invalid credentials' })).to.be.true;
    });

    it('should return 404 if user not found', async () => {
      const req = { body: { email: 'nonexistent@example.com', password: 'password123' } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(User, 'findOne').resolves(null);

      await loginUser(req, res);

      expect(statusStub.calledWith(404)).to.be.true;
      expect(jsonStub.calledWith({ message: 'User not found' })).to.be.true;
    });

    it('should handle server errors', async () => {
      const req = { body: { email: 'test@example.com', password: 'password123' } };
      const res = { status: statusStub, json: jsonStub };

      sinon.stub(User, 'findOne').throws(new Error('Database error'));

      await loginUser(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Server error', error: 'Database error' })).to.be.true;
    });
  });

  // Test cases for logoutUser
  describe('logoutUser', () => {
    it('should logout a user successfully', async () => {
      const req = { cookies: { token: 'testToken' } };
      const res = { clearCookie: sinon.stub(), status: statusStub, json: jsonStub };

      await logoutUser(req, res);

      expect(res.clearCookie.calledWith('token')).to.be.true;
      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Logged out successfully' })).to.be.true;
    });

    it('should handle server errors', async () => {
      const req = { cookies: { token: 'testToken' } };
      const res = { clearCookie: sinon.stub(), status: statusStub, json: jsonStub };

      res.clearCookie.throws(new Error('Cookie error'));

      await logoutUser(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Server error', error: 'Cookie error' })).to.be.true;
    });
  });

  // Test cases for getMe
  describe('getMe', () => {
    it('should return current user info', async () => {
      const req = { user: { id: 1, username: 'testuser', email: 'test@example.com' } };
      const res = { status: statusStub, json: jsonStub };

      await getMe(req, res);

      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledOnce).to.be.true;
      expect(jsonStub.args[0][0]).to.deep.equal({ id: 1, username: 'testuser', email: 'test@example.com' });
    });

    it('should handle server errors', async () => {
      const req = { user: { id: 1 } };
      const res = { status: statusStub, json: jsonStub };

      jsonStub.throws(new Error('JSON error'));

      await getMe(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Server error', error: 'JSON error' })).to.be.true;
    });
  });
});