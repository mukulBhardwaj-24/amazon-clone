import React, { useEffect, useState } from 'react';
import Loader from '../loader/Loader';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import './cart.css';
import CartProduct from './CartProduct';
import SubTotal from './SubTotal';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const Cart = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await axios.get(`${API_URL}/cart`, { withCredentials: true });
      // API returns { items: [], subtotal, totalQty, total }
      setCartItems(res.data.items || []);
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

  // Update quantity
  const updateQuantity = async (cartId, newQuantity) => {
    try {
      await axios.put(`${API_URL}/cart/${cartId}`, {
        quantity: newQuantity
      }, {
        withCredentials: true
      });
      fetchCart();
    } catch (error) {
      console.log(error);
    }
  };

  // Delete item from cart
  const deleteFromCart = async (productId) => {
    try {
      await axios.delete(`${API_URL}/delete/${productId}`, {
        withCredentials: true
      });
      fetchCart();
    } catch (error) {
      console.log(error);
    }
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

  // Proceed to checkout
  const proceedToCheckout = () => {
    navigate('/checkout');
  };

  if (isLoading) {
    return <Loader />;
  }

  if (cartItems.length === 0) {
    return (
      <Alert 
        variant="outlined" 
        severity="warning" 
        style={{ 
          width: '80%', 
          margin: '30px auto', 
          fontSize: '16px', 
          display: 'flex', 
          justifyContent: 'center' 
        }}
      >
        Your cart is empty. <a href="/" style={{ marginLeft: '10px', color: '#007185' }}>Continue Shopping</a>
      </Alert>
    );
  }

  const { totalQty, totalAmount } = calculateTotals();
  const formattedTotal = formatPrice(totalAmount);

  return (
    <div className='cart-section'>
      <div className='left'>
        <h3>Shopping Cart</h3>
        <p className='price-heading'>Price</p>
        {cartItems.map((item) => (
          <CartProduct 
            key={item.id}
            cartItem={item}
            onUpdateQuantity={updateQuantity}
            onDelete={deleteFromCart}
          />
        ))}
        <SubTotal totalQty={totalQty} subTotal={formattedTotal} />
      </div>
      <div className="right">
        <SubTotal totalQty={totalQty} subTotal={formattedTotal} />
        <button onClick={proceedToCheckout}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;
