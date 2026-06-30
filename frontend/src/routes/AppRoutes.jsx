import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';

import Home from '../pages/Home/Home';
import Shop from '../pages/Category/Shop';
import NewCollection from '../pages/Category/NewCollection';
import ProductDetail from '../pages/Product/ProductDetail';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import OAuthCallback from '../pages/Auth/OAuthCallback';
import Checkout from '../pages/Checkout/Checkout';
import Orders from '../pages/Orders/Orders';

import AdminDashboard from '../pages/Admin/AdminDashboard';
import AdminProducts from '../pages/Admin/AdminProducts';
import AdminCategories from '../pages/Admin/AdminCategories';
import AdminOrders from '../pages/Admin/AdminOrders';
import AdminUsers from '../pages/Admin/AdminUsers';
import AdminNewCollection from '../pages/Admin/AdminNewCollection';

// Protected route
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((s) => s.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Admin route
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/shop" element={<MainLayout><Shop /></MainLayout>} />
        <Route path="/products" element={<MainLayout><Shop /></MainLayout>} />
        <Route path="/new-collection" element={<MainLayout><NewCollection /></MainLayout>} />
        <Route path="/product/:id" element={<MainLayout><ProductDetail /></MainLayout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />

        {/* Private routes */}
        <Route path="/checkout" element={<PrivateRoute><MainLayout><Checkout /></MainLayout></PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute><MainLayout><Orders /></MainLayout></PrivateRoute>} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="new-collection" element={<AdminNewCollection />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<MainLayout><div style={{ textAlign: 'center', padding: '6rem 0', paddingTop: '10rem' }}><h1 style={{ fontFamily: 'var(--font-display)', fontSize: '8rem', color: 'var(--clr-primary)' }}>404</h1><p style={{ color: 'var(--clr-text-muted)' }}>Page not found</p></div></MainLayout>} />
      </Routes>
    </BrowserRouter>
  );
}
