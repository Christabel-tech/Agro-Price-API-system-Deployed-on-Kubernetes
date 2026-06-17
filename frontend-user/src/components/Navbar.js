// frontend-user/src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../services/api';
import './Navbar.css';

export default function Navbar({ onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isLoggedIn = !!localStorage.getItem('token');
  const roleId = localStorage.getItem('roleId');
  const isAdmin = roleId === '5';
  const isDeveloper = roleId === '4';
  const isTrader = roleId === '1';
  const isConsumer = roleId === '3';
  const isPolicymaker = roleId === '2';
  const userFirstName = localStorage.getItem('firstName') || 'User';
  const userRole = localStorage.getItem('roleName') || 'User';

  // Check if current page is public (no sidebar)
  const isPublicPage = ['/', '/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);

  // Notify parent when collapse state changes
  useEffect(() => {
    if (onToggle) {
      onToggle(isCollapsed);
    }
  }, [isCollapsed, onToggle]);

  // Don't render sidebar on public pages
  if (isPublicPage) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed');
    } finally {
      localStorage.clear();
      navigate('/login');
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobile = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button className="sidebar-toggle" onClick={toggleMobile}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      {/* Mobile Overlay */}
      <div 
        className={`sidebar-overlay ${isMobileOpen ? 'active' : ''}`} 
        onClick={closeMobile}
      ></div>

      {/* Sidebar */}
      <nav className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">🌾</span>
            {!isCollapsed && <span className="logo-text">Agro-Price</span>}
          </div>
          <button className="sidebar-collapse-btn" onClick={toggleSidebar}>
            {isCollapsed ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            )}
          </button>
        </div>

        {/* User Profile Section */}
        {isLoggedIn && !isCollapsed && (
          <div className="sidebar-user">
            <div className="user-avatar">
              {userFirstName.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <div className="user-name">{userFirstName}</div>
              <div className="user-role">{userRole}</div>
            </div>
          </div>
        )}

        {isLoggedIn && isCollapsed && (
          <div className="sidebar-user-collapsed">
            <div className="user-avatar-small">
              {userFirstName.charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        <div className="sidebar-menu">

          {isLoggedIn ? (
            <>
              {/* Dashboard - Everyone */}
              <Link to="/dashboard" className={`sidebar-link ${isActive('/dashboard')}`} onClick={closeMobile}>
                <span className="link-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6C3 4.34315 4.34315 3 6 3H18C19.6569 3 21 4.34315 21 6V18C21 19.6569 19.6569 21 18 21H6C4.34315 21 3 19.6569 3 18V6Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
                    <path d="M7 15L9 13L11 15L13 11L15 15L17 13L19 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 7H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </span>
                {!isCollapsed && <span className="link-text">Dashboard</span>}
              </Link>

              {/* Profile - Everyone */}
              <Link to="/profile" className={`sidebar-link ${isActive('/profile')}`} onClick={closeMobile}>
                <span className="link-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="8" r="5" stroke="currentColor" strokeWidth="2"/>
                    <path d="M20 21C20 17.134 16.4183 14 12 14C7.58172 14 4 17.134 4 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </span>
                {!isCollapsed && <span className="link-text">Profile</span>}
              </Link>

              {/* Change Password - Everyone */}
              <Link to="/change-password" className={`sidebar-link ${isActive('/change-password')}`} onClick={closeMobile}>
                <span className="link-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C16.9706 2 21 6.02944 21 11C21 13.3302 20.1257 15.4612 18.7107 17.0532L18.9497 17.2929C19.3402 17.6834 19.3402 18.3166 18.9497 18.7071L17.7071 19.9497C17.3166 20.3402 16.6834 20.3402 16.2929 19.9497L16.0532 19.7107C14.4612 21.1257 12.3302 22 10 22C5.02944 22 1 17.9706 1 13C1 8.02944 5.02944 4 10 4H12Z" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="10" cy="13" r="2" fill="currentColor"/>
                    <line x1="14" y1="9" x2="18" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="17" y1="12" x2="20" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </span>
                {!isCollapsed && <span className="link-text">Change Password</span>}
              </Link>

              {/* ==================== SET ALERT ==================== */}
              {/* Trader, Consumer, and Admin can view/Set Alerts */}
              {(isTrader || isConsumer || isAdmin) && (
                <Link to="/alerts" className={`sidebar-link ${isActive('/alerts')}`} onClick={closeMobile}>
                  <span className="link-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C10.6868 2 9.38642 2.25866 8.17317 2.7612C6.95991 3.26375 5.85752 4.00035 4.92893 4.92893C3.05357 6.8043 2 9.34784 2 12V17L1 21H23L22 17V12C22 9.34784 20.9464 6.8043 19.0711 4.92893C18.1425 4.00035 17.0401 3.26375 15.8268 2.7612C14.6136 2.25866 13.3132 2 12 2Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M9 21C9 21.7956 9.31607 22.5587 9.87868 23.1213C10.4413 23.6839 11.2044 24 12 24C12.7956 24 13.5587 23.6839 14.1213 23.1213C14.6839 22.5587 15 21.7956 15 21" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="2" fill="currentColor"/>
                    </svg>
                  </span>
                  {!isCollapsed && <span className="link-text">Set Alert</span>}
                </Link>
              )}

              {/* ==================== EXPORT PRICE DATA ==================== */}
              {/* Trader and Admin can export data */}
              {(isTrader || isAdmin) && (
                <Link to="/export" className={`sidebar-link ${isActive('/export')}`} onClick={closeMobile}>
                  <span className="link-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2"/>
                      <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2"/>
                      <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </span>
                  {!isCollapsed && <span className="link-text">Export Price Data</span>}
                </Link>
              )}

              {/* ==================== ANALYTICS ==================== */}
              {/* Policymaker and Admin can view analytics */}
              {(isPolicymaker || isAdmin) && (
                <Link to="/analytics" className={`sidebar-link ${isActive('/analytics')}`} onClick={closeMobile}>
                  <span className="link-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 12C21 13.1819 20.7672 14.3522 20.3149 15.4442C19.8626 16.5361 19.1997 17.5282 18.364 18.364C17.5282 19.1997 16.5361 19.8626 15.4442 20.3149C14.3522 20.7672 13.1819 21 12 21C10.8181 21 9.64778 20.7672 8.55585 20.3149C7.46392 19.8626 6.47177 19.1997 5.63604 18.364C4.80031 17.5282 4.13738 16.5361 3.68508 15.4442C3.23279 14.3522 3 13.1819 3 12" stroke="currentColor" strokeWidth="2"/>
                      <path d="M3 12L10 12" stroke="currentColor" strokeWidth="2"/>
                      <path d="M21 12H14" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="10" cy="12" r="2" fill="currentColor"/>
                      <circle cx="14" cy="12" r="2" fill="currentColor"/>
                      <line x1="10" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="2"/>
                      <line x1="12" y1="10" x2="12" y2="14" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </span>
                  {!isCollapsed && <span className="link-text">Analytics</span>}
                </Link>
              )}

              {/* ==================== API KEYS ==================== */}
              {/* Developer and Admin can manage API keys */}
              {(isDeveloper || isAdmin) && (
                <Link to="/api-keys" className={`sidebar-link ${isActive('/api-keys')}`} onClick={closeMobile}>
                  <span className="link-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 8C16 10.2091 14.2091 12 12 12C9.79086 12 8 10.2091 8 8C8 5.79086 9.79086 4 12 4C14.2091 4 16 5.79086 16 8Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M8 12L4 16M4 16L6 18M4 16L8 20L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 12L20 16M20 16L18 18M20 16L16 20L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  {!isCollapsed && <span className="link-text">API Keys</span>}
                </Link>
              )}

              {/* ==================== USER MANAGEMENT ==================== */}
              {/* Admin only */}
              {isAdmin && (
                <Link to="/admin" className={`sidebar-link admin-link ${isActive('/admin')}`} onClick={closeMobile}>
                  <span className="link-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M19.6224 10.3954C19.5779 10.2253 19.5355 10.0552 19.4953 9.88505C19.3252 9.15211 19.4053 8.5393 19.8554 8.10305L19.9151 8.04623C20.0908 7.87793 20.2334 7.67855 20.3367 7.45784C20.44 7.23714 20.502 7.00024 20.5197 6.75818C20.557 6.26981 20.4172 5.78939 20.1361 5.40891C19.8553 5.02875 19.465 4.77655 19.0289 4.70116L18.8709 4.67509C18.3435 4.58468 17.8859 4.32645 17.5627 3.95261C17.2395 3.57877 17.076 3.11646 17.1031 2.6513L17.1029 2.65752C17.1098 2.34437 17.0366 2.03457 16.8886 1.75435C16.7406 1.47413 16.5226 1.2334 16.2561 1.05298C15.7851 0.731225 15.2123 0.593819 14.6564 0.665945L14.4608 0.692659C13.9767 0.766734 13.4993 0.618989 13.1236 0.296504C12.7486 -0.0259718 12.5149 -0.475061 12.4758 -0.961673L12.4557 -1.21665C12.4356 -1.45903 12.3712 -1.69474 12.2645 -1.9104C12.1578 -2.12605 12.0109 -2.31606 11.833 -2.46905C11.4873 -2.76864 11.0403 -2.93883 10.5807 -2.94335C10.1211 -2.94787 9.67156 -2.78648 9.32105 -2.49356L9.20273 -2.39215C8.89116 -2.13171 8.50824 -1.96477 8.10337 -1.91214C7.69823 -1.85912 7.28822 -1.9228 6.92059 -2.09525L6.74691 -2.1768C6.30564 -2.37829 5.94102 -2.70521 5.70505 -3.11336C5.46908 -3.52151 5.3732 -3.98983 5.43005 -4.45483L5.44421 -4.5664C5.50484 -5.05324 5.39765 -5.53952 5.14613 -5.94918C4.89447 -6.35926 4.5151 -6.65985 4.07005 -6.79569L3.90645 -6.84276C3.45963 -6.97008 3.04085 -7.22568 2.70384 -7.5746C2.36683 -7.92351 2.12524 -8.3517 2.00686 -8.81974L1.9337 -9.10848C1.81403 -9.57861 1.88109 -10.0776 2.1231 -10.4963C2.36532 -10.9155 2.76161 -11.2168 3.23882 -11.3386L3.38374 -11.3757C3.86283 -11.4912 4.28041 -11.7699 4.56022 -12.1516C4.83968 -12.5337 4.96207 -12.9905 4.90232 -13.4343L4.89096 -13.5215C4.83435 -13.9885 4.92262 -14.4568 5.1389 -14.859C5.35519 -15.2612 5.68718 -15.5709 6.09342 -15.7359L6.27709 -15.8105C6.69664 -15.9725 7.04664 -16.2684 7.27064 -16.6493C7.4945 -17.0306 7.57708 -17.4741 7.50384 -17.9099L7.48601 -18.0058C7.42838 -18.3499 7.28756 -18.6763 7.07493 -18.9569C6.8623 -19.2375 6.58402 -19.4641 6.26254 -19.6186L6.12227 -19.6846C5.67371 -19.9139 5.30573 -20.2706 5.06834 -20.7088C4.83105 -21.147 4.73488 -21.6446 4.79185 -22.1352L4.80165 -22.2245" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M18.625 9.80273L20.8336 11.3831C21.3315 11.7576 21.5009 12.4628 21.2151 13.0135L20.1837 14.9219C19.8521 15.5246 19.1695 15.8255 18.5352 15.6359L16.8475 15.1462C16.2132 14.9564 15.7187 14.3844 15.6442 13.6981L15.5239 12.5997C15.4496 11.9134 15.8475 11.2343 16.4396 10.9356L17.8545 10.2206C18.1429 10.075 18.4371 10.0032 18.625 9.80273Z" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="14" cy="8" r="1.5" fill="currentColor"/>
                    </svg>
                  </span>
                  {!isCollapsed && <span className="link-text">User Management</span>}
                </Link>
              )}

              <div className="sidebar-divider"></div>

              {/* Logout */}
              <button onClick={() => { handleLogout(); closeMobile(); }} className="sidebar-link logout-link">
                <span className="link-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                {!isCollapsed && <span className="link-text">Logout</span>}
              </button>
            </>
          ) : (
            <>
              {/* Login */}
              <Link to="/login" className={`sidebar-link ${isActive('/login')}`} onClick={closeMobile}>
                <span className="link-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 17L15 12L10 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                {!isCollapsed && <span className="link-text">Login</span>}
              </Link>

              {/* Register */}
              <Link to="/register" className={`sidebar-link register-link ${isActive('/register')}`} onClick={closeMobile}>
                <span className="link-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </span>
                {!isCollapsed && <span className="link-text">Register</span>}
              </Link>
            </>
          )}
        </div>

        {!isCollapsed && (
          <div className="sidebar-footer">
          </div>
        )}
      </nav>
    </>
  );
}