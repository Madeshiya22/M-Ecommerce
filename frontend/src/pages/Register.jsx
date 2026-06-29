import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useGoogleLogin } from '@react-oauth/google';
import { 
  FiMail, FiLock, FiUser, FiEye, FiEyeOff, 
  FiUserPlus, FiPhone 
} from 'react-icons/fi';
import { FaGoogle, FaFacebookF, FaCrown, FaShieldAlt, FaTruck, FaCheckCircle, FaTag, FaHeadset } from 'react-icons/fa';
import { loginSuccess } from '../redux/slices/authSlice';
import { authService } from '../services';
import toast from 'react-hot-toast';
import './Auth.css';
import authBg from '../assets/AUTH-CREATE.png';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ 
    name: '', email: '', password: '', confirmPassword: '', phone: '' 
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfPass, setShowConfPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill required fields');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');

    setLoading(true);
    try {
      // Assuming phone might be supported in backend or just ignored if not
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

  const googleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      try {
        const res = await authService.googleLogin(tokenResponse.access_token);
        const { token, ...user } = res.data.data;
        dispatch(loginSuccess({ user, token }));
        toast.success(`Welcome, ${user.name}! 🎉`);
        navigate('/');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Google sign-up failed');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => toast.error('Google sign-in was cancelled or failed'),
  });

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Panel */}
        <div className="auth-left" style={{ 
          backgroundImage: `url(${authBg})`,
          backgroundColor: '#dcd3cb', /* Matches the image background */
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
          {/* Logo and badges are baked into the background image */}
        </div>
        
        {/* Right Panel */}
        <div className="auth-right">
          <div className="auth-top-tag">
            <FaTag size={12} /> Join M-Collection
          </div>
          
          <div className="auth-header">
            <div className="auth-title-wrap">
              <div className="auth-icon-circle"><FiUserPlus size={24} /></div>
              <h1 className="auth-title">Create <span className="auth-title-accent">Account</span></h1>
            </div>
            <p className="auth-subtitle">Join M-Collection and explore our exclusive collection.</p>
          </div>
          
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-group">
              <label className="auth-label">Full Name</label>
              <div className="auth-input-wrap">
                <FiUser className="auth-input-icon" size={18} />
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            </div>
            
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
                  placeholder="Create a password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button type="button" className="auth-input-action" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>
            
            <div className="auth-group">
              <label className="auth-label">Confirm Password</label>
              <div className="auth-input-wrap">
                <FiLock className="auth-input-icon" size={18} />
                <input
                  type={showConfPass ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                />
                <button type="button" className="auth-input-action" onClick={() => setShowConfPass(!showConfPass)}>
                  {showConfPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>
            
            <div className="auth-group">
              <label className="auth-label">Phone Number (Optional)</label>
              <div className="auth-input-wrap">
                <FiPhone className="auth-input-icon" size={18} />
                <input
                  type="tel"
                  className="auth-input"
                  placeholder="Enter your phone number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
            
            <div className="auth-checkbox-wrap">
              <input type="checkbox" className="auth-checkbox" required />
              <span className="auth-checkbox-text">I agree to the <b>Terms & Conditions</b> and <b>Privacy Policy</b></span>
            </div>
            
            <button type="submit" className="auth-btn-primary" disabled={loading}>
              {loading ? 'Creating Account...' : <><FiUserPlus size={18} /> Create Account</>}
            </button>
          </form>
          
          <div className="auth-divider">
            <span>or sign up with</span>
          </div>
          
          <div className="auth-social-wrap">
            <button className="auth-btn-social" type="button" onClick={() => googleSignup()} disabled={googleLoading}>
              <FaGoogle color="#DB4437" /> {googleLoading ? 'Connecting...' : 'Sign up with Google'}
            </button>
            <button className="auth-btn-social" type="button" onClick={() => toast('Facebook auth coming soon!')}>
              <FaFacebookF color="#4267B2" /> Sign up with Facebook
            </button>
          </div>
          
          <div className="auth-footer">
            Already have an account? <Link to="/login" className="auth-footer-link">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
