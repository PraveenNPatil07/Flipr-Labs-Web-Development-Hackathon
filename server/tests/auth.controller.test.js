import { expect } from 'chai';
import sinon from 'sinon';
import { registerUser, loginUser, logoutUser, getMe } from '../controllers/auth.controller.js';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

describe('Auth Controller Tests', () => {
  let statusStub, jsonStub, sendStub, cookieStub, clearCookieStub, consoleErrorStub;

  beforeEach(() => {
    statusStub = sinon.stub();
    jsonStub = sinon.stub();
    sendStub = sinon.stub();
    cookieStub = sinon.stub();
    clearCookieStub = sinon.stub();
    consoleErrorStub = sinon.stub(console, 'error');

    statusStub.returns({ json: jsonStub, send: sendStub });
    cookieStub.returns({ status: statusStub });
    clearCookieStub.returns({ status: statusStub });
  });

  afterEach(() => {
    sinon.restore();
  });

  // Test cases for registerUser
  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      const req = { body: { username: 'testuser', email: 'test@example.com', password: 'password123' } };
      const res = { status: statusStub, cookie: cookieStub };

      sinon.stub(User, 'findOne').resolves(null);
      sinon.stub(User, 'create').resolves({ id: 1, username: 'testuser', email: 'test@example.com' });
      sinon.stub(jwt, 'sign').returns('testtoken');

      await registerUser(req, res);

      expect(statusStub.calledWith(201)).to.be.true;
      expect(cookieStub.calledWith('token', 'testtoken', sinon.match.any)).to.be.true;
      expect(jsonStub.calledOnce).to.be.true;
      expect(jsonStub.args[0][0]).to.have.property('message', 'User registered successfully');
      expect(jsonStub.args[0][0]).to.have.property('token', 'testtoken');
    });

    it('should return 400 if user already exists', async () => {
      const req = { body: { username: 'testuser', email: 'test@example.com', password: 'password123' } };
      const res = { status: statusStub, cookie: cookieStub };

      sinon.stub(User, 'findOne').resolves({});

      await registerUser(req, res);

      expect(statusStub.calledWith(400)).to.be.true;
      expect(jsonStub.calledWith({ message: 'User already exists' })).to.be.true;
    });

    it('should handle server errors', async () => {
      const req = { body: { username: 'testuser', email: 'test@example.com', password: 'password123' } };
      const res = { status: statusStub, cookie: cookieStub };

      sinon.stub(User, 'findOne').throws(new Error('Database error'));

      await registerUser(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Server error', error: 'Database error' })).to.be.true;
    });
  });

  // Test cases for loginUser
  describe('loginUser', () => {
    it('should log in user successfully', async () => {
      const req = { body: { email: 'test@example.com', password: 'password123' } };
      const res = { status: statusStub, cookie: cookieStub };
      const user = { id: 1, email: 'test@example.com', password: 'hashedpassword', comparePassword: sinon.stub().resolves(true) };

      sinon.stub(User, 'findOne').resolves(user);
      sinon.stub(jwt, 'sign').returns('testtoken');

      await loginUser(req, res);

      expect(statusStub.calledWith(200)).to.be.true;
      expect(cookieStub.calledWith('token', 'testtoken', sinon.match.any)).to.be.true;
      expect(jsonStub.calledOnce).to.be.true;
      expect(jsonStub.args[0][0]).to.have.property('message', 'Logged in successfully');
      expect(jsonStub.args[0][0]).to.have.property('token', 'testtoken');
    });

    it('should return 400 for invalid credentials', async () => {
      const req = { body: { email: 'test@example.com', password: 'wrongpassword' } };
      const res = { status: statusStub, cookie: cookieStub };
      const user = { id: 1, email: 'test@example.com', password: 'hashedpassword', comparePassword: sinon.stub().resolves(false) };

      sinon.stub(User, 'findOne').resolves(user);

      await loginUser(req, res);

      expect(statusStub.calledWith(400)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Invalid credentials' })).to.be.true;
    });

    it('should handle server errors', async () => {
      const req = { body: { email: 'test@example.com', password: 'password123' } };
      const res = { status: statusStub, cookie: cookieStub };

      sinon.stub(User, 'findOne').throws(new Error('Database error'));

      await loginUser(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Server error', error: 'Database error' })).to.be.true;
    });
  });

  // Test cases for logoutUser
  describe('logoutUser', () => {
    it('should clear cookie and return success message', async () => {
      const req = {};
      const res = { status: statusStub, clearCookie: clearCookieStub, json: jsonStub };

      await logoutUser(req, res);

      expect(clearCookieStub.calledWith('token')).to.be.true;
      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Logged out successfully' })).to.be.true;
    });

    it('should handle server errors', async () => {
      const req = {};
      const res = { status: statusStub, clearCookie: clearCookieStub, json: jsonStub };

      clearCookieStub.throws(new Error('Clear cookie error'));

      await logoutUser(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Server error', error: 'Clear cookie error' })).to.be.true;
    });
  });

  // Test cases for getMe
  describe('getMe', () => {
    it('should return user data if authenticated', async () => {
      const req = { user: { id: 1, username: 'testuser', email: 'test@example.com' } };
      const res = { status: statusStub, json: jsonStub };

      await getMe(req, res);

      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledWith({ user: req.user })).to.be.true;
    });

    it('should return 401 if user not authenticated', async () => {
      const req = {}; // No user in req means not authenticated
      const res = { status: statusStub, json: jsonStub };

      await getMe(req, res);

      expect(statusStub.calledWith(401)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Not authenticated' })).to.be.true;
    });

    it('should handle server errors', async () => {
      const req = { user: { id: 1, username: 'testuser', email: 'test@example.com' } };
      const res = { status: statusStub, json: jsonStub };

      // Simulate an error within the function (e.g., if user object is malformed)
      const originalJson = res.json;
      res.json = () => { throw new Error('JSON error'); };

      await getMe(req, res);

      expect(statusStub.calledWith(500)).to.be.true;
      expect(jsonStub.calledWith({ message: 'Server error', error: 'JSON error' })).to.be.true;

      res.json = originalJson; // Restore original json function
    });
  });
});