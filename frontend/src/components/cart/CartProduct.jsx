import React from 'react';
import { NavLink } from 'react-router-dom';
import './cart.css';

const CartProduct = ({ cartItem, onUpdateQuantity, onDelete }) => {
  const product = cartItem.product; // API returns lowercase 'product'
  const quantity = cartItem.quantity;
  const cartId = cartItem.id;
  const productId = cartItem.productId;
  const path = `/product/${productId}`;

  // Calculate price
  const unitPrice = product?.accValue || product?.value || 0;
  const totalPrice = unitPrice * quantity;

  // Format price
  const formatPrice = (price) => {
    let amount = price.toString();
    let lastThree = amount.substring(amount.length - 3);
    let otherNumbers = amount.substring(0, amount.length - 3);
    if (otherNumbers !== '') lastThree = ',' + lastThree;
    return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  };

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value);
    onUpdateQuantity(cartId, newQuantity);
  };

  const handleDelete = () => {
    onDelete(productId);
  };

  return (
    <div className='cart-product'>
      <div className='product-left'>
        <div className='product-img-wrapper'>
          <img className='product-img' src={product?.url} alt={product?.name} />
        </div>
        <div className='product-details'>
          <NavLink to={path}>
            <h5 className='name'>{product?.name}</h5>
          </NavLink>
          {product?.category && (
            <p className='category-label'>{product.category}</p>
          )}
          <p className={`stock-status ${product?.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
            {product?.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </p>
          <p className='shipping'>Eligible for FREE Shipping</p>
          <div className='product-options' id="product-options">
            <section className='quantity'>
              <label>Qty:</label>
              <select value={quantity} onChange={handleQuantityChange}>
                {[...Array(Math.min(10, product?.stock || 10))].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </section>
            <div className='delete' onClick={handleDelete}>
              Delete
            </div>
          </div>
        </div>
      </div>
      <div className='product-right'>
        <h5>₹{formatPrice(totalPrice)}.00</h5>
        {quantity > 1 && (
          <p className='unit-price'>₹{formatPrice(unitPrice)}.00 each</p>
        )}
      </div>
    </div>
  );
};

export default CartProduct;
