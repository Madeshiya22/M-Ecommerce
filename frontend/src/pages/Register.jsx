import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { loginSuccess } from '../redux/slices/authSlice';
import { authService } from '../services';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill all fields');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');

    setLoading(true);
    try {
      const res = await authService.register({ name: form.name, email: form.email, password: form.password });
      const { token, ...user } = res.data.data;
      dispatch(loginSuccess({ user, token }));
      toast.success(`Account created! Welcome, ${user.name}! 🎉`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
            <h1 className="auth-card__title">Create account</h1>
            <p className="auth-card__sub">Join us for premium fashion picks</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-wrap">
                <FiUser className="input-icon" size={16} />
                <input
                  type="text"
                  className="form-input input-with-icon"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>

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
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button type="button" className="input-action" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-wrap">
                <FiLock className="input-icon" size={16} />
                <input
                  type="password"
                  className="form-input input-with-icon"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
              {loading ? <span className="spinner" /> : <><span>Create Account</span><FiArrowRight /></>}
            </button>
          </form>

          <div className="auth-card__footer">
            <p>Already have an account? <Link to="/login" className="auth-link">Sign in</Link></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
