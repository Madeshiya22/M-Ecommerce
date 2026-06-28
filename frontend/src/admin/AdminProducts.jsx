import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSearch, FiImage, FiUpload } from 'react-icons/fi';
import { productService, categoryService } from '../services';
import toast from 'react-hot-toast';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

const EMPTY_FORM = {
  name: '', description: '', shortDescription: '', price: '', discountPrice: '',
  category: '', type: 'tshirt', sizes: ['S','M','L','XL'], stock: '',
  fabric: '', fit: 'regular', gender: 'men', sku: '', tags: '',
  isFeatured: false, isNewArrival: false, isBestSeller: false, isActive: true,
};

export default function AdminProducts() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: () => productService.getAll({ page, limit: 15, keyword: search || undefined }),
    select: (res) => res.data,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories-all'],
    queryFn: () => categoryService.getAll(),
    select: (res) => res.data.data,
  });

  const createMut = useMutation({
    mutationFn: (data) => productService.create(data),
    onSuccess: () => { toast.success('Product created!'); qc.invalidateQueries(['admin-products']); closeModal(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Error'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => productService.update(id, data),
    onSuccess: () => { toast.success('Product updated!'); qc.invalidateQueries(['admin-products']); closeModal(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Error'),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => productService.delete(id),
    onSuccess: () => { toast.success('Product deleted'); qc.invalidateQueries(['admin-products']); },
    onError: (err) => toast.error(err.response?.data?.message || 'Error'),
  });

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setImageFiles([]); setImagePreviews([]); setModalOpen(true); };
  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name, description: product.description, shortDescription: product.shortDescription || '',
      price: product.price, discountPrice: product.discountPrice || '', category: product.category?._id || '',
      type: product.type, sizes: product.sizes || [], stock: product.stock, fabric: product.fabric || '',
      fit: product.fit || 'regular', gender: product.gender || 'men', sku: product.sku || '',
      tags: product.tags?.join(', ') || '',
      isFeatured: product.isFeatured, isNewArrival: product.isNewArrival, isBestSeller: product.isBestSeller,
      isActive: product.isActive,
    });
    setImageFiles([]); setImagePreviews(product.images?.map(img => `http://localhost:5000${img.url}`) || []);
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    setImagePreviews(files.map(f => URL.createObjectURL(f)));
  };

  const toggleSize = (size) => setForm(f => ({ ...f, sizes: f.sizes.includes(size) ? f.sizes.filter(s => s !== size) : [...f.sizes, size] }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'sizes') fd.append(k, JSON.stringify(v));
      else if (k === 'tags') fd.append(k, JSON.stringify(v.split(',').map(t => t.trim()).filter(Boolean)));
      else fd.append(k, v);
    });
    imageFiles.forEach(file => fd.append('images', file));
    if (editing) updateMut.mutate({ id: editing._id, data: fd });
    else createMut.mutate(fd);
  };

  const products = productsData?.data || [];
  const pagination = productsData?.pagination || {};

  return (
    <div>
      <div className="admin-section-header">
        <h1 className="admin-section-title">Products</h1>
        <button className="btn btn-primary btn-sm" onClick={openCreate}><FiPlus size={14} /> Add Product</button>
      </div>

      <div className="admin-search">
        <FiSearch className="admin-search__icon" size={16} />
        <input className="form-input" placeholder="Search products..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ paddingLeft: 40 }} />
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th><th>Name</th><th>Category</th><th>Type</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({length:8}).map((_, i) => (
                <tr key={i}>{Array.from({length:8}).map((_, j) => <td key={j}><div className="skeleton" style={{height:16,borderRadius:4}} /></td>)}</tr>
              ))
            ) : products.map((p) => {
              const price = p.discountPrice > 0 ? p.discountPrice : p.price;
              return (
                <tr key={p._id}>
                  <td>
                    <div style={{ width: 44, height: 56, borderRadius: 6, overflow: 'hidden', background: 'var(--clr-surface-2)' }}>
                      {p.images?.[0]?.url ? <img src={`http://localhost:5000${p.images[0].url}`} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>👕</div>}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</td>
                  <td style={{ color: 'var(--clr-text-muted)', fontSize: '0.82rem' }}>{p.category?.name || '-'}</td>
                  <td><span className={`badge ${p.type === 'tshirt' ? 'badge-primary' : 'badge-ghost'}`}>{p.type === 'tshirt' ? 'T-Shirt' : 'Shirt'}</span></td>
                  <td>
                    <div>
                      <span style={{ fontWeight: 700 }}>₹{price.toLocaleString('en-IN')}</span>
                      {p.discountPrice > 0 && <span style={{ fontSize: '0.72rem', color: 'var(--clr-text-faint)', marginLeft: 6, textDecoration: 'line-through' }}>₹{p.price.toLocaleString('en-IN')}</span>}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${p.stock > 10 ? 'badge-success' : p.stock > 0 ? 'badge-warning' : 'badge-error'}`}>{p.stock}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {p.isFeatured && <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>Featured</span>}
                      {p.isNewArrival && <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>New</span>}
                      <span className={`badge ${p.isActive ? 'badge-success' : 'badge-error'}`} style={{ fontSize: '0.65rem' }}>{p.isActive ? 'Active' : 'Off'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="admin-table__action-btns">
                      <button className="admin-action-btn admin-action-btn--edit" onClick={() => openEdit(p)}><FiEdit2 size={13} /></button>
                      <button className="admin-action-btn admin-action-btn--delete" onClick={() => { if (window.confirm(`Delete "${p.name}"?`)) deleteMut.mutate(p._id); }}><FiTrash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!isLoading && products.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--clr-text-muted)' }}>No products found</div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '16px' }}>
            {Array.from({length: pagination.pages}, (_, i) => i + 1).map(p => (
              <button key={p} className={`shop-pagination__btn ${p === page ? 'shop-pagination__btn--active' : ''}`} onClick={() => setPage(p)}>{p}</button>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="admin-modal" style={{ maxWidth: 720 }} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <div className="admin-modal__header">
                <h2 className="admin-modal__title">{editing ? 'Edit Product' : 'New Product'}</h2>
                <button className="admin-modal__close" onClick={closeModal}><FiX size={20} /></button>
              </div>

              <form className="admin-form" onSubmit={handleSubmit}>
                {/* Images */}
                <div className="form-group">
                  <label className="form-label">Product Images</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                    {imagePreviews.map((src, i) => (
                      <div key={i} style={{ width: 72, height: 90, borderRadius: 8, overflow: 'hidden', background: 'var(--clr-surface-2)', flexShrink: 0 }}>
                        <img src={src} alt={`img-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                    <label style={{ width: 72, height: 90, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, border: '2px dashed var(--clr-border)', borderRadius: 8, cursor: 'pointer', color: 'var(--clr-text-faint)', fontSize: '0.7rem', textAlign: 'center' }}>
                      <FiUpload size={18} />Upload
                      <input type="file" accept="image/*" multiple onChange={handleImagesChange} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>

                <div className="admin-form-grid">
                  <div className="form-group admin-form-grid--full">
                    <label className="form-label">Product Name *</label>
                    <input className="form-input" placeholder="Product name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select className="form-input form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required>
                      <option value="">Select category</option>
                      {categories?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type *</label>
                    <select className="form-input form-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                      <option value="tshirt">T-Shirt</option>
                      <option value="shirt">Shirt</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (₹) *</label>
                    <input type="number" className="form-input" placeholder="1299" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required min="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Discount Price (₹)</label>
                    <input type="number" className="form-input" placeholder="999 (leave 0 for none)" value={form.discountPrice} onChange={e => setForm({...form, discountPrice: e.target.value})} min="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock *</label>
                    <input type="number" className="form-input" placeholder="50" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required min="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">SKU</label>
                    <input className="form-input" placeholder="MEQ-001" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fabric</label>
                    <input className="form-input" placeholder="100% Cotton" value={form.fabric} onChange={e => setForm({...form, fabric: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fit</label>
                    <select className="form-input form-select" value={form.fit} onChange={e => setForm({...form, fit: e.target.value})}>
                      {['slim','regular','oversized','relaxed'].map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase()+f.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select className="form-input form-select" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                      {['men','women','unisex'].map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase()+g.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="form-group admin-form-grid--full">
                    <label className="form-label">Short Description</label>
                    <input className="form-input" placeholder="Brief summary" value={form.shortDescription} onChange={e => setForm({...form, shortDescription: e.target.value})} />
                  </div>
                  <div className="form-group admin-form-grid--full">
                    <label className="form-label">Full Description *</label>
                    <textarea className="form-input form-textarea" placeholder="Detailed product description..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
                  </div>
                  <div className="form-group admin-form-grid--full">
                    <label className="form-label">Tags (comma-separated)</label>
                    <input className="form-input" placeholder="casual, streetwear, cotton" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} />
                  </div>
                </div>

                {/* Sizes */}
                <div className="form-group">
                  <label className="form-label">Available Sizes</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {SIZES.map(size => (
                      <button key={size} type="button" className={`size-chip ${form.sizes.includes(size) ? 'size-chip--active' : ''}`} onClick={() => toggleSize(size)}>{size}</button>
                    ))}
                  </div>
                </div>

                {/* Flags */}
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  {[['isFeatured','Featured'],['isNewArrival','New Arrival'],['isBestSeller','Best Seller'],['isActive','Active']].map(([key, label]) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                      <input type="checkbox" checked={form[key]} onChange={e => setForm({...form, [key]: e.target.checked})} style={{ accentColor: 'var(--clr-primary)', width: 16, height: 16 }} />
                      {label}
                    </label>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={createMut.isLoading || updateMut.isLoading}>
                    {(createMut.isLoading || updateMut.isLoading) ? <span className="spinner" /> : editing ? 'Update Product' : 'Create Product'}
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
