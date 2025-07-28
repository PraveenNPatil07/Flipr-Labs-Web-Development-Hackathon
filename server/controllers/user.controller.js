import { ValidationError } from '../utils/error.utils.js';
import { isValidEmail, validatePassword } from '../utils/validation.utils.js';
import { User, NotificationPreference } from '../models/index.js';

/**
 * @desc Get all users
 * @route GET /api/users
 * @access Private/Admin
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void} Sends a JSON response with an array of user objects.
 */
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc Get user by ID
 * @route GET /api/users/:id
 * @access Private/Admin
 * @param {Object} req - The request object.
 * @param {Object} req.params - The route parameters.
 * @param {string} req.params.id - The ID of the user to retrieve.
 * @param {Object} res - The response object.
 * @returns {void} Sends a JSON response with the user object or a 404 if not found.
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: NotificationPreference }]
    });

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc Create a new user
 * @route POST /api/users
 * @access Private/Admin
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.username - The username for the new user.
 * @param {string} req.body.email - The email for the new user.
 * @param {string} req.body.password - The password for the new user.
 * @param {string} [req.body.role='Staff'] - The role of the new user (e.g., 'Admin', 'Staff').
 * @param {Object} res - The response object.
 * @returns {void} Sends a JSON response with the newly created user's details or validation errors.
 */
const createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validate input
    const errors = {};
    
    if (!username) errors.username = 'Username is required';
    if (!email) errors.email = 'Email is required';
    if (!password) errors.password = 'Password is required';
    
    if (email && !isValidEmail(email)) {
      errors.email = 'Invalid email format';
    }
    
    if (password) {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.message;
      }
    }
    
    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

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
      role: role || 'Staff' // Default to Staff if not specified
    });

    // Create notification preferences
    await NotificationPreference.create({
      userId: user.id
    });

    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(error.statusCode).json({
        message: error.message,
        errors: error.errors
      });
    }
    
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc Update user
 * @route PUT /api/users/:id
 * @access Private/Admin
 * @param {Object} req - The request object.
 * @param {Object} req.params - The route parameters.
 * @param {string} req.params.id - The ID of the user to update.
 * @param {Object} req.body - The request body.
 * @param {string} [req.body.username] - The new username.
 * @param {string} [req.body.email] - The new email.
 * @param {string} [req.body.password] - The new password.
 * @param {string} [req.body.role] - The new role.
 * @param {string} [req.body.firstName] - The new first name.
 * @param {string} [req.body.lastName] - The new last name.
 * @param {Object} res - The response object.
 * @returns {void} Sends a JSON response with the updated user's details or validation errors.
 */
const updateUser = async (req, res) => {
  try {
    const { username, email, password, role, firstName, lastName } = req.body;

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate input
    const errors = {};
    
    if (email && !isValidEmail(email)) {
      errors.email = 'Invalid email format';
    }
    
    if (password) {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.message;
      }
    }
    
    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    // Update user fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = password;
    if (role) user.role = role;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;

    await user.save();

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(error.statusCode).json({
        message: error.message,
        errors: error.errors
      });
    }
    
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc Delete user
 * @route DELETE /api/users/:id
 * @access Private/Admin
 * @param {Object} req - The request object.
 * @param {Object} req.params - The route parameters.
 * @param {string} req.params.id - The ID of the user to delete.
 * @param {Object} res - The response object.
 * @returns {void} Sends a JSON response confirming user deletion or a 404 if not found.
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();

    res.json({ message: 'User removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};