import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FiMapPin, FiPhone, FiUser, FiCheck } from 'react-icons/fi';
import { orderService } from '../../api/orderApi';
import { clearCart } from '../../store/slices/cartSlice';
import toast from 'react-hot-toast';
import './Checkout.css';

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, subtotal, shipping, tax, total } = useSelector((s) => s.cart);
  const { isAuthenticated } = useSelector((s) => s.auth);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [address, setAddress] = useState({
    name: '', phone: '', street: '', city: '', state: '', pincode: '', country: 'India',
  });

  if (!isAuthenticated) return (
    <div className="checkout-page">
      <div className="container" style={{ textAlign: 'center', padding: '6rem 0' }}>
        <h2>Please sign in to checkout</h2>
        <Link to="/login" state={{ from: { pathname: '/checkout' } }} className="btn btn-primary" style={{ marginTop: '1rem' }}>Sign In</Link>
      </div>
    </div>
  );

  if (items.length === 0) return (
    <div className="checkout-page">
      <div className="container" style={{ textAlign: 'center', padding: '6rem 0' }}>
        <h2>Your cart is empty</h2>
        <Link to="/shop" className="btn btn-primary" style={{ marginTop: '1rem' }}>Continue Shopping</Link>
      </div>
    </div>
  );

  const IMG_BASE = 'http://localhost:5000';
  const getImg = (item) => item.images?.[0]?.url ? `${IMG_BASE}${item.images[0].url}` : '';

  const handlePlaceOrder = async () => {
    if (!address.name || !address.phone || !address.street || !address.city || !address.state || !address.pincode) {
      return toast.error('Please fill all address fields');
    }
    setLoading(true);
    try {
      const orderData = {
        items: items.map(item => ({
          product: item._id,
          qty: item.qty,
          size: item.size,
          color: item.color,
        })),
        shippingAddress: address,
        paymentMethod,
      };
      const res = await orderService.create(orderData);
      dispatch(clearCart());
      toast.success('Order placed successfully! ðŸŽ‰');
      navigate(`/orders/${res.data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="checkout-page">
      <div className="container">
        <h1 className="checkout-title">Checkout</h1>

        {/* Steps */}
        <div className="checkout-steps">
          {['Address', 'Payment', 'Review'].map((s, i) => (
            <div key={s} className={`checkout-step ${step > i + 1 ? 'checkout-step--done' : ''} ${step === i + 1 ? 'checkout-step--active' : ''}`}>
              <div className="checkout-step__num">
                {step > i + 1 ? <FiCheck size={14} /> : i + 1}
              </div>
              <span>{s}</span>
              {i < 2 && <div className="checkout-step__line" />}
            </div>
          ))}
        </div>

        <div className="checkout-layout">
          {/* Left */}
          <div className="checkout-main">
            {/* Step 1: Address */}
            {step === 1 && (
              <motion.div className="checkout-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="checkout-card__title"><FiMapPin size={18} /> Delivery Address</h2>
                <div className="checkout-address-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" placeholder="Your full name" value={address.name} onChange={e => setAddress({...address, name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input className="form-input" placeholder="10-digit phone number" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} />
                  </div>
                  <div className="form-group checkout-address-grid--full">
                    <label className="form-label">Street Address</label>
                    <input className="form-input" placeholder="House no., street, area" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input className="form-input" placeholder="City" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input className="form-input" placeholder="State" value={address.state} onChange={e => setAddress({...address, state: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">PIN Code</label>
                    <input className="form-input" placeholder="6-digit PIN" value={address.pincode} onChange={e => setAddress({...address, pincode: e.target.value})} />
                  </div>
                </div>
                <button className="btn btn-primary" onClick={() => setStep(2)}>Continue to Payment</button>
              </motion.div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <motion.div className="checkout-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="checkout-card__title">Payment Method</h2>
                <div className="payment-options">
                  {[
                    { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive', icon: 'ðŸ’µ' },
                    { id: 'online', label: 'Pay Online (Mock)', desc: 'Cards, UPI, Wallets', icon: 'ðŸ’³' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      className={`payment-option ${paymentMethod === opt.id ? 'payment-option--active' : ''}`}
                      onClick={() => setPaymentMethod(opt.id)}
                    >
                      <span className="payment-option__icon">{opt.icon}</span>
                      <div>
                        <p className="payment-option__label">{opt.label}</p>
                        <p className="payment-option__desc">{opt.desc}</p>
                      </div>
                      <div className="payment-option__radio">{paymentMethod === opt.id && <div className="payment-option__radio-dot" />}</div>
                    </button>
                  ))}
                </div>
                <div className="checkout-nav">
                  <button className="btn btn-ghost" onClick={() => setStep(1)}>â† Back</button>
                  <button className="btn btn-primary" onClick={() => setStep(3)}>Review Order</button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <motion.div className="checkout-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="checkout-card__title">Review Order</h2>
                <div className="review-section">
                  <h3 className="review-section__title">Delivery Address</h3>
                  <p className="review-section__text">{address.name} â€¢ {address.phone}</p>
                  <p className="review-section__text">{address.street}, {address.city}, {address.state} - {address.pincode}</p>
                  <button className="review-section__edit" onClick={() => setStep(1)}>Edit</button>
                </div>
                <div className="review-section">
                  <h3 className="review-section__title">Payment</h3>
                  <p className="review-section__text">{paymentMethod === 'cod' ? 'ðŸ’µ Cash on Delivery' : 'ðŸ’³ Online Payment'}</p>
                  <button className="review-section__edit" onClick={() => setStep(2)}>Edit</button>
                </div>
                <div className="checkout-order-items">
                  {items.map((item, i) => (
                    <div key={i} className="checkout-item">
                      <div className="checkout-item__img">
                        {getImg(item) && <img src={getImg(item)} alt={item.name} />}
                      </div>
                      <div className="checkout-item__info">
                        <p className="checkout-item__name">{item.name}</p>
                        <p className="checkout-item__meta">{item.size} â€¢ {item.color} â€¢ Qty: {item.qty}</p>
                      </div>
                      <p className="checkout-item__price">â‚¹{((item.discountPrice > 0 ? item.discountPrice : item.price) * item.qty).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
                <div className="checkout-nav">
                  <button className="btn btn-ghost" onClick={() => setStep(2)}>â† Back</button>
                  <button className="btn btn-primary" onClick={handlePlaceOrder} disabled={loading}>
                    {loading ? <span className="spinner" /> : `Place Order Â· â‚¹${total.toLocaleString('en-IN')}`}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          <div className="checkout-summary">
            <div className="checkout-summary__card">
              <h3 className="checkout-summary__title">Order Summary</h3>
              <div className="checkout-summary__items">
                {items.map((item, i) => (
                  <div key={i} className="checkout-summary__item">
                    <span>{item.name} Ã— {item.qty}</span>
                    <span>â‚¹{((item.discountPrice > 0 ? item.discountPrice : item.price) * item.qty).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
              <div className="divider" />
              <div className="checkout-summary__totals">
                <div className="checkout-summary__row"><span>Subtotal</span><span>â‚¹{subtotal.toLocaleString('en-IN')}</span></div>
                <div className="checkout-summary__row"><span>Shipping</span><span className={shipping === 0 ? 'text-success' : ''}>{shipping === 0 ? 'FREE' : `â‚¹${shipping}`}</span></div>
                <div className="checkout-summary__row"><span>Tax (5%)</span><span>â‚¹{tax.toLocaleString('en-IN')}</span></div>
                <div className="checkout-summary__row checkout-summary__row--total"><span>Total</span><span>â‚¹{total.toLocaleString('en-IN')}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
