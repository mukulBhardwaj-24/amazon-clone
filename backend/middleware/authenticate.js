const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Helper to get cookie options for clearing
const getClearCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    expires: new Date(0),
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
  };
};

const authenticate = async function(req, res, next) {
  try {
    const token = req.cookies.AmazonClone;
    
    if (!token) {
      return res.status(401).json({
        status: false,
        message: "No token provided"
      });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "User not found"
      });
    }

    // Check if token exists in user's tokens array
    const tokens = user.tokens || [];
    const tokenExists = tokens.some(t => t.token === token);
    
    if (!tokenExists) {
      // Token not in database - could be old token, clear it
      res.cookie("AmazonClone", "", getClearCookieOptions());
      return res.status(401).json({
        status: false,
        message: "Invalid token"
      });
    }

    req.token = token;
    req.user = user;
    req.userId = user.id;

    next();

  } catch (error) {
    // Clear invalid cookie
    res.cookie("AmazonClone", "", getClearCookieOptions());
    res.status(401).json({
      status: false,
      message: "No token provided",
      error: error.message
    });
  }
};

module.exports = authenticate;