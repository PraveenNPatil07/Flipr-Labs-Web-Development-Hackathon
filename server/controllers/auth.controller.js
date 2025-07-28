import { User, NotificationPreference } from '../models/index.js';
import jwt from 'jsonwebtoken';

/**
 * @desc Generates a JWT token for a given user ID.
 * @param {string} id - The user ID for which to generate the token.
 * @returns {string} A signed JWT token.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

/**
 * @desc Registers a new user in the system.
 * @route POST /api/auth/register
 * @access Public
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing user details.
 * @param {string} req.body.username - The username of the new user.
 * @param {string} req.body.email - The email of the new user.
 * @param {string} req.body.password - The password of the new user.
 * @param {string} [req.body.role='Staff'] - The role of the new user (e.g., 'Admin', 'Staff').
 * @param {Object} res - The response object.
 * @returns {void} Sends a JSON response with user details and a JWT token in a cookie.
 */
const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'Staff'
    });

    // Create notification preferences for new user
    await NotificationPreference.create({ userId: user.id });

    // Generate token
    const token = generateToken(user.id);

    // Set JWT in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('[Register Error]', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc Authenticates a user and logs them into the system.
 * @route POST /api/auth/login
 * @access Public
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing login credentials.
 * @param {string} req.body.email - The email of the user.
 * @param {string} req.body.password - The password of the user.
 * @param {Object} res - The response object.
 * @returns {void} Sends a JSON response with user details and a JWT token in a cookie.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user.id);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
      });

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('[Login Error]', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc Logs out the current user by clearing the JWT token cookie.
 * @route POST /api/auth/logout
 * @access Private
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void} Sends a JSON response indicating successful logout.
 */
const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    sameSite: 'strict'
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

/**
 * @desc Retrieves the profile of the authenticated user.
 * @route GET /api/auth/profile
 * @access Private
 * @param {Object} req - The request object, containing the authenticated user's ID.
 * @param {Object} res - The response object.
 * @returns {void} Sends a JSON response with the user's profile and notification preferences.
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: NotificationPreference,
        as: 'notificationPreferences'
      }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }



    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc Updates the profile of the authenticated user.
 * @route PUT /api/auth/profile
 * @access Private
 * @param {Object} req - The request object, containing the authenticated user's ID and update data.
 * @param {Object} req.body - The request body containing fields to update (username, email, password, firstName, lastName, notificationPreferences).
 * @param {Object} res - The response object.
 * @returns {void} Sends a JSON response with the updated user's profile.
 */
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    // Update notification preferences
    if (req.body.notificationPreferences) {
      await NotificationPreference.update(
        req.body.notificationPreferences,
        { where: { userId: updatedUser.id } }
      );
    }

    // Fetch updated user with notification preferences
    const userWithPrefs = await User.findByPk(updatedUser.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: NotificationPreference, as: 'notificationPreferences' }]
    });

    res.json(userWithPrefs);
  } catch (error) {
    console.error('[Update Profile Error]', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export {
  register,
  login,
  logout,
  getUserProfile,
  updateUserProfile
};
