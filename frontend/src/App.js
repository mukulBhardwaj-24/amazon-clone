import Navbar from './components/header/Navbar'
import Home from './components/home/Home';
import Footer from './components/footer/Footer';
import { Routes, Route } from 'react-router-dom';
import SignUp from './components/login-register/SignUp';
import SignIn from './components/login-register/SignIn';
import Product from './components/product/Product';
import Cart from './components/cart/Cart';
import Profile from './components/profile/Profile';
import Orders from './components/profile/Orders';
import Checkout from './components/checkout/Checkout';
import OrderConfirmation from './components/checkout/OrderConfirmation';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <div className="App">
      <ScrollToTop />
      <Routes>
        <Route path='/' element={ <> <Navbar /> <Home /> <Footer /> </> } />
        <Route path='/login' element={ <SignIn /> } />
        <Route path='/register' element={ <SignUp /> } />
        <Route path='/product/:id' element={ <> <Navbar /> <Product /> <Footer /> </> } />
        <Route path='/cart' element={ <> <Navbar /> <Cart /> <Footer /> </> } />
        <Route path='/checkout' element={ <> <Navbar /> <Checkout /> <Footer /> </> } />
        <Route path='/order-confirmation/:orderId' element={ <> <Navbar /> <OrderConfirmation /> <Footer /> </> } />
        <Route path='/profile' element={ <> <Navbar /> <Profile /> <Footer /> </> } />
        <Route path='/orders' element={ <> <Navbar /> <Orders /> <Footer /> </> } />
      </Routes>
    </div>
  );
}

export default App;
