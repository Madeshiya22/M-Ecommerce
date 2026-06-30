import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/slices/authSlice';
import { authService } from '../../api/authApi';
import toast from 'react-hot-toast';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (error) {
      toast.error('Google authentication failed');
      navigate('/login', { replace: true });
      return;
    }

    if (!token) {
      toast.error('Authentication token missing');
      navigate('/login', { replace: true });
      return;
    }

    const processAuth = async () => {
      try {
        // Temporarily store token in localStorage so api.js interceptor picks it up
        localStorage.setItem('token', token);
        
        // Fetch user profile using the new token
        const res = await authService.getMe();
        const user = res.data.data;
        
        dispatch(loginSuccess({ user, token }));
        toast.success(`Welcome back, ${user.name}! ðŸŽ‰`);
        navigate('/', { replace: true });
      } catch (err) {
        toast.error('Failed to complete Google authentication');
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    processAuth();
  }, [location, navigate, dispatch]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
      {loading ? (
        <>
          <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--clr-border)', borderTopColor: 'var(--clr-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '1rem', color: 'var(--clr-text-muted)' }}>Completing sign in...</p>
        </>
      ) : null}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
