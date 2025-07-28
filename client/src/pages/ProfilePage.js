import React, { useState, useEffect } from 'react';
import '../styles/ProfilePage.css';

import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    notificationPreferences: {
      emailEnabled: false,
      browserEnabled: false,
      slackEnabled: false,
      lowStockThreshold: 10
    }
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://flipr-labs-web-development-hackathon.onrender.com/api/auth/profile');
        
        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }
        
        const userData = await response.json();

        setUser(userData);
        
        // Initialize form data with user data
        setFormData({
          username: userData.username || '',
          email: userData.email || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          notificationPreferences: {
            emailEnabled: userData.notificationPreferences?.emailEnabled || false,
          browserEnabled: userData.notificationPreferences?.browserEnabled || false,
          slackEnabled: userData.notificationPreferences?.slackEnabled || false,
          lowStockThreshold: userData.notificationPreferences?.lowStockThreshold || 10
          }
        });
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, []);

  // Handle input change for profile form
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('notification_')) {
      const prefName = name.replace('notification_', '');
      // Handle lowStockThreshold as a number
      if (prefName === 'lowStockThreshold') {
        setFormData(prev => ({
          ...prev,
          notificationPreferences: {
            ...prev.notificationPreferences,
            [prefName]: parseInt(value, 10) || 0
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          notificationPreferences: {
            ...prev.notificationPreferences,
            [prefName]: checked
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Handle input change for password form
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle profile update submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setUpdateError(null);
      
      const response = await fetch('https://flipr-labs-web-development-hackathon.onrender.com/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      const updatedUser = await response.json();
      setUser(updatedUser);
      
      // Show success message
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
      
      // Exit edit mode
      setIsEditing(false);
      
    } catch (err) {
      setUpdateError(err.message);
    }
  };

  // Handle password change submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    try {
      setPasswordError(null);
      
      const response = await fetch('https://flipr-labs-web-development-hackathon.onrender.com/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }
      
      // Reset password form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Show success message
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
      
      // Hide password form
      setShowPasswordForm(false);
      
    } catch (err) {
      setPasswordError(err.message);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    // Reset form data to current user data
    setFormData({
      username: user.username || '',
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      notificationPreferences: {
        emailEnabled: user.notificationPreferences?.emailEnabled || false,
        browserEnabled: user.notificationPreferences?.browserEnabled || false,
        slackEnabled: user.notificationPreferences?.slackEnabled || false,
        lowStockThreshold: user.notificationPreferences?.lowStockThreshold || 10
      }
    });
    
    setIsEditing(false);
    setUpdateError(null);
  };

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  if (error) {
    return <div className="profile-error">Error: {error}</div>;
  }

  return (
    <div className="profile-container">
      <h1>My Profile</h1>
      
      {updateSuccess && (
        <div className="profile-success-message">
          Profile updated successfully!
        </div>
      )}
      
      {passwordSuccess && (
        <div className="profile-success-message">
          Password changed successfully!
        </div>
      )}
      
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.firstName && user.lastName ? (
              `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
            ) : (
              user.username.substring(0, 2).toUpperCase()
            )}
          </div>
          
          <div className="profile-title">
            <h2>{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}</h2>
            <p className="profile-role">{user.role}</p>
          </div>
          
          {!isEditing && (
            <button 
              className="edit-profile-btn" 
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          )}
        </div>
        
        {isEditing ? (
          <form onSubmit={handleProfileSubmit} className="profile-form">
            {updateError && (
              <div className="profile-error-message">{updateError}</div>
            )}
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                    disabled={!isEditing}
                  />
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                    disabled={!isEditing}
                  />
              </div>
            </div>
            
            <div className="notification-preferences">
              <h3>Notification Preferences</h3>
              
              <div className="form-group">
                <label htmlFor="notification_emailEnabled">Email Notifications:</label>
                <input
                  type="checkbox"
                  id="notification_emailEnabled"
                  name="notification_emailEnabled"
                  checked={formData.notificationPreferences.emailEnabled}
                  onChange={handleInputChange}
                    disabled={!isEditing}
                  />
              </div>
              <div className="form-group">
                <label htmlFor="notification_browserEnabled">Browser Notifications:</label>
                <input
                  type="checkbox"
                  id="notification_browserEnabled"
                  name="notification_browserEnabled"
                  checked={formData.notificationPreferences.browserEnabled}
                  onChange={handleInputChange}
                    disabled={!isEditing}
                  />
              </div>
              <div className="form-group">
                <label htmlFor="notification_slackEnabled">Slack Notifications:</label>
                <input
                  type="checkbox"
                  id="notification_slackEnabled"
                  name="notification_slackEnabled"
                  checked={formData.notificationPreferences.slackEnabled}
                  onChange={handleInputChange}
                    disabled={!isEditing}
                  />
              </div>
              <div className="form-group">
                <label htmlFor="notification_lowStockThreshold">Low Stock Threshold:</label>
                <input
                  type="number"
                  id="notification_lowStockThreshold"
                  name="notification_lowStockThreshold"
                  value={formData.notificationPreferences.lowStockThreshold}
                  onChange={handleInputChange}
                    disabled={!isEditing}
                  />
              </div>
            </div>
            
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={handleCancelEdit}>
                Cancel
              </button>
              <button type="submit" className="save-btn">
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-details">
            <div className="detail-group">
              <h3>Account Information</h3>
              <div className="detail-row">
                <span className="detail-label">Username:</span>
                <span className="detail-value">{user.username}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{user.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Full Name:</span>
                <span className="detail-value">
                  {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Not provided'}
                </span>
              </div>
            </div>
            
            <div className="detail-group">
              <h3>Notification Preferences</h3>
              <div className="detail-row">
                <span className="detail-label">Email Notifications:</span>
                <span className="detail-value">
                  {user.notificationPreferences?.emailEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Browser Notifications:</span>
                <span className="detail-value">
                  {user.notificationPreferences?.browserEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Slack Notifications:</span>
                <span className="detail-value">
                  {user.notificationPreferences?.slackEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Low Stock Threshold:</span>
                <span className="detail-value">
                  {user.notificationPreferences?.lowStockThreshold || 0}
                </span>
              </div>
            </div>
            
            <div className="password-section">
              <h3>Password</h3>
              <button 
                className="change-password-btn" 
                onClick={() => setShowPasswordForm(!showPasswordForm)}
              >
                {showPasswordForm ? 'Cancel' : 'Change Password'}
              </button>
              
              {showPasswordForm && (
                <form onSubmit={handlePasswordSubmit} className="password-form">
                  {passwordError && (
                    <div className="profile-error-message">{passwordError}</div>
                  )}
                  
                  <div className="form-group">
                    <label htmlFor="currentPassword">Current Password</label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  
                  <button type="submit" className="save-btn">
                    Update Password
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;