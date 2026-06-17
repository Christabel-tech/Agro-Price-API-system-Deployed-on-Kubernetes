import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setMessage('');
    
    try {
      await api.post('/auth/forgot-password', { email });
      setIsSubmitted(true);
      setMessage('Password reset link has been sent to your email address.');
    } catch (err) {
      // For security, always show the same message even if email doesn't exist
      setIsSubmitted(true);
      setMessage('If your email is registered, you will receive a password reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Check Your Email</h2>
            <p>We've sent you a password reset link</p>
          </div>
          
          <div className="success-alert" style={{ textAlign: 'center' }}>
            📧 {message}
          </div>
          
          <p style={{ textAlign: 'center', marginTop: '20px' }}>
            Didn't receive the email? Check your spam folder or{' '}
            <button 
              onClick={() => {
                setIsSubmitted(false);
                setMessage('');
                setEmail('');
              }}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#2e7d32', 
                cursor: 'pointer', 
                textDecoration: 'underline',
                fontSize: 'inherit'
              }}
            >
              try again
            </button>
          </p>
          
          <div className="auth-footer">
            <Link to="/login">Back to Login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Forgot Password?</h2>
          <p>Enter your email to reset your password</p>
        </div>
        
        {error && <div className="error-alert">{error}</div>}
        {message && <div className="success-alert">{message}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              autoFocus
            />
          </div>
          
          <button 
            type="submit" 
            className={`auth-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
            style={{ backgroundColor: '#2e7d32' }}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Sending...
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Remember your password? <Link to="/login">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}