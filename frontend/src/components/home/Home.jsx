import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Banner from './Banner';
import './home.css';
import Loader from '../loader/Loader';
import { NavLink } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const Home = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch products
        const productsRes = await axios.get(`${API_URL}/products`);
        setProducts(productsRes.data);
        setFilteredProducts(productsRes.data);

        // Fetch categories
        const categoriesRes = await axios.get(`${API_URL}/categories`);
        setCategories(categoriesRes.data);

        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter products when category or search term changes
  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, searchTerm, products]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Format price for display
  const formatPrice = (value) => {
    if (!value) return '0';
    let amount = value.toString();
    let lastThree = amount.substring(amount.length - 3);
    let otherNumbers = amount.substring(0, amount.length - 3);
    if (otherNumbers !== '') lastThree = ',' + lastThree;
    return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className='home'>
      <Banner />
      <main>
        {/* Category Filter Section */}
        <div className='filter-section'>
          <div className='filter-container'>
            <div className='search-filter'>
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchTerm}
                onChange={handleSearchChange}
                className='search-input'
              />
            </div>
            <div className='category-filter'>
              <span className='filter-label'>Filter by Category:</span>
              <div className='category-buttons'>
                {categories.map((category, index) => (
                  <button 
                    key={index}
                    className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className='products-section'>
          <h2 className='section-title'>
            {selectedCategory === 'All' ? 'All Products' : selectedCategory}
            <span className='product-count'>({filteredProducts.length} products)</span>
          </h2>
          
          {filteredProducts.length === 0 ? (
            <div className='no-products'>
              <p>No products found matching your criteria.</p>
            </div>
          ) : (
            <div className='products-grid'>
              {filteredProducts.map((product) => (
                <div key={product.id} className='product-card'>
                  <NavLink to={`/product/${product.id}`}>
                    <div className='product-image'>
                      <img src={product.url} alt={product.name} />
                      {product.discount && (
                        <span className='discount-badge'>{product.discount}</span>
                      )}
                    </div>
                    <div className='product-info'>
                      <h3 className='product-name'>{product.name}</h3>
                      <div className='product-pricing'>
                        <span className='product-price'>₹{formatPrice(product.accValue)}</span>
                        {product.mrp && (
                          <span className='product-mrp'><strike>{product.mrp}</strike></span>
                        )}
                      </div>
                      <div className='product-category'>{product.category}</div>
                      <div className={`product-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                        {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                      </div>
                    </div>
                  </NavLink>
                  <NavLink to={`/product/${product.id}`} className='add-to-cart-btn'>
                    View Details
                  </NavLink>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Home;
