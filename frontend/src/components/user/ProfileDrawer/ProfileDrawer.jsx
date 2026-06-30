import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { FiX, FiLogOut, FiUser, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { logout } from '../../../store/slices/authSlice';
import { authService } from '../../../api/authApi';
import './ProfileDrawer.css';

export default function ProfileDrawer({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    onClose();
    // Redirect handled by protected routes or we can use window.location
    window.location.href = '/login';
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error('Please fill in all password fields');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match');
    }
    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    try {
      setLoading(true);
      await authService.changePassword({ currentPassword, newPassword });
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ zIndex: 'calc(var(--z-modal) + 4)' }}
          />
          <motion.aside
            className="profile-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            {/* Header */}
            <div className="profile-drawer__header">
              <div className="profile-drawer__title">
                <FiUser size={20} />
                <span>Your Profile</span>
              </div>
              <button className="profile-drawer__close" onClick={onClose} aria-label="Close Profile">
                <FiX size={22} />
              </button>
            </div>

            {/* Content */}
            <div className="profile-drawer__content" data-lenis-prevent="true">
              {user && (
                <div className="profile-drawer__user-info">
                  <div className="profile-drawer__avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      user.name ? user.name.charAt(0) : 'U'
                    )}
                  </div>
                  <h3 className="profile-drawer__name">{user.name}</h3>
                  <p className="profile-drawer__email">{user.email}</p>
                </div>
              )}

              <div className="profile-drawer__section">
                <button 
                  className="profile-drawer__toggle-btn" 
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                >
                  Change Password
                  {showPasswordForm ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                <AnimatePresence>
                  {showPasswordForm && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <form onSubmit={handleChangePassword} className="profile-drawer__form" style={{ marginTop: '16px' }}>
                        <div className="profile-drawer__form-group">
                          <label>Current Password</label>
                          <input 
                            type="password" 
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                          />
                        </div>
                        <div className="profile-drawer__form-group">
                          <label>New Password</label>
                          <input 
                            type="password" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                          />
                        </div>
                        <div className="profile-drawer__form-group">
                          <label>Confirm New Password</label>
                          <input 
                            type="password" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                          />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                          {loading ? 'Updating...' : 'Update Password'}
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Footer */}
            <div className="profile-drawer__footer">
              <button className="profile-drawer__logout-btn" onClick={handleLogout}>
                <FiLogOut size={18} />
                Logout
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
