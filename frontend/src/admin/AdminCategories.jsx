import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSearch, FiImage } from 'react-icons/fi';
import { categoryService } from '../services';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', type: 'tshirt', description: '', isActive: true, sortOrder: 0 });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => categoryService.getAll(),
    select: (res) => res.data.data,
  });

  const createMut = useMutation({
    mutationFn: (data) => categoryService.create(data),
    onSuccess: () => { toast.success('Category created!'); qc.invalidateQueries(['admin-categories']); closeModal(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Error creating category'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => categoryService.update(id, data),
    onSuccess: () => { toast.success('Category updated!'); qc.invalidateQueries(['admin-categories']); closeModal(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Error updating category'),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => categoryService.delete(id),
    onSuccess: () => { toast.success('Category deleted'); qc.invalidateQueries(['admin-categories']); },
    onError: (err) => toast.error(err.response?.data?.message || 'Error deleting category'),
  });

  const openCreate = () => { setEditing(null); setForm({ name: '', type: 'tshirt', description: '', isActive: true, sortOrder: 0 }); setImageFile(null); setImagePreview(''); setModalOpen(true); };
  const openEdit = (cat) => { setEditing(cat); setForm({ name: cat.name, type: cat.type, description: cat.description || '', isActive: cat.isActive, sortOrder: cat.sortOrder || 0 }); setImagePreview(cat.image ? `http://localhost:5000${cat.image}` : ''); setImageFile(null); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); setImageFile(null); setImagePreview(''); };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (imageFile) fd.append('image', imageFile);
    if (editing) updateMut.mutate({ id: editing._id, data: fd });
    else createMut.mutate(fd);
  };

  const filtered = categories?.filter(c => c.name.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <div>
      <div className="admin-section-header">
        <h1 className="admin-section-title">Categories</h1>
        <button className="btn btn-primary btn-sm" onClick={openCreate}><FiPlus size={14} /> Add Category</button>
      </div>

      <div className="admin-search">
        <FiSearch className="admin-search__icon" size={16} />
        <input className="form-input" placeholder="Search categories..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 40 }} />
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Type</th>
              <th>Description</th>
              <th>Sort</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({length:5}).map((_, i) => (
                <tr key={i}>
                  {Array.from({length:7}).map((_, j) => <td key={j}><div className="skeleton" style={{height:16,borderRadius:4}} /></td>)}
                </tr>
              ))
            ) : filtered.map((cat) => (
              <tr key={cat._id}>
                <td>
                  <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', background: 'var(--clr-surface-2)' }}>
                    {cat.image ? <img src={`http://localhost:5000${cat.image}`} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--clr-text-faint)', fontSize: '1.2rem' }}>📁</div>}
                  </div>
                </td>
                <td style={{ fontWeight: 600 }}>{cat.name}</td>
                <td><span className={`badge ${cat.type === 'tshirt' ? 'badge-primary' : 'badge-ghost'}`}>{cat.type === 'tshirt' ? 'T-Shirt' : 'Shirt'}</span></td>
                <td style={{ color: 'var(--clr-text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.description || '-'}</td>
                <td>{cat.sortOrder}</td>
                <td><span className={`badge ${cat.isActive ? 'badge-success' : 'badge-error'}`}>{cat.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>
                  <div className="admin-table__action-btns">
                    <button className="admin-action-btn admin-action-btn--edit" onClick={() => openEdit(cat)} title="Edit"><FiEdit2 size={14} /></button>
                    <button className="admin-action-btn admin-action-btn--delete" onClick={() => { if (window.confirm(`Delete "${cat.name}"?`)) deleteMut.mutate(cat._id); }} title="Delete"><FiTrash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && filtered.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--clr-text-muted)' }}>No categories found</div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="admin-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <div className="admin-modal__header">
                <h2 className="admin-modal__title">{editing ? 'Edit Category' : 'New Category'}</h2>
                <button className="admin-modal__close" onClick={closeModal}><FiX size={20} /></button>
              </div>

              <form className="admin-form" onSubmit={handleSubmit}>
                {/* Image upload */}
                <div className="form-group">
                  <label className="form-label">Category Image</label>
                  <div
                    className="admin-image-upload"
                    onClick={() => document.getElementById('cat-image').click()}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, background: 'var(--clr-surface-2)', border: '2px dashed var(--clr-border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', overflow: 'hidden', transition: 'border-color var(--transition-fast)' }}
                  >
                    {imagePreview ? <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ textAlign: 'center', color: 'var(--clr-text-faint)' }}><FiImage size={24} /><p style={{ marginTop: 8, fontSize: '0.8rem' }}>Click to upload image</p></div>}
                  </div>
                  <input id="cat-image" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                </div>

                <div className="admin-form-grid">
                  <div className="form-group">
                    <label className="form-label">Category Name *</label>
                    <input className="form-input" placeholder="e.g. Oversized Tees" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type *</label>
                    <select className="form-input form-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                      <option value="tshirt">T-Shirt</option>
                      <option value="shirt">Shirt</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input form-textarea" placeholder="Category description..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ minHeight: 80 }} />
                </div>

                <div className="admin-form-grid">
                  <div className="form-group">
                    <label className="form-label">Sort Order</label>
                    <input type="number" className="form-input" placeholder="0" value={form.sortOrder} onChange={e => setForm({...form, sortOrder: Number(e.target.value)})} />
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
                  <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={createMut.isLoading || updateMut.isLoading}>
                    {(createMut.isLoading || updateMut.isLoading) ? <span className="spinner" /> : editing ? 'Update Category' : 'Create Category'}
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
