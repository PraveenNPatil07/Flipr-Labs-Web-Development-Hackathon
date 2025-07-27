const { NotificationPreference, User, Notification } = require('../models');

// @desc    Get user notification preferences
// @route   GET /api/notifications/preferences
// @access  Private
const getNotificationPreferences = async (req, res) => {
  try {
    const preferences = await NotificationPreference.findOne({
      where: { userId: req.user.id },
    });

    if (!preferences) {
      return res.status(404).json({ message: 'Notification preferences not found' });
    }

    res.status(200).json(preferences);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user notification preferences
// @route   PUT /api/notifications/preferences
// @access  Private
const updateNotificationPreferences = async (req, res) => {
  try {
    const { emailEnabled, browserEnabled, slackEnabled, lowStockThreshold } = req.body;

    let preferences = await NotificationPreference.findOne({
      where: { userId: req.user.id },
    });

    if (!preferences) {
      // Create new preferences
      preferences = await NotificationPreference.create({
        userId: req.user.id,
        emailEnabled: emailEnabled ?? true,
        browserEnabled: browserEnabled ?? true,
        slackEnabled: slackEnabled ?? false,
        lowStockThreshold: lowStockThreshold ?? 10,
      });
    } else {
      // Update existing preferences
      preferences.emailEnabled = emailEnabled ?? preferences.emailEnabled;
      preferences.browserEnabled = browserEnabled ?? preferences.browserEnabled;
      preferences.slackEnabled = slackEnabled ?? preferences.slackEnabled;
      preferences.lowStockThreshold = lowStockThreshold ?? preferences.lowStockThreshold;
      await preferences.save();
    }

    res.status(200).json(preferences);
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Send test notification
// @route   POST /api/notifications/test
// @access  Private
const sendTestNotification = async (req, res) => {
  try {
    const { type } = req.body;

    if (!type || !['email', 'browser', 'slack'].includes(type)) {
      return res.status(400).json({ message: 'Invalid notification type' });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // In production, call actual notification sending service
    res.status(200).json({
      message: `Test ${type} notification sent successfully to ${user.email}`,
      success: true,
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all notifications for a user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      where: { id, userId: req.user.id },
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.user.id, isRead: false } }
    );

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getNotificationPreferences,
  updateNotificationPreferences,
  sendTestNotification,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
