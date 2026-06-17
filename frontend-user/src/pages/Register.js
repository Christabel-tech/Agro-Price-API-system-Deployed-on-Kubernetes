import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({
    firstname: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    roleId: 3,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const navigate = useNavigate();

  const roleOptions = [
    { id: 1, name: 'Trader',},
    { id: 2, name: 'Policymaker'},
    { id: 3, name: 'Consumer' },
    { id: 4, name: 'Developer'},
  ];

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'firstname':
        if (!value.trim()) error = 'First name is required';
        else if (value.length < 2) error = 'First name must be at least 2 characters';
        break;
      case 'lastName':
        if (!value.trim()) error = 'Last name is required';
        else if (value.length < 2) error = 'Last name must be at least 2 characters';
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) error = 'Email is required';
        else if (!emailRegex.test(value)) error = 'Please enter a valid email address';
        break;
      case 'password':
        if (!value) error = 'Password is required';
        else if (value.length < 8) error = 'Password must be at least 8 characters';
        else if (!/(?=.*[a-z])/.test(value)) error = 'Password must contain at least one lowercase letter';
        else if (!/(?=.*[A-Z])/.test(value)) error = 'Password must contain at least one uppercase letter';
        else if (!/(?=.*\d)/.test(value)) error = 'Password must contain at least one number';
        break;
      case 'confirmPassword':
        if (value !== form.password) error = 'Passwords do not match';
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === 'roleId') {
      newValue = parseInt(value, 10);
    }
    setForm({ ...form, [name]: newValue });
    const error = validateField(name, newValue);
    setErrors({ ...errors, [name]: error });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    Object.keys(form).forEach(key => {
      if (key !== 'confirmPassword' && key !== 'roleId') {
        const error = validateField(key, form[key]);
        if (error) newErrors[key] = error;
      }
    });
    
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    if (!acceptTerms) {
      setErrors({ terms: 'Please accept the Terms and Conditions' });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const registrationData = {
        firstname: form.firstname,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phoneNumber: form.phoneNumber,
        roleId: form.roleId,
      };
      
      await register(registrationData);
      
      setRegistrationSuccess(true);
      
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Registration successful! Please login with your credentials.' } 
        });
      }, 2000);
      
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Registration failed. Please try again.';
      setErrors({ submit: errorMessage });
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        {/* Home Link - Top Right Corner */}
        <div className="home-link-container">
          <Link to="/" className="home-link">
            ← Back to Home
          </Link>
        </div>

        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join our agro-price community</p>
        </div>
        
        {registrationSuccess && (
          <div className="success-alert">
            ✅ Registration successful! Redirecting to login...
          </div>
        )}
        
        {errors.submit && <div className="error-alert">{errors.submit}</div>}
        
        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstname">First Name *</label>
              <input
                id="firstname"
                type="text"
                name="firstname"
                placeholder="First name"
                value={form.firstname}
                onChange={handleChange}
                className={errors.firstname ? 'error' : ''}
                disabled={isLoading || registrationSuccess}
              />
              {errors.firstname && <span className="error-message">{errors.firstname}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                placeholder="Last name"
                value={form.lastName}
                onChange={handleChange}
                className={errors.lastName ? 'error' : ''}
                disabled={isLoading || registrationSuccess}
              />
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              disabled={isLoading || registrationSuccess}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              id="phoneNumber"
              type="tel"
              name="phoneNumber"
              placeholder="+237 679 603 180"
              value={form.phoneNumber}
              onChange={handleChange}
              disabled={isLoading || registrationSuccess}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="roleId">I want to join as a *</label>
            <select
              id="roleId"
              name="roleId"
              value={form.roleId}
              onChange={handleChange}
              disabled={isLoading || registrationSuccess}
            >
              {roleOptions.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name} - {role.description}
                </option>
              ))}
            </select>
            <span className="field-hint">You can change this later in your profile settings.</span>
          </div>
          
          <div className="form-group password-field">
            <label htmlFor="password">Password *</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Create a strong password"
                value={form.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                disabled={isLoading || registrationSuccess}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading || registrationSuccess}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'error' : ''}
              disabled={isLoading || registrationSuccess}
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>
          <button 
            type="submit" 
            className={`auth-button register-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading || registrationSuccess}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Creating Account...
              </>
            ) : registrationSuccess ? (
              'Registration Successful!'
            ) : (
              ' Create Account'
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
          <p className="home-footer-link">
            <Link to="/"> Return to Home Page</Link>
          </p>
        </div>
      </div>
    </div>
  );
}