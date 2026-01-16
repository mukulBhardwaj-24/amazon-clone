import React, { useEffect, useState } from 'react';
import NameBanner from './NameBanner';
import { useNavigate, Link } from 'react-router-dom';
import './profile.css';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import Loader from '../loader/Loader';
import Alert from '@mui/material/Alert';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const Orders = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [userName, setUserName] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Fetch user data for name
      const userRes = await axios.get(`${API_URL}/getAuthUser`, {
        withCredentials: true
      });
      setUserName(userRes.data.name);

      // Fetch orders
      const ordersRes = await axios.get(`${API_URL}/orders`, {
        withCredentials: true
      });
      setOrders(ordersRes.data);
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

  // Format price
  const formatPrice = (price) => {
    if (!price) return '0';
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
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Get status class
  const getStatusClass = (status) => {
    const statusLower = status?.toLowerCase() || 'pending';
    return statusLower;
  };

  if (isLoading) {
    return <Loader />;
  }

  const displayName = userName ? `${userName.split(' ')[0]}'s Orders` : 'Your Orders';

  return (
    <div className='profile'>
      <NameBanner name={displayName} />
      
      <div className='order-list'>
        {orders.length === 0 ? (
          <Alert 
            variant="outlined" 
            severity="info" 
            style={{ 
              width: '90%', 
              margin: '30px auto', 
              fontSize: '16px', 
              display: 'flex', 
              justifyContent: 'center' 
            }}
          >
            No orders yet. <Link to="/" style={{ marginLeft: '10px', color: '#007185' }}>Start Shopping</Link>
          </Alert>
        ) : (
          orders.map((order) => (
            <div key={order.id} className='order'>
              {/* Order Header */}
              <div className='order-top row'>
                <div className='col-6 col-md-3 col-lg-2'>
                  <h6 className='order-top-details'>Order Placed</h6>
                  <p>{formatDate(order.createdAt)}</p>
                </div>
                <div className='col-6 col-md-3 col-lg-2'>
                  <h6 className='order-top-details'>Total</h6>
                  <p>₹{formatPrice(order.totalAmount)}.00</p>
                </div>
                <div className='col-6 col-md-3 col-lg-2'>
                  <h6 className='order-top-details'>Ship To</h6>
                  <p>{order.shippingAddress?.fullName || 'N/A'}</p>
                </div>
                <div className='col-6 col-md-3 col-lg-2'>
                  <h6 className='order-top-details'>Status</h6>
                  <span className={`order-status ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className='col-12 col-lg-4 order-id-col'>
                  <h6 className='order-top-details'>Order ID</h6>
                  <p className='order-id'>{order.orderId}</p>
                </div>
              </div>
              
              {/* Order Products */}
              <div className='order-bottom'>
                {order.products?.map((product, index) => (
                  <div key={index} className='order-bottom-item row'>
                    <div className='col-3 col-sm-2'>
                      <img src={product.image} alt={product.name} />
                    </div>
                    <div className='col-9 col-sm-10'>
                      <h6>
                        <Link to={`/product/${product.productId}`}>
                          {product.name}
                        </Link>
                      </h6>
                      <p className='product-qty'>Qty: {product.quantity}</p>
                      <p className='product-price'>₹{formatPrice(product.price * product.quantity)}.00</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Order Actions */}
              <div className='order-actions'>
                <Link to={`/order-confirmation/${order.orderId}`} className='view-order-btn'>
                  View Order Details
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
