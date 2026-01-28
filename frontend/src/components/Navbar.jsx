import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';
import logo from '../assets/logo.png';

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
        setMobileMenuOpen(false);
        setDropdownOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    const publicLinks = [
        { path: '/', label: 'Home' },
        { path: '/collection', label: 'Collection' },
        { path: '/templates', label: 'Templates' },
        { path: '/about', label: 'About' },
        { path: '/contact', label: 'Contact Us' }
    ];

    const dropdownLinks = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/templates', label: 'Generate', icon: '✨' },
        { path: '/history', label: 'History', icon: '📜' }
    ];

    const adminLinks = [
        { path: '/admin', label: 'Dashboard' },
        { path: '/admin/templates', label: 'Templates' },
        { path: '/admin/users', label: 'Users' },
        { path: '/admin/orders', label: 'Orders' }
    ];

    return (
        <nav className="navbar">
            <div className="container">
                <div className="navbar-content">
                    <Link to="/" className="navbar-brand">
                        <img src={logo} alt="ImagineAI" className="brand-icon" />
                        <span className="brand-text">ImagineAI</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="navbar-menu desktop-menu">
                        {/* Show public links for all users */}
                        {!isAdmin && publicLinks.map(link => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {/* Admin links */}
                        {isAdmin && adminLinks.map(link => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {user ? (
                            <div className="user-menu" ref={dropdownRef}>
                                <div
                                    className={`user-profile ${dropdownOpen ? 'active' : ''}`}
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                >
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="user-avatar"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <div className="user-avatar-placeholder">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="user-name">{user.name?.split(' ')[0]}</span>
                                    <svg
                                        className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`}
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M6 9l6 6 6-6" />
                                    </svg>
                                </div>

                                {/* Dropdown Menu */}
                                {dropdownOpen && (
                                    <div className="dropdown-menu">
                                        <div className="dropdown-header">
                                            <span className="dropdown-user-name">{user.name}</span>
                                            <span className="dropdown-credits">⭐ {user.credits} credits</span>
                                        </div>
                                        <div className="dropdown-divider"></div>
                                        {dropdownLinks.map(link => (
                                            <Link
                                                key={link.path}
                                                to={link.path}
                                                className={`dropdown-item ${isActive(link.path) ? 'active' : ''}`}
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                <span className="dropdown-icon">{link.icon}</span>
                                                {link.label}
                                            </Link>
                                        ))}
                                        <div className="dropdown-divider"></div>
                                        <button onClick={handleLogout} className="dropdown-item dropdown-logout">
                                            <span className="dropdown-icon">🚪</span>
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="auth-buttons">
                                <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
                                <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="mobile-menu-toggle"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </span>
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="mobile-menu">
                        {!isAdmin && publicLinks.map(link => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`mobile-nav-link ${isActive(link.path) ? 'active' : ''}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {isAdmin && adminLinks.map(link => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`mobile-nav-link ${isActive(link.path) ? 'active' : ''}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {user && (
                            <>
                                <div className="mobile-divider"></div>
                                {dropdownLinks.map(link => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`mobile-nav-link ${isActive(link.path) ? 'active' : ''}`}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <span className="mobile-link-icon">{link.icon}</span>
                                        {link.label}
                                    </Link>
                                ))}
                            </>
                        )}

                        {user ? (
                            <div className="mobile-user-section">
                                <div className="mobile-user-info">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="user-avatar" referrerPolicy="no-referrer" />
                                    ) : (
                                        <div className="user-avatar-placeholder">{user.name?.charAt(0).toUpperCase()}</div>
                                    )}
                                    <div className="mobile-user-details">
                                        <span className="mobile-user-name">{user.name}</span>
                                        <span className="mobile-credits">⭐ {user.credits} credits</span>
                                    </div>
                                </div>
                                <button onClick={handleLogout} className="btn btn-logout w-full">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="mobile-auth-buttons">
                                <Link to="/login" className="btn btn-secondary w-full" onClick={() => setMobileMenuOpen(false)}>
                                    Login
                                </Link>
                                <Link to="/signup" className="btn btn-primary w-full" onClick={() => setMobileMenuOpen(false)}>
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
