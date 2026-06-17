import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser} from '../services/api';
import './Profile.css';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastName: '',
    phoneNumber: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  });

  const fetchUserData = async () => {
    try {
      const response = await getCurrentUser();
      setUser(response.data);
      setFormData({
        firstname: response.data.firstname,
        lastName: response.data.lastName,
        phoneNumber: response.data.phoneNumber || ''
      });
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    // This will call the update profile endpoint when ready
    alert('Profile update will be available soon!');
    setIsEditing(false);
  };

  if (loading) return <div className="profile-loading">Loading...</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h1> My Profile</h1>
        </div>

        <div className="profile-content">
          <div className="profile-avatar">
            <span className="avatar-icon">👤</span>
          </div>

          {!isEditing ? (
            // View Mode
            <div className="profile-view">
              <div className="info-row">
                <span className="label">Full Name</span>
                <span className="value">{user?.firstname} {user?.lastName}</span>
              </div>
              <div className="info-row">
                <span className="label">Email</span>
                <span className="value">{user?.email}</span>
              </div>
              <div className="info-row">
                <span className="label">Phone</span>
                <span className="value">{user?.phoneNumber || 'Not provided'}</span>
              </div>
              <div className="info-row">
                <span className="label">Role</span>
                <span className="value role-badge">{user?.roleName || 'Consumer'}</span>
              </div>
              <div className="info-row">
                <span className="label">Member Since</span>
                <span className="value">{new Date(user?.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="profile-actions">
                <button onClick={() => setIsEditing(true)} className="btn-edit">
                  Edit Profile
                </button>
                <button onClick={() => navigate('/change-password')} className="btn-password">
                  Change Password
                </button>
              </div>
            </div>
          ) : (
            // Edit Mode
            <form onSubmit={handleUpdate} className="profile-edit">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={formData.firstname}
                  onChange={(e) => setFormData({...formData, firstname: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                />
              </div>
              <div className="edit-actions">
                <button type="submit" className="btn-save">Save Changes</button>
                <button type="button" onClick={() => setIsEditing(false)} className="btn-cancel">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}