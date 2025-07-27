import React, { useState, useEffect } from 'react';
import '../styles/UsersPage.css';

import { useAuth } from '../context/AuthContext';

const UsersPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'Staff'
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    role: ''
  });
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/users');
        
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const data = await response.json();
        setUsers(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  // Handle input change for new user form
  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser({
      ...newUser,
      [name]: value
    });
  };

  // Handle input change for edit user form
  const handleEditUserChange = (e) => {
    const { name, value } = e.target;
    setEditUser({
      ...editUser,
      [name]: value
    });
  };

  // Handle form submission for new user
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setActionError(null);
      
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add user');
      }
      
      const addedUser = await response.json();
      
      // Update users list
      setUsers([...users, addedUser]);
      
      // Reset form and close modal
      setNewUser({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'Staff'
      });
      setShowAddModal(false);
      
      // Show success message
      setActionSuccess('User added successfully');
      setTimeout(() => setActionSuccess(null), 3000);
      
    } catch (err) {
      setActionError(err.message);
    }
  };

  // Handle form submission for edit user
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setActionError(null);
      
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editUser)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }
      
      const updatedUser = await response.json();
      
      // Update users list
      setUsers(users.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      ));
      
      // Close modal
      setShowEditModal(false);
      
      // Show success message
      setActionSuccess('User updated successfully');
      setTimeout(() => setActionSuccess(null), 3000);
      
    } catch (err) {
      setActionError(err.message);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      setActionError(null);
      
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }
      
      // Update users list
      setUsers(users.filter(user => user.id !== userId));
      
      // Show success message
      setActionSuccess('User deleted successfully');
      setTimeout(() => setActionSuccess(null), 3000);
      
    } catch (err) {
      setActionError(err.message);
    }
  };

  // Open edit modal with user data
  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditUser({
      username: user.username,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role
    });
    setShowEditModal(true);
  };

  if (loading) {
    return <div className="users-loading">Loading users...</div>;
  }

  if (error) {
    return <div className="users-error">Error: {error}</div>;
  }

  return (
    <div className="users-container">
      <div className="users-header">
        <h1>User Management</h1>
        <button 
          className="add-user-btn" 
          onClick={() => setShowAddModal(true)}
        >
          Add New User
        </button>
      </div>
      
      {actionSuccess && (
        <div className="action-success-message">
          {actionSuccess}
        </div>
      )}
      
      {actionError && (
        <div className="action-error-message">
          {actionError}
        </div>
      )}
      
      {users.length === 0 ? (
        <div className="no-users">No users found.</div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    {user.firstName && user.lastName ? 
                      `${user.firstName} ${user.lastName}` : 
                      'N/A'}
                  </td>
                  <td>
                    <span className={`role-badge ${user.role.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="user-actions">
                    <button 
                      className="edit-btn" 
                      onClick={() => openEditModal(user)}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-btn" 
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New User</h2>
              <button 
                className="close-modal" 
                onClick={() => setShowAddModal(false)}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="user-form">
              <div className="form-group">
                <label htmlFor="username">Username*</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={newUser.username}
                  onChange={handleNewUserChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email*</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newUser.email}
                  onChange={handleNewUserChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password*</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={newUser.password}
                  onChange={handleNewUserChange}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={newUser.firstName}
                    onChange={handleNewUserChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={newUser.lastName}
                    onChange={handleNewUserChange}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="role">Role*</label>
                <select
                  id="role"
                  name="role"
                  value={newUser.role}
                  onChange={handleNewUserChange}
                  required
                >
                  <option value="Staff">Staff</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit User</h2>
              <button 
                className="close-modal" 
                onClick={() => setShowEditModal(false)}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="user-form">
              <div className="form-group">
                <label htmlFor="edit-username">Username*</label>
                <input
                  type="text"
                  id="edit-username"
                  name="username"
                  value={editUser.username}
                  onChange={handleEditUserChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-email">Email*</label>
                <input
                  type="email"
                  id="edit-email"
                  name="email"
                  value={editUser.email}
                  onChange={handleEditUserChange}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-firstName">First Name</label>
                  <input
                    type="text"
                    id="edit-firstName"
                    name="firstName"
                    value={editUser.firstName}
                    onChange={handleEditUserChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit-lastName">Last Name</label>
                  <input
                    type="text"
                    id="edit-lastName"
                    name="lastName"
                    value={editUser.lastName}
                    onChange={handleEditUserChange}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-role">Role*</label>
                <select
                  id="edit-role"
                  name="role"
                  value={editUser.role}
                  onChange={handleEditUserChange}
                  required
                >
                  <option value="Staff">Staff</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;