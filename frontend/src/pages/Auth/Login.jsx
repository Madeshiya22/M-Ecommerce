import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  FiMail, FiLock, FiEye, FiEyeOff, FiLogIn
} from 'react-icons/fi';
import { FaGoogle, FaFacebookF, FaCrown, FaShieldAlt, FaTruck, FaCheckCircle, FaTag, FaHeadset } from 'react-icons/fa';
import { loginSuccess } from '../../store/slices/authSlice';
import { authService } from '../../api/authApi';
import toast from 'react-hot-toast';
import './Auth.css';
import authBg from '../../assets/auth-bg.jpg';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill required fields');

    setLoading(true);
    try {
      const res = await authService.login(form);
      const { token, ...user } = res.data.data;
      dispatch(loginSuccess({ user, token }));
      toast.success(`Welcome back, ${user.name}! ðŸŽ‰`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/auth/google`;
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Panel */}
        <div className="auth-left" style={{ 
          backgroundImage: `url(${authBg})`,
          backgroundColor: '#000',
          backgroundSize: 'contain',
          backgroundPosition: 'center'
        }}>
          {/* Logo and badges are baked into the background image */}
        </div>
        
        {/* Right Panel */}
        <div className="auth-right">
          <div className="auth-top-tag">
            <FaTag size={12} /> Welcome Back
          </div>
          
          <div className="auth-header">
            <div className="auth-title-wrap">
              <div className="auth-icon-circle"><FiLogIn size={24} /></div>
              <h1 className="auth-title">Login to <span className="auth-title-accent">Account</span></h1>
            </div>
            <p className="auth-subtitle">Welcome back! Please enter your details to login.</p>
          </div>
          
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-group">
              <label className="auth-label">Email Address</label>
              <div className="auth-input-wrap">
                <FiMail className="auth-input-icon" size={18} />
                <input
                  type="email"
                  className="auth-input"
                  placeholder="Enter your email address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="auth-group">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <FiLock className="auth-input-icon" size={18} />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button type="button" className="auth-input-action" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '10px 0' }}>
              <div className="auth-checkbox-wrap" style={{ margin: 0 }}>
                <input type="checkbox" className="auth-checkbox" />
                <span className="auth-checkbox-text">Remember me</span>
              </div>
              <Link to="#" className="auth-footer-link" style={{ fontSize: '0.85rem' }}>Forgot password?</Link>
            </div>
            
            <button type="submit" className="auth-btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : <><FiLogIn size={18} /> Login to Account</>}
            </button>
          </form>
          
          <div className="auth-divider">
            <span>or login with</span>
          </div>
          
          <div className="auth-social-wrap">
            <button className="auth-btn-social" type="button" onClick={handleGoogleLogin}>
              <FaGoogle color="#DB4437" /> Login with Google
            </button>
            <button className="auth-btn-social" type="button" onClick={() => toast('Facebook auth coming soon!')}>
              <FaFacebookF color="#4267B2" /> Login with Facebook
            </button>
          </div>
          
          <div className="auth-footer">
            Don't have an account? <Link to="/register" className="auth-footer-link">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

