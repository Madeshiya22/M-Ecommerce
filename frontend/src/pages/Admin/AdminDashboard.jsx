import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiBox, FiUsers, FiShoppingCart, FiDollarSign, FiArrowRight } from 'react-icons/fi';
import { userService } from '../../api/userApi';
import { orderService } from '../../api/orderApi';


const STATUS_COLORS = {
  pending: '#FAAD14', confirmed: '#1677FF', processing: '#722ED1',
  shipped: '#13C2C2', delivered: '#52C41A', cancelled: '#FF4D4F',
};

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => userService.getDashboard(),
    select: (res) => res.data.data,
  });

  const STATS = data ? [
    { label: 'Total Products', value: data.totalProducts, icon: FiBox, color: '#FF3C00', bg: 'rgba(255,60,0,0.12)' },
    { label: 'Total Users', value: data.totalUsers, icon: FiUsers, color: '#1677FF', bg: 'rgba(22,119,255,0.12)' },
    { label: 'Total Orders', value: data.totalOrders, icon: FiShoppingCart, color: '#722ED1', bg: 'rgba(114,46,209,0.12)' },
    { label: 'Total Revenue', value: `₹${(data.totalRevenue || 0).toLocaleString('en-IN')}`, icon: FiDollarSign, color: '#52C41A', bg: 'rgba(82,196,26,0.12)' },
  ] : [];

  if (isLoading) return (
    <div>
      <div className="admin-stats-grid">
        {Array.from({length:4}).map((_, i) => <div key={i} className="skeleton admin-stat-card" style={{height:120}} />)}
      </div>
    </div>
  );

  return (
    <div>
      <div className="admin-section-header">
        <h1 className="admin-section-title">Dashboard</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/admin/products" className="btn btn-primary btn-sm">+ Add Product</Link>
          <Link to="/admin/categories" className="btn btn-ghost btn-sm">+ Add Category</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid">
        {STATS.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="admin-stat-card">
            <div className="admin-stat-card__icon" style={{ background: bg, color }}><Icon size={20} /></div>
            <p className="admin-stat-card__label">{label}</p>
            <p className="admin-stat-card__value">{value}</p>
          </div>
        ))}
      </div>

      {/* Two-column */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Recent Orders */}
        <div className="admin-table-wrap">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recent Orders</h3>
            <Link to="/admin/orders" className="btn btn-ghost btn-sm">View All <FiArrowRight size={12} /></Link>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentOrders?.map((order) => (
                <tr key={order._id}>
                  <td>
                    <Link to={`/admin/orders`} style={{ color: 'var(--clr-primary)', fontWeight: 600, fontSize: '0.8rem' }}>
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td style={{ color: 'var(--clr-text-muted)', fontSize: '0.8rem' }}>{order.user?.name}</td>
                  <td style={{ fontWeight: 600 }}>₹{order.totalPrice?.toLocaleString('en-IN')}</td>
                  <td>
                    <span className="badge" style={{ background: `${STATUS_COLORS[order.status]}18`, color: STATUS_COLORS[order.status] }}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top Products */}
        <div className="admin-table-wrap">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Top Products</h3>
            <Link to="/admin/products" className="btn btn-ghost btn-sm">View All <FiArrowRight size={12} /></Link>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Sold</th>
              </tr>
            </thead>
            <tbody>
              {data?.topProducts?.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 44, background: 'var(--clr-surface-2)', borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
                        {p.images?.[0]?.url && <img src={`${import.meta.env.VITE_BACKEND_URL || (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000')}${p.images[0].url}`} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>₹{p.price?.toLocaleString('en-IN')}</td>
                  <td><span className="badge badge-success">{p.soldCount}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
