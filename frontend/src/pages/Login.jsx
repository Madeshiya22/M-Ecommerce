import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { loginSuccess } from '../redux/slices/authSlice';
import { authService } from '../services';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const res = await authService.login(form);
      const { token, ...user } = res.data.data;
      dispatch(loginSuccess({ user, token }));
      toast.success(`Welcome back, ${user.name}! 🎉`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-deco">
        <div className="auth-deco__circle auth-deco__circle--1" />
        <div className="auth-deco__circle auth-deco__circle--2" />
        <div className="auth-deco__text">MECOMMERCE</div>
      </div>
      <div className="auth-form-wrap">
        <motion.div className="auth-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="auth-card__header">
            <Link to="/" className="auth-logo">M<span>ECOMMERCE</span></Link>
            <h1 className="auth-card__title">Welcome back</h1>
            <p className="auth-card__sub">Sign in to your account to continue</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrap">
                <FiMail className="input-icon" size={16} />
                <input
                  type="email"
                  className="form-input input-with-icon"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrap">
                <FiLock className="input-icon" size={16} />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input input-with-icon input-with-action"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                />
                <button type="button" className="input-action" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
              {loading ? <span className="spinner" /> : <><span>Sign In</span><FiArrowRight /></>}
            </button>
          </form>

          <div className="auth-card__footer">
            <p>Don't have an account? <Link to="/register" className="auth-link">Create one</Link></p>
          </div>

          <div className="auth-divider"><span>or try demo</span></div>
          <div className="auth-demo">
            <button className="btn btn-ghost btn-sm" onClick={() => setForm({ email: 'admin@mecommerce.com', password: 'Admin@123' })}>
              Admin Demo
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setForm({ email: 'user@mecommerce.com', password: 'User@123' })}>
              User Demo
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
