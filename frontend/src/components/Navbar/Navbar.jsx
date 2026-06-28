import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { toggleTheme } from '../../redux/slices/themeSlice';
import { toggleCart } from '../../redux/slices/cartSlice';
import './Navbar.css';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
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

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="navbar">
      {/* ─── Top Moving Marquee Bar ─── */}
      <div className="navbar__marquee">
        <div className="navbar__marquee-track">
          <span><span className="text-brown">M</span>-COLLECTION X ICONS</span>
          <span><span className="text-brown">M</span>-COLLECTION X ICONS</span>
          <span><span className="text-brown">M</span>-COLLECTION X ICONS</span>
          <span><span className="text-brown">M</span>-COLLECTION X ICONS</span>
          <span><span className="text-brown">M</span>-COLLECTION X ICONS</span>
          <span><span className="text-brown">M</span>-COLLECTION X ICONS</span>
          <span><span className="text-brown">M</span>-COLLECTION X ICONS</span>
          <span><span className="text-brown">M</span>-COLLECTION X ICONS</span>
          <span><span className="text-brown">M</span>-COLLECTION X ICONS</span>
          <span><span className="text-brown">M</span>-COLLECTION X ICONS</span>
          <span><span className="text-brown">M</span>-COLLECTION X ICONS</span>
          <span><span className="text-brown">M</span>-COLLECTION X ICONS</span>
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
            <Link to="/products?category=tshirt" className="navbar__link">
              T-Shirts
            </Link>
            <div className="navbar__dropdown-menu">
              <Link to="/products?category=tshirt&style=oversized" className="navbar__dropdown-item">Oversized</Link>
              <Link to="/products?category=tshirt&style=polo" className="navbar__dropdown-item">Polo</Link>
              <Link to="/products?category=tshirt&style=printed" className="navbar__dropdown-item">Printed</Link>
              <Link to="/products?category=tshirt&style=plain" className="navbar__dropdown-item">Plain</Link>
            </div>
          </div>
          <div className="navbar__dropdown">
            <Link to="/products?category=shirt" className="navbar__link">
              Shirts
            </Link>
            <div className="navbar__dropdown-menu">
              <Link to="/products?category=shirt&style=casual" className="navbar__dropdown-item">Casual</Link>
              <Link to="/products?category=shirt&style=formal" className="navbar__dropdown-item">Formal</Link>
              <Link to="/products?category=shirt&style=printed" className="navbar__dropdown-item">Printed</Link>
              <Link to="/products?category=shirt&style=denim" className="navbar__dropdown-item">Denim</Link>
            </div>
          </div>
          <Link to="/about" className="navbar__link">
            About
          </Link>
        </nav>

        {/* Actions (Theme Toggle, Cart, Profile/Login) */}
        <div className="navbar__actions">
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
            <div className="navbar__user">
              <Link to="/profile" className="navbar__link navbar__link--user">
                {user.name}
              </Link>
              <button className="navbar__auth-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="navbar__auth-btn">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
