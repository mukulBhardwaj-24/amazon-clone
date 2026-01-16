// Libraries
const router = require('express').Router();
const { User, Product, Cart, Order } = require('../models');
const bcrypt = require('bcryptjs');
const authenticate = require('../middleware/authenticate');
const { check, validationResult } = require('express-validator');
const { Op } = require('sequelize');

// Generate unique order ID
function generateOrderId() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `ORD-${timestamp}-${randomStr}`.toUpperCase();
}

// ==================== PRODUCT ROUTES ====================

// Get all products API
router.get("/products", async function(req, res) {
  try {
    const { search, category } = req.query;
    
    let whereClause = {};
    
    // Search by name
    if (search) {
      whereClause.name = {
        [Op.like]: `%${search}%`
      };
    }
    
    // Filter by category
    if (category && category !== 'All') {
      whereClause.category = category;
    }
    
    const products = await Product.findAll({
      where: whereClause,
      order: [['id', 'ASC']]
    });
    
    res.status(200).json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
});

// Get all categories
router.get("/categories", async function(req, res) {
  try {
    const categories = await Product.findAll({
      attributes: ['category'],
      group: ['category']
    });
    
    const categoryList = ['All', ...categories.map(c => c.category)];
    res.status(200).json(categoryList);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching categories", error: error.message });
  }
});

// Get individual product
router.get("/product/:id", async function(req, res) {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.status(200).json(product);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching product", error: error.message });
  }
});

// ==================== AUTH ROUTES ====================

// Register user
router.post('/register', [
  check('name').not().isEmpty().withMessage("Name can't be empty").trim().escape(),
  check('number').not().isEmpty().withMessage("Number can't be empty")
    .isNumeric().withMessage("Number must only consist of digits")
    .isLength({ max: 10, min: 10 }).withMessage('Number must consist of 10 digits'),
  check('password').not().isEmpty().withMessage("Password can't be empty")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
    .matches(/\d/).withMessage("Password must contain a number"),
  check('confirmPassword').not().isEmpty().withMessage("Confirm Password can't be empty"),
  check('email').not().isEmpty().withMessage("Email can't be empty")
    .isEmail().withMessage("Email format is invalid")
    .normalizeEmail()
], async function(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      message: errors.array()
    });
  }

  try {
    const { name, number, email, password, confirmPassword } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        status: false,
        message: [{ msg: "Passwords don't match" }]
      });
    }

    // Check for duplicate email
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({
        status: false,
        message: [{ msg: "Email already registered" }]
      });
    }

    // Check for duplicate number
    const existingNumber = await User.findOne({ where: { number } });
    if (existingNumber) {
      return res.status(400).json({
        status: false,
        message: [{ msg: "Number already registered" }]
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await User.create({
      name,
      number,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      status: true,
      message: "User registered successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: [{ msg: "Server error" }]
    });
  }
});

// Login user
router.post('/login', [
  check('email').not().isEmpty().withMessage("Email can't be empty")
    .isEmail().withMessage("Email format invalid")
    .normalizeEmail(),
  check('password').not().isEmpty().withMessage("Password can't be empty")
], async function(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      message: errors.array()
    });
  }

  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(400).json({
        status: false,
        message: [{ msg: "Incorrect Email or Password" }]
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({
        status: false,
        message: [{ msg: "Incorrect Email or Password" }]
      });
    }

    // Generate token
    const token = await user.generateAuthToken();

    // Set cookie with proper settings for cross-origin (Vercel deployment)
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie("AmazonClone", token, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      httpOnly: true,
      secure: isProduction, // Use secure cookies in production (HTTPS)
      sameSite: isProduction ? 'none' : 'lax' // 'none' required for cross-origin in production
    });

    res.status(200).json({
      status: true,
      message: "Logged in successfully!"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: [{ msg: "Server error" }]
    });
  }
});

// Logout user
router.get("/logout", authenticate, async function(req, res) {
  try {
    // Remove current token from user's tokens array
    const tokens = req.user.tokens || [];
    req.user.tokens = tokens.filter(t => t.token !== req.token);
    await req.user.save();

    // Clear cookie with proper settings for cross-origin
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie("AmazonClone", "", {
      expires: new Date(0),
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax'
    });

    res.status(200).json({
      status: true,
      message: "Logged out successfully!"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Error logging out"
    });
  }
});

// Get authenticated user
router.get('/getAuthUser', authenticate, async function(req, res) {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: ['id', 'name', 'email', 'number']
    });
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching user" });
  }
});

// ==================== CART ROUTES ====================

