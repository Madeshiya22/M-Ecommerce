import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../../../store/slices/themeSlice';
import { toggleCart } from '../../../store/slices/cartSlice';
import { FiUser } from 'react-icons/fi';
import ProfileDrawer from '../../user/ProfileDrawer/ProfileDrawer';
import './Navbar.css';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const authState = useSelector((state) => state.auth || {});
  const user = authState.user;

  const cartState = useSelector((state) => state.cart || {});
  const itemsList = cartState.items || cartState.cartItems || [];
  const cartCount = cartState.count || itemsList.reduce((acc, item) => acc + (item.qty || item.quantity || 1), 0);

  const themeState = useSelector((state) => state.theme || {});
  const theme = themeState.theme || 'light';

  // Sync theme with data-theme attribute on document.documentElement
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="navbar">
      {/* â”€â”€â”€ Top Moving Marquee Bar â”€â”€â”€ */}
      <div className="navbar__marquee">
        <div className="navbar__marquee-track">
          {Array(8).fill(0).map((_, i) => (
            <span key={i}>
              <span className="text-brown">M</span>-Collection &nbsp;&nbsp;â€¢&nbsp;&nbsp; CASUAL SHIRTS &nbsp;&nbsp;â€¢&nbsp;&nbsp; T-SHIRTS &nbsp;&nbsp;â€¢&nbsp;&nbsp; FORMALS &nbsp;&nbsp;&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>

      <div className="container navbar__inner">
        {/* Brand Logo */}
        <div className="navbar__brand">
          <Link to="/" className="navbar__logo">
            M
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="navbar__nav">
          <Link to="/products" className="navbar__link navbar__link--collection">
            <span className="text-brown">M</span>-Collection
          </Link>
          <div className="navbar__dropdown">
            <Link to="/products?type=tshirt" className="navbar__link">
              T-Shirts
            </Link>
            <div className="navbar__dropdown-menu">
              <Link to="/products?type=tshirt&fit=oversized" className="navbar__dropdown-item">Oversized</Link>
              <Link to="/products?type=tshirt&pattern=polo" className="navbar__dropdown-item">Polo</Link>
              <Link to="/products?type=tshirt&pattern=printed" className="navbar__dropdown-item">Printed</Link>
              <Link to="/products?type=tshirt&pattern=solid" className="navbar__dropdown-item">Plain</Link>
            </div>
          </div>
          <div className="navbar__dropdown">
            <Link to="/products?type=shirt" className="navbar__link">
              Shirts
            </Link>
            <div className="navbar__dropdown-menu">
              <Link to="/products?type=shirt&fit=relaxed" className="navbar__dropdown-item">Casual</Link>
              <Link to="/products?type=shirt&fit=slim" className="navbar__dropdown-item">Formal</Link>
              <Link to="/products?type=shirt&pattern=printed" className="navbar__dropdown-item">Printed</Link>
              <Link to="/products?type=shirt&fabric=denim" className="navbar__dropdown-item">Denim</Link>
            </div>
          </div>
          <Link to="/new-collection" className="navbar__link">
            New Collection
          </Link>
          <Link to="/about" className="navbar__link">
            About
          </Link>
        </nav>

        {/* Actions (Theme Toggle, Search, Cart, Profile/Login) */}
        <div className="navbar__actions">
          {/* Search Bar */}
          <div className={`navbar__search ${isSearchOpen ? 'navbar__search--open' : ''}`}>
            <button 
              className="navbar__action-btn navbar__search-btn" 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Toggle Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
            <form onSubmit={handleSearchSubmit} className="navbar__search-form">
              <input 
                type="text" 
                className="navbar__search-input" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
          <button
            className="navbar__action-btn"
            onClick={() => dispatch(toggleTheme())}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            )}
          </button>

          <button
            className="navbar__action-btn navbar__cart-btn"
            onClick={() => dispatch(toggleCart())}
            title="Open Cart"
            aria-label="Open Cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            {cartCount > 0 && <span className="navbar__cart-count">{cartCount}</span>}
          </button>

          {user ? (
            <button
              className="navbar__action-btn navbar__profile-btn"
              onClick={() => setIsProfileOpen(true)}
              title="Profile"
              aria-label="Profile"
            >
              <FiUser size={20} />
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/login" className="navbar__auth-btn" style={{ background: 'transparent', color: 'var(--clr-text)', border: '1px solid var(--clr-border)' }}>
                Login
              </Link>
              <Link to="/register" className="navbar__auth-btn">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Profile Drawer */}
      <ProfileDrawer 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />
    </header>
  );
};

export default Navbar;
