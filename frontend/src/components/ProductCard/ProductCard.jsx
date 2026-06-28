import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { FiHeart, FiEye, FiShoppingBag, FiStar } from 'react-icons/fi';
import { addToCart, openCart } from '../../redux/slices/cartSlice';
import toast from 'react-hot-toast';

const IMG_BASE = 'http://localhost:5000';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice > 0;
  const discount = hasDiscount ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;
  const bestPrice = Math.max(price - 100, Math.round(price * 0.95));
  const imageUrl = product.images?.[0]?.url ? `${IMG_BASE}${product.images[0].url}` : `https://placehold.co/400x520/e5e7eb/111827?text=${encodeURIComponent(product.name)}`;
  const defaultSize = product.sizes?.[1] || product.sizes?.[0] || '';
  const defaultColor = product.colors?.[0]?.name || '';

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({ product, qty: 1, size: defaultSize, color: defaultColor }));
    dispatch(openCart());
    toast.success(`${product.name} added to bag!`, { icon: '🛍️' });
  };

  return (
    <motion.div className="product-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Link to={`/product/${product._id}`}>
        {/* Image */}
        <div className="product-card__image-wrap">
          <img src={imageUrl} alt={product.images?.[0]?.alt || product.name} loading="lazy" />

          {/* Product Tag */}
          <div className="product-image-tag">
            {product.isNewArrival ? 'NEW ARRIVAL' : product.isBestSeller ? 'BEST SELLER' : 'TRENDING'}
          </div>

          {/* Hover actions */}
          <div className="product-card__actions">
            <button className="product-card__action-btn" title="Wishlist" onClick={e => { e.preventDefault(); e.stopPropagation(); toast('Added to wishlist ♥'); }}>
              <FiHeart size={15} />
            </button>
            <span className="product-card__action-btn" title="Quick View">
              <FiEye size={15} />
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="product-card__body">
          {/* Fabric & Fit Meta Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
            <span className="meta-tag-chip">100% COTTON</span>
            <span className="meta-tag-chip">{product.type === 'tshirt' ? 'OVERSIZED FIT' : 'RELAXED FIT'}</span>
          </div>

          <p className="product-card__category">
            {product.category?.name || product.type}
          </p>
          <h3 className="product-card__name">{product.name}</h3>

          {/* Rating */}
          {product.numReviews > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <div className="star-rating">
                {[1,2,3,4,5].map(s => (
                  <FiStar key={s} size={11} style={{ fill: s <= Math.round(product.rating) ? 'currentColor' : 'none' }} />
                ))}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--clr-text-faint)' }}>({product.numReviews})</span>
            </div>
          )}

          {/* Price Block */}
          <div className="product-card__price">
            <span className="product-card__price-current">₹{price.toLocaleString('en-IN')}</span>
            {hasDiscount && (
              <>
                <span className="product-card__price-original">₹{product.price.toLocaleString('en-IN')}</span>
                <span className="text-wrogn-green">({discount}% OFF)</span>
              </>
            )}
          </div>

          {/* Best Price Calculator Banner */}
          <div className="best-price-bg">
            <span className="best-price-text">
              Best price <span style={{ fontWeight: 800 }}>₹{bestPrice.toLocaleString('en-IN')}</span>
            </span>
          </div>
        </div>
      </Link>

      {/* Add to cart button */}
      <div style={{ padding: '0 16px 16px' }}>
        <button
          className="product-card__add-btn"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? 'Out of Stock' : (
            <><FiShoppingBag size={14} /> Add to Bag</>
          )}
        </button>
      </div>
    </motion.div>
  );
}
