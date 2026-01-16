import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './product.css';
import { useParams, useNavigate } from 'react-router-dom';
import Loader from '../loader/Loader';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const Product = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchSingleProduct() {
      try {
        const res = await axios.get(`${API_URL}/product/${id}`);
        setProduct(res.data);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    }

    fetchSingleProduct();
  }, [id]);

  // Add to cart
  async function addToCart() {
    try {
      await axios.post(`${API_URL}/addtocart/${product.id}`, {
        quantity
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      setMessage('Added to cart successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setMessage(error.response?.data?.message || 'Error adding to cart');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  }

  // Buy now - Add to cart and redirect to checkout
  async function buyNow() {
    try {
      await axios.post(`${API_URL}/addtocart/${product.id}`, {
        quantity
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      navigate('/checkout');
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setMessage(error.response?.data?.message || 'Error processing request');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  }

  // Calculate delivery date (3 days from now)
  const today = new Date();
  today.setDate(today.getDate() + 3);
  const dayArr = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const monthArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const day = dayArr[today.getDay()];
  const date = today.getDate();
  const month = monthArr[today.getMonth()];
  const deliveryDate = `${day}, ${date} ${month}`;

  // Helper function to fix image path
  const fixImagePath = (path) => {
    if (!path) return '';
    // Remove leading ../ or ./ from paths
    return path.replace(/^\.\.\//, '').replace(/^\.\//, '');
  };

  // Get all images for carousel
  const getImages = () => {
    if (!product) return [];
    const images = [];
    
    if (product.url) images.push(fixImagePath(product.url));
    if (product.resUrl) {
      const fixedResUrl = fixImagePath(product.resUrl);
      if (fixedResUrl !== fixImagePath(product.url)) {
        images.push(fixedResUrl);
      }
    }
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach(img => {
        const fixedImg = fixImagePath(img);
        if (!images.includes(fixedImg)) images.push(fixedImg);
      });
    }
    return images.length > 0 ? images : [fixImagePath(product.url) || fixImagePath(product.resUrl)];
  };

  if (isLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Product not found</h2>
        <button onClick={() => navigate('/')}>Go to Home</button>
      </div>
    );
  }

  const images = getImages();

  return (
    <div className='product-section'>
      {message && (
        <div className={`message-toast ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}
      
      <div className='left'>
        {/* Main Image */}
        <div className="main-image">
          <img src={images[selectedImage]} alt={product.name} />
        </div>
        
        {/* Image Thumbnails */}
        {images.length > 1 && (
          <div className="image-thumbnails">
            {images.map((img, index) => (
              <div 
                key={index}
                className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                onClick={() => setSelectedImage(index)}
              >
                <img src={img} alt={`${product.name} - ${index + 1}`} />
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className='middle'>
        <div className='product-details'>
          <h4>{product.name}</h4>
          <span className="product-category-label">{product.category}</span>
          <div className='divider'></div>
          
          <div className='price'>
            {product.discount && <span className="discount-tag">{product.discount}</span>}
            <span className="price-value">
              <span className='sup'>₹</span>
              {product.value || product.accValue}
              <span className='sup'>00</span>
            </span>
          </div>
          
          <div className='mrp'>M.R.P.: <strike>₹{product.mrp}</strike></div>
          <p className='taxes'>Inclusive of all taxes</p>
          
          {/* Stock Status */}
          <div className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
            {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
          </div>
        </div>
        
        {/* Description */}
        {product.description && (
          <div className='product-description'>
            <h6>Description</h6>
            <p>{product.description}</p>
          </div>
        )}
        
        {/* About Product Points */}
        {product.points && product.points.length > 0 && (
          <div className='about-product'>
            <h6>About this item</h6>
            <ul>
              {product.points.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className='right'>
        <div className="buy-box">
          <h3>
            <span className='sup'>₹</span>
            {product.value || product.accValue}
            <span className='sup'>00</span>
          </h3>
          
          <p className="delivery-info">
            <span>FREE delivery:</span> {deliveryDate}
          </p>
          
          {product.stock > 0 ? (
            <>
              <div className="quantity-selector">
                <label>Quantity:</label>
                <select 
                  value={quantity} 
                  onChange={(e) => setQuantity(Number(e.target.value))}
                >
                  {[...Array(Math.min(10, product.stock))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
              
              <button 
                id="addtocart-btn" 
                className="add-cart-btn"
                onClick={addToCart}
              >
                Add to Cart
              </button>
              
              <button 
                className="buy-now-btn"
                onClick={buyNow}
              >
                Buy Now
              </button>
            </>
          ) : (
            <p className="out-of-stock-msg">Currently unavailable</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Product;
