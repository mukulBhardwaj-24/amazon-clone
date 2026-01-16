import React, { useEffect, useState } from 'react';
import Loader from '../loader/Loader';
import axios from 'axios';
import { NavLink } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const SignIn = () => {

  // Loader
  const [isLoading, setIsLoading] = useState(true);
  const [showSignIn, setShowSignIn] = useState(true);

  useEffect(function() {
    async function fetchUser() {
      try {
        const res = await axios.get(`${API_URL}/getAuthUser`, {
          withCredentials: true
        });

        if (res) {
          setShowSignIn(false);
        }
      } catch (error) {
        // Handle all 401 errors gracefully (user not logged in)
        if (error.response?.status === 401) {
          // User not logged in - show sign in option
          setShowSignIn(true);
        } else {
          console.log(error);
        }
      }
      setIsLoading(false);
    }

    fetchUser();
  }, [])

  return (
    <>
      
      { isLoading ?
      <Loader /> : 
        showSignIn ? 
        <div className='footer-signin'>
          <hr />
          <div className='signin-wrapper'>
            <p>See personalized recommendations</p>
            <NavLink to='/login'>
              <button>Sign in</button>
            </NavLink>
            
            <p>New customer? <NavLink to='/register'>Start here.</NavLink></p>
          </div>
          <hr />
        </div> :
        ""
      }
    </>
  )
}

export default SignIn;