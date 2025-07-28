import express from 'express';
const router = express.Router();
import { register, login, logout, getUserProfile, updateUserProfile } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

export default router;