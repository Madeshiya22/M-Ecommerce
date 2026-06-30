import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { FiHeart, FiEye, FiShoppingBag, FiStar } from 'react-icons/fi';
import { addToCart, openCart } from '../../../store/slices/cartSlice';
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
    toast.success(`${product.name} added to bag!`, { icon: 'ðŸ›ï¸' });
  };

  return (
    <motion.div className="product-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Link to={`/product/${product._id}`}>
        {/* Image */}
        <div className="product-card__image-wrap">
          <img src={imageUrl} alt={product.images?.[0]?.alt || product.name} loading="lazy" />

          {/* Product Tag */}
          {(product.isNewArrival || product.isBestSeller) && (
            <div className="product-image-tag">
              {product.isNewArrival ? 'NEW ARRIVAL' : 'BEST SELLER'}
            </div>
          )}

          {/* Hover actions */}
          <div className="product-card__actions">
            <button className="product-card__action-btn" title="Wishlist" onClick={e => { e.preventDefault(); e.stopPropagation(); toast('Added to wishlist â™¥'); }}>
              <FiHeart size={15} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="product-card__body">
          <div className="product-card__title-row">
            <h3 className="product-card__name">{product.name}</h3>
            <button 
              className="product-card__quick-add"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              title="Add to Bag"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Price Block */}
          <div className="product-card__price">
            <span className="product-card__price-current">â‚¹{price.toLocaleString('en-IN')}</span>
            {hasDiscount && (
              <span className="product-card__price-original">â‚¹{product.price.toLocaleString('en-IN')}</span>
            )}
          </div>

          {/* Best Price */}
          <div className="product-card__best-price">
            Best price â‚¹{bestPrice.toLocaleString('en-IN')}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
