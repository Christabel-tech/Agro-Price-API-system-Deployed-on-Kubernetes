import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    roleId: 3,
    isActive: true
  });
  const navigate = useNavigate();

  const roleOptions = [
    { id: 1, name: 'Trader', color: '#4caf50' },
    { id: 2, name: 'Policymaker', color: '#2196f3' },
    { id: 3, name: 'Consumer', color: '#ff9800' },
    { id: 4, name: 'Developer', color: '#9c27b0' },
    { id: 5, name: 'Administrator', color: '#f44336' }
  ];

  useEffect(() => {
    checkAdminAndFetchUsers();
  },);

  const checkAdminAndFetchUsers = async () => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('roleId');
    
    if (!token) {
      navigate('/login');
      return;
    }
    
    if (userRole !== '5') {
      setMessage({ type: 'error', text: 'Access denied. Admin only.' });
      setTimeout(() => navigate('/dashboard'), 2000);
      return;
    }
    
    fetchUsers();
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/auth/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setMessage({ type: 'error', text: 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/users', formData);
      setMessage({ type: 'success', text: 'User created successfully!' });
      setShowCreateModal(false);
      setFormData({ firstName: '', lastName: '', email: '', password: '', phoneNumber: '', roleId: 3, isActive: true });
      fetchUsers();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to create user' });
    }
  };

  const handleUpdateRole = async (userId, roleId) => {
    try {
      await api.put(`/auth/users/${userId}/role?role_id=${roleId}`);
      setMessage({ type: 'success', text: 'Role updated successfully!' });
      fetchUsers();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update role' });
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    try {
      await api.put(`/auth/users/${userId}/${action}`);
      setMessage({ type: 'success', text: `User ${action}d successfully!` });
      fetchUsers();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to ${action} user` });
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone!`)) {
      try {
        await api.delete(`/auth/users/${userId}`);
        setMessage({ type: 'success', text: 'User deleted successfully!' });
        fetchUsers();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete user' });
      }
    }
  };

  const getRoleColor = (roleId) => {
    const role = roleOptions.find(r => r.id === roleId);
    return role ? role.color : '#999';
  };

  if (loading) {
    return <div className="admin-loading">Loading admin dashboard...</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>👑 Admin Dashboard</h1>
        <button onClick={() => navigate('/dashboard')} className="back-btn">← Back to Dashboard</button>
      </div>

      {message.text && (
        <div className={`admin-alert ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="admin-actions">
        <button onClick={() => setShowCreateModal(true)} className="btn-create">
          + Create New User
        </button>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.firstname} {user.lastName}</td>
                <td>{user.email}</td>
                <td>{user.phoneNumber || '-'}</td>
                <td>
                  <select
                    value={user.roleId}
                    onChange={(e) => handleUpdateRole(user.id, parseInt(e.target.value))}
                    style={{ borderColor: getRoleColor(user.roleId), fontWeight: 'bold' }}
                  >
                    {roleOptions.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="actions">
                  <button
                    onClick={() => handleToggleStatus(user.id, user.isActive)}
                    className={`btn-status ${user.isActive ? 'btn-deactivate' : 'btn-activate'}`}
                    title={user.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {user.isActive ? '🔴' : '🟢'}
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id, `${user.firstname} ${user.lastName}`)}
                    className="btn-delete"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New User</h2>
            <form onSubmit={handleCreateUser}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  minLength={8}
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
              <div className="form-row">
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={formData.roleId}
                    onChange={(e) => setFormData({...formData, roleId: parseInt(e.target.value)})}
                  >
                    {roleOptions.filter(r => r.id !== 5).map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}