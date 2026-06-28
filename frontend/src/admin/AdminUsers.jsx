import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { FiSearch, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { userService } from '../services';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'user', isActive: true });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: () => userService.getAll({ page, limit: 20, keyword: search || undefined }),
    select: (res) => res.data,
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => userService.update(id, data),
    onSuccess: () => { toast.success('User updated!'); qc.invalidateQueries(['admin-users']); setEditingUser(null); },
    onError: (err) => toast.error(err.response?.data?.message || 'Error'),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => userService.delete(id),
    onSuccess: () => { toast.success('User deleted'); qc.invalidateQueries(['admin-users']); },
    onError: (err) => toast.error(err.response?.data?.message || 'Error'),
  });

  const openEdit = (user) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, role: user.role, isActive: user.isActive });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMut.mutate({ id: editingUser._id, data: form });
  };

  const users = data?.data || [];
  const pagination = data?.pagination || {};

  return (
    <div>
      <div className="admin-section-header">
        <h1 className="admin-section-title">Users</h1>
        <span className="badge badge-ghost" style={{ fontSize: '0.8rem' }}>{pagination.total || 0} total users</span>
      </div>

      <div className="admin-search">
        <FiSearch className="admin-search__icon" size={16} />
        <input className="form-input" placeholder="Search by name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ paddingLeft: 40 }} />
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({length:10}).map((_, i) => (
                <tr key={i}>{Array.from({length:6}).map((_, j) => <td key={j}><div className="skeleton" style={{height:14,borderRadius:4}} /></td>)}</tr>
              ))
            ) : users.map((user) => (
              <tr key={user._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, background: user.role === 'admin' ? 'var(--clr-primary)' : 'var(--clr-surface-3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user.name}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--clr-text-muted)', fontSize: '0.82rem' }}>{user.email}</td>
                <td>
                  <span className={`badge ${user.role === 'admin' ? 'badge-gold' : 'badge-ghost'}`}>{user.role}</span>
                </td>
                <td>
                  <span className={`badge ${user.isActive ? 'badge-success' : 'badge-error'}`}>{user.isActive ? 'Active' : 'Inactive'}</span>
                </td>
                <td style={{ color: 'var(--clr-text-muted)', fontSize: '0.78rem' }}>
                  {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td>
                  <div className="admin-table__action-btns">
                    <button className="admin-action-btn admin-action-btn--edit" onClick={() => openEdit(user)}><FiEdit2 size={13} /></button>
                    <button className="admin-action-btn admin-action-btn--delete" onClick={() => { if (window.confirm(`Delete user "${user.name}"? This cannot be undone.`)) deleteMut.mutate(user._id); }}><FiTrash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && users.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--clr-text-muted)' }}>No users found</div>
        )}
        {pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: 16 }}>
            {Array.from({length: pagination.pages}, (_, i) => i + 1).map(p => (
              <button key={p} className={`shop-pagination__btn ${p === page ? 'shop-pagination__btn--active' : ''}`} onClick={() => setPage(p)}>{p}</button>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingUser && (
          <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="admin-modal" style={{ maxWidth: 440 }} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <div className="admin-modal__header">
                <h2 className="admin-modal__title">Edit User</h2>
                <button className="admin-modal__close" onClick={() => setEditingUser(null)}><FiX size={20} /></button>
              </div>
              <form className="admin-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                </div>
                <div className="admin-form-grid">
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select className="form-input form-select" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-input form-select" value={form.isActive} onChange={e => setForm({...form, isActive: e.target.value === 'true'})}>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setEditingUser(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={updateMut.isLoading}>
                    {updateMut.isLoading ? <span className="spinner" /> : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
