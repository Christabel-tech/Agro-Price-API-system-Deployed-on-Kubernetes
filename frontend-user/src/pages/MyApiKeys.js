import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './MyApiKeys.css';

export default function MyApiKeys() {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKey, setNewKey] = useState({
    name: '',
    rateLimit: 100,
    expiresInDays: 90
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [createdKey, setCreatedKey] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authorized to view API keys
    const roleId = localStorage.getItem('roleId');
    if (roleId !== '4' && roleId !== '5') {
      setMessage({ type: 'error', text: 'Access denied. Only Developers and Admins can access API keys.' });
      setTimeout(() => navigate('/dashboard'), 2000);
      return;
    }
    fetchApiKeys();
  }, [navigate]);

  const fetchApiKeys = async () => {
    try {
      const response = await api.get('/auth/users/apikeys');
      setApiKeys(response.data.api_keys || []);
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
      setMessage({ type: 'error', text: 'Failed to load API keys' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    try {
      const response = await api.post('/auth/users/apikeys', newKey);
      setCreatedKey(response.data);
      setMessage({ type: 'success', text: 'API key created successfully!' });
      setShowCreateForm(false);
      fetchApiKeys();
      // Reset form
      setNewKey({ name: '', rateLimit: 100, expiresInDays: 90 });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to create API key' });
    }
  };

  const handleRevokeKey = async (keyId, keyName) => {
    if (window.confirm(`Are you sure you want to revoke API key "${keyName}"? This action cannot be undone!`)) {
      try {
        await api.delete(`/auth/users/apikeys/${keyId}`);
        setMessage({ type: 'success', text: 'API key revoked successfully' });
        fetchApiKeys();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to revoke API key' });
      }
    }
  };

  const handleRenewKey = async (keyId) => {
    try {
      await api.put(`/auth/users/apikeys/${keyId}/renew?days=90`);
      setMessage({ type: 'success', text: 'API key renewed successfully!' });
      fetchApiKeys();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to renew API key' });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setMessage({ type: 'success', text: 'API key copied to clipboard!' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'active': { class: 'status-active', text: 'Active' },
      'revoked': { class: 'status-revoked', text: 'Revoked' },
      'expired': { class: 'status-expired', text: 'Expired' }
    };
    const s = statusMap[status] || statusMap['active'];
    return <span className={`status-badge ${s.class}`}>{s.text}</span>;
  };

  const isExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="apikeys-loading">
        <div className="loading-spinner">Loading your API keys...</div>
      </div>
    );
  }

  return (
    <div className="apikeys-container">
      <div className="apikeys-card">
        {/* Header */}
        <div className="apikeys-header">
          <div className="header-left">
            <h1>🔑 My API Keys</h1>
            <p>Manage your API keys for external application access</p>
          </div>
          <button onClick={() => setShowCreateForm(true)} className="btn-create-key">
            + Create New Key
          </button>
        </div>

        {/* Messages */}
        {message.text && (
          <div className={`alert-message ${message.type}`}>
            {message.type === 'success' ? '✅' : '❌'} {message.text}
          </div>
        )}

        {/* Newly Created Key - Show Full Key */}
        {createdKey && (
          <div className="new-key-alert">
            <div className="new-key-title">⚠️ Important! Save your new API key</div>
            <p>This is the only time you will see the full key. Make sure to copy it now!</p>
            <div className="new-key-value">
              <code>{createdKey.api_key}</code>
              <button onClick={() => copyToClipboard(createdKey.api_key)} className="btn-copy">
                📋 Copy
              </button>
            </div>
            <div className="new-key-details">
              <span>Name: {createdKey.name}</span>
              <span>Rate Limit: {createdKey.rateLimit}/min</span>
              <span>Expires: {new Date(createdKey.expiresAt).toLocaleDateString()}</span>
            </div>
            <button onClick={() => setCreatedKey(null)} className="btn-dismiss">
              Dismiss
            </button>
          </div>
        )}

        {/* API Keys Table */}
        {apiKeys.length === 0 ? (
          <div className="no-keys">
            <div className="no-keys-icon">🔑</div>
            <h3>No API Keys Yet</h3>
            <p>Create your first API key to start building applications on the Agro-Price API.</p>
            <button onClick={() => setShowCreateForm(true)} className="btn-create-first">
              Create Your First API Key
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="apikeys-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Key</th>
                  <th>Status</th>
                  <th>Rate Limit</th>
                  <th>Expires</th>
                  <th>Last Used</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map(key => (
                  <tr key={key.apiKeyId} className={key.status === 'revoked' ? 'row-revoked' : ''}>
                    <td className="key-name">{key.name || 'Unnamed'}</td>
                    <td>
                      <code className="key-value">{key.keyValue}</code>
                      {key.status === 'active' && (
                        <button onClick={() => copyToClipboard(key.keyValue)} className="btn-copy-small">
                          📋
                        </button>
                      )}
                    </td>
                    <td>{getStatusBadge(key.status)}</td>
                    <td>{key.rateLimit}/min</td>
                    <td className={isExpired(key.expiresAt) ? 'expired-text' : ''}>
                      {new Date(key.expiresAt).toLocaleDateString()}
                      {isExpired(key.expiresAt) && ' (Expired)'}
                    </td>
                    <td>{key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}</td>
                    <td className="actions-cell">
                      {key.status === 'active' && (
                        <>
                          <button 
                            onClick={() => handleRenewKey(key.apiKeyId)} 
                            className="btn-renew"
                            title="Renew API key for another 90 days"
                          >
                            🔄
                          </button>
                          <button 
                            onClick={() => handleRevokeKey(key.apiKeyId, key.name)} 
                            className="btn-revoke"
                            title="Revoke API key"
                          >
                            🚫
                          </button>
                        </>
                      )}
                      {key.status === 'revoked' && (
                        <span className="revoked-label">Revoked</span>
                      )}
                      {key.status === 'expired' && (
                        <button 
                          onClick={() => handleRenewKey(key.apiKeyId)} 
                          className="btn-renew"
                          title="Renew expired API key"
                        >
                          🔄 Renew
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Key Modal */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New API Key</h2>
              <button className="modal-close" onClick={() => setShowCreateForm(false)}>✕</button>
            </div>
            
            <form onSubmit={handleCreateKey}>
              <div className="form-group">
                <label htmlFor="keyName">Key Name *</label>
                <input
                  id="keyName"
                  type="text"
                  value={newKey.name}
                  onChange={(e) => setNewKey({...newKey, name: e.target.value})}
                  placeholder="e.g., Mobile App, Production Server, Analytics Tool"
                  required
                />
                <small>A descriptive name to help you identify this key</small>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="rateLimit">Rate Limit (requests/minute)</label>
                  <input
                    id="rateLimit"
                    type="number"
                    value={newKey.rateLimit}
                    onChange={(e) => setNewKey({...newKey, rateLimit: parseInt(e.target.value)})}
                    min={10}
                    max={10000}
                  />
                  <small>Maximum requests per minute</small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="expiresInDays">Expires In (days)</label>
                  <input
                    id="expiresInDays"
                    type="number"
                    value={newKey.expiresInDays}
                    onChange={(e) => setNewKey({...newKey, expiresInDays: parseInt(e.target.value)})}
                    min={1}
                    max={365}
                  />
                  <small>Key will expire after this many days</small>
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateForm(false)} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-create">
                  Create API Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}