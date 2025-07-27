const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/user.controller');
const { protect, admin } = require('../middleware/auth.middleware');

// Admin routes for user management
router.get('/', protect, admin, getUsers);
router.post('/', protect, admin, createUser);

// Routes for specific user
router.get('/:id', protect, admin, getUserById);
router.put('/:id', protect, admin, updateUser);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;