// Get user's cart
router.get('/cart', authenticate, async function(req, res) {
  try {
    const cartItems = await Cart.findAll({
      where: { userId: req.userId },
      include: [{
        model: Product,
        as: 'product'
      }]
    });

    // Calculate totals
    let subtotal = 0;
    let totalQty = 0;

    const formattedCart = cartItems.map(item => {
      const itemTotal = item.product.accValue * item.quantity;
      subtotal += itemTotal;
      totalQty += item.quantity;
      
      return {
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        product: item.product
      };
    });

    res.status(200).json({
      items: formattedCart,
      subtotal,
      totalQty,
      total: subtotal
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching cart", error: error.message });
  }
});

// Add item to cart
router.post('/addtocart/:id', authenticate, async function(req, res) {
  try {
    const productId = parseInt(req.params.id);
    
    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        status: false,
        message: "Product not found"
      });
    }

    // Check if product already in cart
    const existingCartItem = await Cart.findOne({
      where: {
        userId: req.userId,
        productId: productId
      }
    });

    if (existingCartItem) {
      // Increment quantity
      existingCartItem.quantity += 1;
      await existingCartItem.save();
    } else {
      // Add new item to cart
      await Cart.create({
        userId: req.userId,
        productId: productId,
        quantity: 1
      });
    }

    res.status(201).json({
      status: true,
      message: "Item added to cart"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Error adding to cart"
    });
  }
});

// Update cart item quantity
router.put('/cart/:id', authenticate, async function(req, res) {
  try {
    const cartItemId = parseInt(req.params.id);
    const { quantity } = req.body;

    const cartItem = await Cart.findOne({
      where: {
        id: cartItemId,
        userId: req.userId
      }
    });

    if (!cartItem) {
      return res.status(404).json({
        status: false,
        message: "Cart item not found"
      });
    }

    if (quantity <= 0) {
      await cartItem.destroy();
      return res.status(200).json({
        status: true,
        message: "Item removed from cart"
      });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json({
      status: true,
      message: "Cart updated"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Error updating cart"
    });
  }
});

// Delete item from cart
router.delete("/delete/:id", authenticate, async function(req, res) {
  try {
    const productId = parseInt(req.params.id);

    const result = await Cart.destroy({
      where: {
        userId: req.userId,
        productId: productId
      }
    });

    if (result === 0) {
      return res.status(404).json({
        status: false,
        message: "Item not found in cart"
      });
    }

    res.status(200).json({
      status: true,
      message: "Item deleted successfully"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Error deleting item"
    });
  }
});

// Clear entire cart
router.delete("/cart/clear", authenticate, async function(req, res) {
  try {
    await Cart.destroy({
      where: { userId: req.userId }
    });

    res.status(200).json({
      status: true,
      message: "Cart cleared"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Error clearing cart"
    });
  }
});

// ==================== ORDER ROUTES ====================

// Place order
router.post('/order', authenticate, async function(req, res) {
  try {
    const { shippingAddress } = req.body;

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address || 
        !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode || 
        !shippingAddress.phone) {
      return res.status(400).json({
        status: false,
        message: "Please provide complete shipping address"
      });
    }

    // Get cart items
    const cartItems = await Cart.findAll({
      where: { userId: req.userId },
      include: [{
        model: Product,
        as: 'product'
      }]
    });

    if (cartItems.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Cart is empty"
      });
    }

    // Prepare order products and calculate total
    let totalAmount = 0;
    const orderProducts = cartItems.map(item => {
      const itemTotal = item.product.accValue * item.quantity;
      totalAmount += itemTotal;
      
      return {
        id: item.product.id,
        name: item.product.name,
        price: item.product.accValue,
        quantity: item.quantity,
        image: item.product.url
      };
    });

    // Generate order ID
    const orderId = generateOrderId();

    // Create order
    const order = await Order.create({
      orderId,
      userId: req.userId,
      products: orderProducts,
      totalAmount,
      shippingAddress,
      status: 'confirmed'
    });

    // Clear cart after order placement
    await Cart.destroy({
      where: { userId: req.userId }
    });

    res.status(201).json({
      status: true,
      message: "Order placed successfully",
      orderId: order.orderId,
      order: {
        id: order.id,
        orderId: order.orderId,
        products: order.products,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress,
        status: order.status,
        orderDate: order.orderDate
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Error placing order",
      error: error.message
    });
  }
});

// Get user's orders
router.get('/orders', authenticate, async function(req, res) {
  try {
    const orders = await Order.findAll({
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(orders);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error fetching orders",
      error: error.message
    });
  }
});

// Get single order by order ID
router.get('/order/:orderId', authenticate, async function(req, res) {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({
      where: {
        orderId: orderId,
        userId: req.userId
      }
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    res.status(200).json(order);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error fetching order",
      error: error.message
    });
  }
});

module.exports = router;
