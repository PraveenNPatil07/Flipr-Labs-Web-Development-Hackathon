const express = require('express');
const router = express.Router();
const {
  getNotificationPreferences,
  updateNotificationPreferences,
  sendTestNotification
} = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');
const { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } = require('../controllers/notification.controller');

// Notification preferences
router.get('/preferences', protect, getNotificationPreferences);
router.put('/preferences', protect, updateNotificationPreferences);

// Test notification
router.post('/test', protect, sendTestNotification);

// Notifications
router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markNotificationAsRead);
router.put('/read-all', protect, markAllNotificationsAsRead);

module.exports = router;