import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loader from '../loader/Loader';
import './checkout.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const Checkout = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch user data
      const userRes = await axios.get(`${API_URL}/getAuthUser`, { withCredentials: true });
      setUser(userRes.data);
      
      // Pre-fill name and phone if available
      setShippingAddress(prev => ({
        ...prev,
        fullName: userRes.data.name || '',
        phone: userRes.data.number || ''
      }));

      // Fetch cart data
      const cartRes = await axios.get(`${API_URL}/cart`, { withCredentials: true });
      const items = cartRes.data.items || [];
      setCartItems(items);
      
      if (items.length === 0) {
        navigate('/cart');
        return;
      }
      
      setIsLoading(false);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        console.log(error);
        setIsLoading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate totals
  const calculateTotals = () => {
    let totalQty = 0;
    let totalAmount = 0;

    cartItems.forEach(item => {
      totalQty += item.quantity;
      const price = item.product?.accValue || item.product?.value || 0;
      totalAmount += item.quantity * price;
    });

    return { totalQty, totalAmount };
  };

  // Format price
  const formatPrice = (price) => {
    let amount = price.toString();
    let lastThree = amount.substring(amount.length - 3);
    let otherNumbers = amount.substring(0, amount.length - 3);
    if (otherNumbers !== '') lastThree = ',' + lastThree;
    return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  };

  // Validate form
  const validateForm = () => {
    const { fullName, phone, address, city, state, pincode } = shippingAddress;
    
    if (!fullName.trim()) return 'Full name is required';
    if (!phone.trim()) return 'Phone number is required';
    if (!/^\d{10}$/.test(phone.trim())) return 'Please enter a valid 10-digit phone number';
    if (!address.trim()) return 'Address is required';
    if (!city.trim()) return 'City is required';
    if (!state.trim()) return 'State is required';
    if (!pincode.trim()) return 'Pincode is required';
    if (!/^\d{6}$/.test(pincode.trim())) return 'Please enter a valid 6-digit pincode';
    
    return null;
  };

  // Place order
  const placeOrder = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Prepare order data
      const products = cartItems.map(item => ({
        productId: item.productId,
        name: item.product?.name,
        price: item.product?.accValue || item.product?.value,
        quantity: item.quantity,
        image: item.product?.url
      }));

      const { totalAmount } = calculateTotals();

      const orderData = {
        products,
        totalAmount,
        shippingAddress
      };

      const res = await axios.post(`${API_URL}/order`, orderData, {
        withCredentials: true
      });

      // Navigate to order confirmation
      navigate(`/order-confirmation/${res.data.orderId}`);
    } catch (error) {
      console.log(error);
      setError(error.response?.data?.message || 'Failed to place order. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  const { totalQty, totalAmount } = calculateTotals();

  return (
    <div className="checkout-section">
      <div className="checkout-container">
        <h2>Checkout</h2>
        
        <div className="checkout-content">
          {/* Shipping Address Form */}
          <div className="shipping-form">
            <h3>Shipping Address</h3>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={shippingAddress.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
              />
            </div>
            
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={shippingAddress.phone}
                onChange={handleInputChange}
                placeholder="Enter 10-digit phone number"
                maxLength="10"
              />
            </div>
            
            <div className="form-group">
              <label>Address *</label>
              <textarea
                name="address"
                value={shippingAddress.address}
                onChange={handleInputChange}
                placeholder="Enter your full address"
                rows="3"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  placeholder="Enter city"
                />
              </div>
              
              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  name="state"
                  value={shippingAddress.state}
                  onChange={handleInputChange}
                  placeholder="Enter state"
                />
              </div>
            </div>
            
            <div className="form-group half">
              <label>Pincode *</label>
              <input
                type="text"
                name="pincode"
                value={shippingAddress.pincode}
                onChange={handleInputChange}
                placeholder="Enter 6-digit pincode"
                maxLength="6"
              />
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="order-summary">
            <h3>Order Summary</h3>
            
            <div className="order-items">
              {cartItems.map(item => (
                <div key={item.id} className="order-item">
                  <img src={item.product?.url} alt={item.product?.name} />
                  <div className="item-details">
                    <p className="item-name">{item.product?.name}</p>
                    <p className="item-qty">Qty: {item.quantity}</p>
                    <p className="item-price">
                      ₹{formatPrice((item.product?.accValue || item.product?.value) * item.quantity)}.00
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="order-totals">
              <div className="total-row">
                <span>Items ({totalQty}):</span>
                <span>₹{formatPrice(totalAmount)}.00</span>
              </div>
              <div className="total-row">
                <span>Delivery:</span>
                <span className="free">FREE</span>
              </div>
              <div className="total-row grand-total">
                <span>Order Total:</span>
                <span>₹{formatPrice(totalAmount)}.00</span>
              </div>
            </div>
            
            <button 
              className="place-order-btn"
              onClick={placeOrder}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </button>
            
            <p className="secure-text">
              🔒 Your order is secure and encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
