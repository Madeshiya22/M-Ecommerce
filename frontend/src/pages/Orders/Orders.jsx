import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiPackage, FiExternalLink } from 'react-icons/fi';
import { orderService } from '../../api/orderApi';
import './Orders.css';

const STATUS_COLORS = {
  pending: '#FAAD14',
  confirmed: '#1677FF',
  processing: '#722ED1',
  shipped: '#13C2C2',
  delivered: '#52C41A',
  cancelled: '#FF4D4F',
  returned: '#FF7A45',
};

export default function Orders() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['myorders'],
    queryFn: () => orderService.getMyOrders(),
    select: (res) => res.data.data,
  });

  if (isLoading) return (
    <div className="orders-page">
      <div className="container">
        <h1 className="orders-title">My Orders</h1>
        {Array.from({length:3}).map((_, i) => (
          <div key={i} className="skeleton order-skeleton" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="orders-page">
      <div className="container">
        <h1 className="orders-title">My Orders</h1>
        {!orders || orders.length === 0 ? (
          <div className="orders-empty">
            <FiPackage size={48} />
            <h3>No orders yet</h3>
            <p>Start shopping to see your orders here</p>
            <Link to="/shop" className="btn btn-primary">Shop Now</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-card__header">
                  <div>
                    <p className="order-card__number">{order.orderNumber}</p>
                    <p className="order-card__date">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="order-card__right">
                    <span className="order-card__status" style={{ color: STATUS_COLORS[order.status], background: `${STATUS_COLORS[order.status]}18` }}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <Link to={`/orders/${order._id}`} className="btn btn-ghost btn-sm"><FiExternalLink size={14} /> Details</Link>
                  </div>
                </div>

                <div className="order-card__items">
                  {order.items.slice(0, 3).map((item, i) => (
                    <div key={i} className="order-item">
                      <div className="order-item__img">
                        {item.image && <img src={`http://localhost:5000${item.image}`} alt={item.name} />}
                        {!item.image && <div className="order-item__img-placeholder">{item.name?.[0]}</div>}
                      </div>
                      <div>
                        <p className="order-item__name">{item.name}</p>
                        <p className="order-item__meta">{item.size} â€¢ {item.color} â€¢ Qty: {item.qty}</p>
                      </div>
                      <p className="order-item__price">₹{(item.price * item.qty).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="order-card__more">+{order.items.length - 3} more items</p>
                  )}
                </div>

                <div className="order-card__footer">
                  <div>
                    <span className="order-card__label">Payment: </span>
                    <span className="order-card__value capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}</span>
                  </div>
                  <p className="order-card__total">Total: <strong>₹{order.totalPrice.toLocaleString('en-IN')}</strong></p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
