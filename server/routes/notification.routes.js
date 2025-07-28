import express from 'express';
import { getNotificationPreferences, updateNotificationPreferences, sendTestNotification, getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.middleware.js';
const router = express.Router();

// Notification preferences
router.get('/preferences', protect, getNotificationPreferences);
router.put('/preferences', protect, updateNotificationPreferences);

// Test notification
router.post('/test', protect, sendTestNotification);

// Notifications
router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markNotificationAsRead);
router.put('/read-all', protect, markAllNotificationsAsRead);

export default router;