import express from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/user.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';
const router = express.Router();

// Admin routes for user management
router.get('/', protect, admin, getUsers);
router.post('/', protect, admin, createUser);

// Routes for specific user
router.get('/:id', protect, admin, getUserById);
router.put('/:id', protect, admin, updateUser);
router.delete('/:id', protect, admin, deleteUser);

export default router;