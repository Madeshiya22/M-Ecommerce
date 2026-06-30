import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiX, FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { closeCart, removeFromCart, updateQty } from '../../../store/slices/cartSlice';
import './CartDrawer.css';

export default function CartDrawer() {
  const dispatch = useDispatch();
  const { items, isOpen, subtotal, shipping, tax, total } = useSelector((s) => s.cart);

  const getPrice = (item) => item.discountPrice > 0 ? item.discountPrice : item.price;
  const getImageUrl = (item) => item.images?.[0]?.url ? `${import.meta.env.VITE_BACKEND_URL || (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000')}${item.images[0].url}` : '/placeholder.png';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(closeCart())}
          />
          <motion.aside
            className="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            {/* Header */}
            <div className="cart-drawer__header">
              <div className="cart-drawer__title">
                <FiShoppingBag size={20} />
                <span>Your Bag ({items.length})</span>
              </div>
              <button className="cart-drawer__close" onClick={() => dispatch(closeCart())}>
                <FiX size={22} />
              </button>
            </div>

            {/* Free shipping progress */}
            {subtotal < 999 && (
              <div className="cart-drawer__shipping-bar">
                <p className="cart-drawer__shipping-text">
                  Add <strong>₹{(999 - subtotal).toFixed(0)}</strong> more for free shipping!
                </p>
                <div className="cart-drawer__progress-track">
                  <div className="cart-drawer__progress-fill" style={{ width: `${Math.min((subtotal / 999) * 100, 100)}%` }} />
                </div>
              </div>
            )}
            {subtotal >= 999 && (
              <div className="cart-drawer__shipping-bar cart-drawer__shipping-bar--free">
                ðŸŽ‰ You've unlocked FREE shipping!
              </div>
            )}

            {/* Items */}
            <div className="cart-drawer__items">
              <AnimatePresence>
                {items.length === 0 ? (
                  <motion.div className="cart-drawer__empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <FiShoppingBag size={48} />
                    <p>Your bag is empty</p>
                    <Link to="/shop" className="btn btn-primary btn-sm" onClick={() => dispatch(closeCart())}>
                      Start Shopping
                    </Link>
                  </motion.div>
                ) : (
                  items.map((item, idx) => (
                    <motion.div
                      key={`${item._id}-${item.size}-${item.color}`}
                      className="cart-item"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <div className="cart-item__image">
                        <img src={getImageUrl(item)} alt={item.name} />
                      </div>
                      <div className="cart-item__info">
                        <div className="cart-item__header">
                          <p className="cart-item__name">{item.name}</p>
                          <button
                            className="cart-item__remove"
                            onClick={() => dispatch(removeFromCart({ productId: item._id, size: item.size, color: item.color }))}
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                        <div className="cart-item__meta">
                          {item.size && <span className="cart-item__tag">Size: {item.size}</span>}
                          {item.color && <span className="cart-item__tag">Color: {item.color}</span>}
                        </div>
                        <div className="cart-item__footer">
                          <div className="cart-item__qty">
                            <button
                              className="cart-item__qty-btn"
                              onClick={() => dispatch(updateQty({ productId: item._id, size: item.size, color: item.color, qty: item.qty - 1 }))}
                              disabled={item.qty <= 1}
                            >
                              <FiMinus size={12} />
                            </button>
                            <span>{item.qty}</span>
                            <button
                              className="cart-item__qty-btn"
                              onClick={() => dispatch(updateQty({ productId: item._id, size: item.size, color: item.color, qty: item.qty + 1 }))}
                            >
                              <FiPlus size={12} />
                            </button>
                          </div>
                          <p className="cart-item__price">₹{(getPrice(item) * item.qty).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="cart-drawer__footer">
                <div className="cart-drawer__summary">
                  <div className="cart-drawer__summary-row">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="cart-drawer__summary-row">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'text-success' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                  </div>
                  <div className="cart-drawer__summary-row">
                    <span>Tax (5%)</span>
                    <span>₹{tax.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="cart-drawer__summary-row cart-drawer__summary-row--total">
                    <span>Total</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <Link to="/checkout" className="btn btn-primary w-full btn-lg" onClick={() => dispatch(closeCart())}>
                  Proceed to Checkout
                </Link>
                <Link to="/cart" className="btn btn-ghost w-full" onClick={() => dispatch(closeCart())}>
                  View Full Cart
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
