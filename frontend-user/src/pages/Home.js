import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="hero-icon">🌾</span>
              Agro-Price API System
            </h1>
            <p className="hero-subtitle">
              Real-time Agricultural Market Prices & Analytics Platform
            </p>
            <p className="hero-description">
              Empowering farmers, traders, and policymakers with accurate, 
              real-time market data to make informed decisions and maximize profits.
            </p>
            <div className="hero-buttons">
              <button onClick={() => navigate('/register')} className="btn-primary btn-large">
                Get Started
              </button>
              <button onClick={() => navigate('/login')} className="btn-secondary btn-large">
                Sign In
              </button>
            </div>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">5+</div>
              <div className="stat-label">Agricultural Products</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">10+</div>
              <div className="stat-label">Markets Covered</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">10+</div>
              <div className="stat-label">Daily Price Updates</div>
            </div>
          </div>
        </div>
        <div className="hero-image">
          <div className="floating-crops">
            <span className="crop-icon">🌽</span>
            <span className="crop-icon">🌾</span>
            <span className="crop-icon">🍫</span>
            <span className="crop-icon">🥜</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Choose Agro-Price API?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Real-Time Prices</h3>
            <p>Access live market prices from multiple locations across the country</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"></div>
            <h3>Price Analytics</h3>
            <p>View historical trends, price forecasts, and market insights</p>
          </div>
          <div className="feature-card">
            <h3>Role-Based Access</h3>
            <p>Tailored dashboards for Traders, Consumers, and Policymakers</p>
          </div>
          <div className="feature-card">
            <h3>API Integration</h3>
            <p>Seamless integration with your existing systems via REST API</p>
          </div>
          <div className="feature-card">
            <h3>Mobile Friendly</h3>
            <p>Access market data on the go with our responsive design</p>
          </div>
          <div className="feature-card">
            <h3>Secure & Reliable</h3>
            <p>Enterprise-grade security with JWT authentication</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Account</h3>
            <p>Sign up as a Trader, Consumer, or Policymaker</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>View Prices</h3>
            <p>Traders, Policymakers, Consumers view market data</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Analyze Trends</h3>
            <p>Get insights and make informed decisions</p>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="roles-section">
        <h2 className="section-title">Who We Serve</h2>
        <div className="roles-grid">
          <div className="role-card trader">
            <h3>Traders</h3>
            <p>extract, track market prices, and maximize profits</p>
            <ul>
              <li>✓ track real-time prices</li>
              <li>✓ Compare market rates</li>
              <li>✓ view historical prices</li>
            </ul>
          </div>
          <div className="role-card consumer">
            <h3>Consumers</h3>
            <p>Find best prices and make informed purchasing decisions</p>
            <ul>
              <li>✓ View current market prices</li>
              <li>✓ Compare across locations</li>
              <li>✓ Set price alerts</li>
            </ul>
          </div>
          <div className="role-card policymaker">
            <h3>Policymakers</h3>
            <p>Access analytics and reports for policy decisions</p>
            <ul>
              <li>✓ Export comprehensive reports</li>
              <li>✓ View market trends</li>
              <li>✓ Local price analysis</li>
            </ul>
          </div>
          <div className="role-card developer">
            <h3>Developers</h3>
            <p>Build on our API with full documentation</p>
            <ul>
              <li>✓ RESTful API access</li>
              <li>✓ API key management</li>
              <li>✓ Webhook integration</li>
            </ul>
          </div>
        </div>
      </section>
      <div className="role-card farmer">
      <h3>Farmers</h3>
      <p>Get market prices via SMS and make informed selling decisions</p>
      <ul>
        <li>✓ Check prices via SMS</li>
        <li>✓ Find best market to sell</li>
        <li>✓ No internet required</li>
        </ul>
        </div>

      {/* Farmer SMS Price Check Section - New */}
      <section className="sms-section">
        <div className="sms-container">
            <div className="sms-icon-wrapper">
            <span className="sms-icon">📱</span>
            <span className="sms-icon">💬</span>
            </div>
            <h2 className="section-title">Farmers: Check Prices via SMS</h2>
            <p className="sms-subtitle">No internet? No problem! Get real-time market prices directly on your phone</p>
            
            <div className="sms-features-grid">
            <div className="sms-feature">
                <div className="sms-feature-icon">📲</div>
                <h3>Simple SMS Command</h3>
                <p>Send a text message with product name</p>
                <div className="sms-example">
                <code>SEND MAIZE</code>
                </div>
            </div>
            
            <div className="sms-feature">
                <div className="sms-feature-icon">🔄</div>
                <h3>Instant Reply</h3>
                <p>Get current market prices within seconds</p>
                <div className="sms-example">
                <code>Maize: 1000 FCFA/kg</code>
                <code>Location: Marche Central</code>
                </div>
            </div>
            
            <div className="sms-feature">
                <div className="sms-feature-icon">📍</div>
                <h3>Local Markets</h3>
                <p>Prices from your nearest market</p>
                <div className="sms-example">
                <code>SEND MAIZE Douala</code>
                </div>
            </div>
            </div>

            <div className="sms-instructions">
            <h3>How to Use SMS Service</h3>
            <div className="steps-row">
                <div className="instruction-step">
                <div className="step-number">1</div>
                <p>Save our number: <strong>+237 679 603 180</strong></p>
                </div>
                <div className="instruction-step">
                <div className="step-number">2</div>
                <p>Text: <strong>PRICE [product name]</strong></p>
                </div>
                <div className="instruction-step">
                <div className="step-number">3</div>
                <p>Add location: <strong>PRICE MAIZE Marche Central</strong></p>
                </div>
                <div className="instruction-step">
                <div className="step-number">4</div>
                <p>Receive instant price updates! ✅</p>
                </div>
            </div>
            </div>

            <div className="sms-alert">
            <span className="alert-icon">📢</span>
            <div className="alert-content">
                <h4>SMS Service with small fee</h4>
                <p>Standard SMS rates apply. Available 24/7 for all farmers across the country.</p>
            </div>
            </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Transform Agriculture Trading?</h2>
          <p>Join thousands of users already benefiting from real-time market data</p>
          <button onClick={() => navigate('/register')} className="btn-primary btn-large">
            Get Started Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>🌾 Agro-Price API</h3>
            <p>Empowering agriculture through data</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Resources</h4>
            <ul>
              <li><a href="/api/docs">API Documentation</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/terms">Terms of Service</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>📧 info@agro-price.com</p>
            <p>📞 +237 679 603 180</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Agro-Price API System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}