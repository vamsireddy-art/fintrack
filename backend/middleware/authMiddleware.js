const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.adminId = decoded.adminId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed. Please log in.' });
  }
};

module.exports = auth;
