import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Loader from '../loader/Loader';
import './checkout.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const OrderConfirmation = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  
  const { orderId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`${API_URL}/order/${orderId}`, { withCredentials: true });
      setOrder(res.data);
      setIsLoading(false);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Order not found');
        setIsLoading(false);
      }
    }
  };

  // Format price
  const formatPrice = (price) => {
    let amount = price.toString();
    let lastThree = amount.substring(amount.length - 3);
    let otherNumbers = amount.substring(0, amount.length - 3);
    if (otherNumbers !== '') lastThree = ',' + lastThree;
    return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate delivery date
  const getDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="order-confirmation-section">
        <div className="confirmation-container error">
          <h2>❌ {error}</h2>
          <Link to="/" className="continue-btn">Go to Home</Link>
        </div>
      </div>
    );
  }

  const shippingAddress = order.shippingAddress || {};
  const products = order.products || [];

  return (
    <div className="order-confirmation-section">
      <div className="confirmation-container">
        {/* Success Header */}
        <div className="success-header">
          <div className="success-icon">✓</div>
          <h1>Order Placed Successfully!</h1>
          <p>Thank you for your order</p>
        </div>
        
        {/* Order ID */}
        <div className="order-id-box">
          <span>Order ID:</span>
          <strong>{order.orderId}</strong>
        </div>
        
        {/* Delivery Info */}
        <div className="delivery-info-box">
          <h3>📦 Estimated Delivery</h3>
          <p className="delivery-date">{getDeliveryDate()}</p>
        </div>
        
        {/* Order Details */}
        <div className="order-details-section">
          <div className="details-row">
            {/* Shipping Address */}
            <div className="details-card">
              <h4>Shipping Address</h4>
              <p className="address-name">{shippingAddress.fullName}</p>
              <p>{shippingAddress.address}</p>
              <p>{shippingAddress.city}, {shippingAddress.state}</p>
              <p>Pincode: {shippingAddress.pincode}</p>
              <p>Phone: {shippingAddress.phone}</p>
            </div>
            
            {/* Order Summary */}
            <div className="details-card">
              <h4>Order Summary</h4>
              <div className="summary-row">
                <span>Items Total:</span>
                <span>₹{formatPrice(order.totalAmount)}.00</span>
              </div>
              <div className="summary-row">
                <span>Delivery:</span>
                <span className="free">FREE</span>
              </div>
              <div className="summary-row total">
                <span>Order Total:</span>
                <span>₹{formatPrice(order.totalAmount)}.00</span>
              </div>
              <div className="summary-row status">
                <span>Status:</span>
                <span className={`status-badge ${order.status?.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>
            </div>
          </div>
          
          {/* Products List */}
          <div className="products-ordered">
            <h4>Items Ordered ({products.length})</h4>
            <div className="products-list">
              {products.map((item, index) => (
                <div key={index} className="product-item">
                  <img src={item.image} alt={item.name} />
                  <div className="product-info">
                    <p className="product-name">{item.name}</p>
                    <p className="product-qty">Qty: {item.quantity}</p>
                    <p className="product-price">₹{formatPrice(item.price * item.quantity)}.00</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Order Date */}
        <p className="order-date">
          Order placed on: {formatDate(order.createdAt)}
        </p>
        
        {/* Action Buttons */}
        <div className="action-buttons">
          <Link to="/orders" className="view-orders-btn">View All Orders</Link>
          <Link to="/" className="continue-btn">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
