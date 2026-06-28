import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { FiSearch, FiEdit2, FiX } from 'react-icons/fi';
import { orderService } from '../services';
import toast from 'react-hot-toast';

const ORDER_STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled','returned'];
const STATUS_COLORS = {
  pending: '#FAAD14', confirmed: '#1677FF', processing: '#722ED1',
  shipped: '#13C2C2', delivered: '#52C41A', cancelled: '#FF4D4F', returned: '#FF7A45',
};

export default function AdminOrders() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [editingOrder, setEditingOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, statusFilter],
    queryFn: () => orderService.getAll({ page, limit: 20, status: statusFilter || undefined }),
    select: (res) => res.data,
  });

  const updateMut = useMutation({
    mutationFn: ({ id, status, note }) => orderService.updateStatus(id, { status, note }),
    onSuccess: () => { toast.success('Order status updated!'); qc.invalidateQueries(['admin-orders']); setEditingOrder(null); },
    onError: (err) => toast.error(err.response?.data?.message || 'Error'),
  });

  const orders = data?.data || [];
  const pagination = data?.pagination || {};

  return (
    <div>
      <div className="admin-section-header">
        <h1 className="admin-section-title">Orders</h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['', ...ORDER_STATUSES].map(s => (
            <button
              key={s}
              className={`filter-chip ${statusFilter === s ? 'filter-chip--active' : ''}`}
              style={{ fontSize: '0.72rem' }}
              onClick={() => { setStatusFilter(s); setPage(1); }}
            >
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order #</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({length:10}).map((_, i) => (
                <tr key={i}>{Array.from({length:8}).map((_, j) => <td key={j}><div className="skeleton" style={{height:14,borderRadius:4}} /></td>)}</tr>
              ))
            ) : orders.map((order) => (
              <tr key={order._id}>
                <td style={{ fontWeight: 700, color: 'var(--clr-primary)', fontSize: '0.82rem' }}>{order.orderNumber}</td>
                <td>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{order.user?.name}</p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)' }}>{order.user?.email}</p>
                  </div>
                </td>
                <td style={{ color: 'var(--clr-text-muted)', fontSize: '0.82rem' }}>{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</td>
                <td style={{ fontWeight: 700 }}>₹{order.totalPrice?.toLocaleString('en-IN')}</td>
                <td><span className="badge badge-ghost" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>{order.paymentMethod}</span></td>
                <td>
                  <span className="badge" style={{ background: `${STATUS_COLORS[order.status]}18`, color: STATUS_COLORS[order.status], fontSize: '0.68rem' }}>
                    {order.status}
                  </span>
                </td>
                <td style={{ color: 'var(--clr-text-muted)', fontSize: '0.78rem' }}>
                  {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </td>
                <td>
                  <button className="admin-action-btn admin-action-btn--edit" onClick={() => { setEditingOrder(order); setNewStatus(order.status); setNote(''); }}>
                    <FiEdit2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && orders.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--clr-text-muted)' }}>No orders found</div>
        )}
        {pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: 16 }}>
            {Array.from({length: pagination.pages}, (_, i) => i + 1).map(p => (
              <button key={p} className={`shop-pagination__btn ${p === page ? 'shop-pagination__btn--active' : ''}`} onClick={() => setPage(p)}>{p}</button>
            ))}
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      <AnimatePresence>
        {editingOrder && (
          <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="admin-modal" style={{ maxWidth: 480 }} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <div className="admin-modal__header">
                <h2 className="admin-modal__title">Update Order</h2>
                <button className="admin-modal__close" onClick={() => setEditingOrder(null)}><FiX size={20} /></button>
              </div>

              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)', marginBottom: 16 }}>
                  Order <strong style={{ color: 'var(--clr-primary)' }}>{editingOrder.orderNumber}</strong> — {editingOrder.user?.name}
                </p>

                {/* Order items summary */}
                <div style={{ background: 'var(--clr-surface-2)', borderRadius: 8, padding: 12, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {editingOrder.items?.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--clr-text-muted)' }}>{item.name} × {item.qty}</span>
                      <span style={{ fontWeight: 600 }}>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: 8, marginTop: 4, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                    <span>Total</span>
                    <span>₹{editingOrder.totalPrice?.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Update Status</label>
                  <select className="form-input form-select" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label">Note (optional)</label>
                  <textarea className="form-input" placeholder="e.g. Shipped via Blue Dart, tracking #XYZ" value={note} onChange={e => setNote(e.target.value)} style={{ minHeight: 80 }} />
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button className="btn btn-ghost" onClick={() => setEditingOrder(null)}>Cancel</button>
                  <button
                    className="btn btn-primary"
                    onClick={() => updateMut.mutate({ id: editingOrder._id, status: newStatus, note })}
                    disabled={updateMut.isLoading}
                  >
                    {updateMut.isLoading ? <span className="spinner" /> : 'Update Status'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
