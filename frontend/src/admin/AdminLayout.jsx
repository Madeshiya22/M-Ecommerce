import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiBox, FiTag, FiShoppingCart, FiUsers, FiMenu, FiX,
  FiLogOut, FiExternalLink, FiChevronRight
} from 'react-icons/fi';
import { logout } from '../redux/slices/authSlice';
import './AdminLayout.css';

const NAV_ITEMS = [
  { icon: FiGrid, label: 'Dashboard', to: '/admin' },
  { icon: FiBox, label: 'Products', to: '/admin/products' },
  { icon: FiTag, label: 'Categories', to: '/admin/categories' },
  { icon: FiShoppingCart, label: 'Orders', to: '/admin/orders' },
  { icon: FiUsers, label: 'Users', to: '/admin/users' },
];

export default function AdminLayout() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? '' : 'admin-sidebar--collapsed'}`}>
        <div className="admin-sidebar__header">
          <Link to="/" className="admin-logo">
            <span className="admin-logo__m">M</span>
            {sidebarOpen && <span className="admin-logo__text">Admin</span>}
          </Link>
          <button className="admin-sidebar__toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map(({ icon: Icon, label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) => `admin-nav__item ${isActive ? 'admin-nav__item--active' : ''}`}
            >
              <Icon size={18} />
              {sidebarOpen && <span>{label}</span>}
              {sidebarOpen && <FiChevronRight size={14} className="admin-nav__arrow" />}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          {sidebarOpen && (
            <div className="admin-user">
              <div className="admin-user__avatar">{user?.name?.[0]?.toUpperCase()}</div>
              <div>
                <p className="admin-user__name">{user?.name}</p>
                <p className="admin-user__role">Administrator</p>
              </div>
            </div>
          )}
          <div className="admin-sidebar__footer-actions">
            <Link to="/" target="_blank" className="admin-icon-btn" title="View Store"><FiExternalLink size={16} /></Link>
            <button className="admin-icon-btn admin-icon-btn--danger" title="Logout" onClick={handleLogout}><FiLogOut size={16} /></button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <div className="admin-topbar">
          <div className="admin-topbar__breadcrumb">Admin Panel</div>
          <div className="admin-topbar__right">
            <span className="badge badge-success">● Live</span>
          </div>
        </div>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
