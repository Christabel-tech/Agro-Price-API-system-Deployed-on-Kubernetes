import React, { useState, useEffect } from 'react';
import { useNavigate} from 'react-router-dom';
import { getCurrentUser } from '../services/api';
import './Dashboard.css';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    const fetchUserData = async () => {
      try {
        const response = await getCurrentUser();
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('email');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);


  const getRoleIcon = () => {
    const roleId = localStorage.getItem('roleId');
    switch(roleId) {
      case '1': return '';  // Trader
      case '2': return '';  // Policymaker
      case '3': return '';  // Consumer
      case '4': return '';  // Developer
      case '5': return '';  // Admin - FIXED
      default: return '👤';
    }
  };

  const roleName = localStorage.getItem('roleName') || 'User';
  const email = localStorage.getItem('email');

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <h1>🌾 Agro-Price Dashboard</h1>
        </div>

        <div className="welcome-section">
          <div className="welcome-icon">{getRoleIcon()}</div>
          <div className="welcome-text">
            <h2>Welcome, {user?.firstname || (email ? email.split('@')[0] : 'User')}! </h2>
            <p>Role: <strong>{roleName}</strong></p>
          </div>
        </div>
        <div className="quick-actions">

          <div className="actions-grid">           
          </div>
        </div>

        <div className="user-info-card">
          <h3>Your Profile Information</h3>
          <div className="info-row">
            <span className="info-label">Name:</span>
            <span className="info-value">{user?.firstname} {user?.lastName}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Email:</span>
            <span className="info-value">{user?.email}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Phone:</span>
            <span className="info-value">{user?.phoneNumber || 'Not provided'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Role:</span>
            <span className="info-value">{roleName}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Account Status:</span>
            <span className={`status-badge ${user?.isActive ? 'active' : 'inactive'}`}>
              {user?.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Member since:</span>
            <span className="info-value">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}