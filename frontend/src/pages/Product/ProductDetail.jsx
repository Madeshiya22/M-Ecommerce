import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { FiShoppingBag, FiHeart, FiShare2, FiStar, FiChevronLeft, FiChevronRight, FiCheck, FiTruck, FiRotateCcw } from 'react-icons/fi';
import { productService } from '../../api/productApi';
import { addToCart, openCart } from '../../store/slices/cartSlice';
import toast from 'react-hot-toast';
import './ProductDetail.css';

const IMG_BASE = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000');

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [activeTab, setActiveTab] = useState('description');

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getById(id),
    select: (res) => res.data.data,
  });

  if (isLoading) return (
    <div className="pd-page">
      <div className="container pd-skeleton">
        <div className="skeleton pd-skeleton__img" />
        <div className="pd-skeleton__info">
          {[80, 50, 60, 35, 100].map((w, i) => (
            <div key={i} className="skeleton" style={{ height: i === 0 ? 40 : 16, width: `${w}%`, marginBottom: 16, borderRadius: 6 }} />
          ))}
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="pd-page">
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Product not found</h2>
        <Link to="/shop" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Shop</Link>
      </div>
    </div>
  );

  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice > 0;
  const discount = hasDiscount ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  const images = product.images?.length > 0
    ? product.images.map((img) => ({ url: `${IMG_BASE}${img.url}`, alt: img.alt || product.name }))
    : [{ url: `https://placehold.co/600x800/1e1e1e/444?text=${encodeURIComponent(product.name)}`, alt: product.name }];

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) return toast.error('Please select a size');
    dispatch(addToCart({ product, qty, size: selectedSize, color: selectedColor || product.colors?.[0]?.name || '' }));
    dispatch(openCart());
    toast.success(`Added to bag! ðŸ›ï¸`);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error('Please login to review');
    try {
      await productService.addReview(id, reviewForm);
      toast.success('Review added successfully!');
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add review');
    }
  };

  return (
    <main className="pd-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="pd-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to={`/shop?type=${product.type}`}>{product.type === 'tshirt' ? 'T-Shirts' : 'Shirts'}</Link>
          <span>/</span>
          <span>{product.category?.name}</span>
        </nav>

        <div className="pd-layout">
          {/* Gallery */}
          <div className="pd-gallery">
            <div className="pd-gallery__main">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImg}
                  src={images[activeImg]?.url}
                  alt={images[activeImg]?.alt}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                />
              </AnimatePresence>
              {images.length > 1 && (
                <>
                  <button className="pd-gallery__nav pd-gallery__nav--prev" onClick={() => setActiveImg((p) => (p - 1 + images.length) % images.length)}><FiChevronLeft /></button>
                  <button className="pd-gallery__nav pd-gallery__nav--next" onClick={() => setActiveImg((p) => (p + 1) % images.length)}><FiChevronRight /></button>
                </>
              )}
              {hasDiscount && <span className="pd-gallery__badge">-{discount}%</span>}
            </div>
            {images.length > 1 && (
              <div className="pd-gallery__thumbs">
                {images.map((img, i) => (
                  <button key={i} className={`pd-gallery__thumb ${i === activeImg ? 'pd-gallery__thumb--active' : ''}`} onClick={() => setActiveImg(i)}>
                    <img src={img.url} alt={img.alt} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="pd-info">
            {product.category && <p className="pd-info__category">{product.category.name}</p>}
            <h1 className="pd-info__name">{product.name}</h1>

            {/* Rating */}
            <div className="pd-info__rating">
              <div className="star-rating">
                {[1,2,3,4,5].map(s => <FiStar key={s} size={14} style={{ fill: s <= Math.round(product.rating) ? 'currentColor' : 'none' }} />)}
              </div>
              <span className="text-muted text-sm">{product.rating.toFixed(1)} ({product.numReviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="pd-info__price">
              <span className="pd-info__price-current">₹{price.toLocaleString('en-IN')}</span>
              {hasDiscount && (
                <>
                  <span className="pd-info__price-original">₹{product.price.toLocaleString('en-IN')}</span>
                  <span className="badge badge-success">{discount}% OFF</span>
                </>
              )}
            </div>

            {product.shortDescription && <p className="pd-info__short-desc">{product.shortDescription}</p>}

            <div className="divider" />

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div className="pd-option">
                <label className="pd-option__label">Color: <strong>{selectedColor || product.colors[0]?.name}</strong></label>
                <div className="pd-colors">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      className={`pd-color ${selectedColor === c.name || (!selectedColor && product.colors[0]?.name === c.name) ? 'pd-color--active' : ''}`}
                      style={{ background: c.hex }}
                      title={c.name}
                      onClick={() => setSelectedColor(c.name)}
                    >
                      {(selectedColor === c.name || (!selectedColor && product.colors[0]?.name === c.name)) && <FiCheck size={12} style={{ color: c.hex === '#FFFFFF' ? '#000' : '#fff' }} />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div className="pd-option">
                <label className="pd-option__label">Size: <strong>{selectedSize || 'Select'}</strong></label>
                <div className="pd-sizes">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`pd-size ${selectedSize === size ? 'pd-size--active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="pd-option">
              <label className="pd-option__label">Quantity</label>
              <div className="pd-qty">
                <button className="pd-qty__btn" onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
                <span>{qty}</span>
                <button className="pd-qty__btn" onClick={() => setQty(Math.min(product.stock, qty + 1))}>+</button>
                <span className="pd-stock">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pd-actions">
              <button className="btn btn-primary pd-add-btn" onClick={handleAddToCart} disabled={product.stock === 0}>
                <FiShoppingBag size={18} />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
              </button>
              <button className="btn btn-ghost pd-wishlist-btn" title="Add to Wishlist" onClick={() => toast('Added to wishlist â™¥')}>
                <FiHeart size={18} />
              </button>
              <button className="btn btn-ghost pd-share-btn" title="Share" onClick={() => { navigator.share?.({ title: product.name, url: window.location.href }); }}>
                <FiShare2 size={18} />
              </button>
            </div>

            {/* Delivery info */}
            <div className="pd-delivery">
              <div className="pd-delivery__item">
                <FiTruck size={16} />
                <span>Free delivery on orders above ₹999</span>
              </div>
              <div className="pd-delivery__item">
                <FiRotateCcw size={16} />
                <span>7-day hassle-free returns</span>
              </div>
            </div>

            {/* Details */}
            <div className="pd-details">
              {product.fabric && <div className="pd-details__row"><span>Fabric</span><span>{product.fabric}</span></div>}
              {product.fit && <div className="pd-details__row"><span>Fit</span><span className="capitalize">{product.fit}</span></div>}
              {product.gender && <div className="pd-details__row"><span>Gender</span><span className="capitalize">{product.gender}</span></div>}
              {product.sku && <div className="pd-details__row"><span>SKU</span><span>{product.sku}</span></div>}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="pd-tabs">
          <div className="pd-tabs__nav">
            {['description', 'reviews'].map((tab) => (
              <button key={tab} className={`pd-tabs__tab ${activeTab === tab ? 'pd-tabs__tab--active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab === 'description' ? 'Description' : `Reviews (${product.numReviews})`}
              </button>
            ))}
          </div>

          <div className="pd-tabs__content">
            {activeTab === 'description' && (
              <div className="pd-description">
                <p>{product.description}</p>
                {product.tags?.length > 0 && (
                  <div className="pd-tags">
                    {product.tags.map((tag) => <span key={tag} className="badge badge-ghost">{tag}</span>)}
                  </div>
                )}
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="pd-reviews">
                {product.reviews?.map((r) => (
                  <div key={r._id} className="pd-review">
                    <div className="pd-review__header">
                      <div className="pd-review__avatar">{r.name?.[0]?.toUpperCase()}</div>
                      <div>
                        <p className="pd-review__name">{r.name}</p>
                        <div className="star-rating">
                          {[1,2,3,4,5].map(s => <FiStar key={s} size={12} style={{ fill: s <= r.rating ? 'currentColor' : 'none' }} />)}
                        </div>
                      </div>
                    </div>
                    <p className="pd-review__comment">{r.comment}</p>
                  </div>
                ))}
                {isAuthenticated && (
                  <form className="pd-review-form" onSubmit={handleReview}>
                    <h4>Write a Review</h4>
                    <div className="form-group">
                      <label className="form-label">Rating</label>
                      <div className="pd-review-stars">
                        {[1,2,3,4,5].map(s => (
                          <button key={s} type="button" onClick={() => setReviewForm({...reviewForm, rating: s})} style={{ fontSize: '1.3rem', color: s <= reviewForm.rating ? 'var(--clr-gold)' : 'var(--clr-text-faint)' }}>â˜…</button>
                        ))}
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Comment</label>
                      <textarea className="form-input form-textarea" placeholder="Share your experience..." value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} required />
                    </div>
                    <button type="submit" className="btn btn-primary btn-sm">Submit Review</button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
