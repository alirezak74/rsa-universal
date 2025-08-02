// Authentication Middleware for RSA DEX Backend
// Validates JWT tokens and protects routes

const jwt = require('jsonwebtoken');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        error: 'Access denied. Invalid token format.',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rsa_dex_secret');
      
      // Add user info to request object
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };

      // Log authentication success
      logger.info(`User authenticated: ${decoded.email} (${decoded.role})`);

      next();

    } catch (jwtError) {
      let errorMessage = 'Invalid token';
      let errorCode = 'INVALID_TOKEN';

      if (jwtError.name === 'TokenExpiredError') {
        errorMessage = 'Token expired';
        errorCode = 'TOKEN_EXPIRED';
      } else if (jwtError.name === 'JsonWebTokenError') {
        errorMessage = 'Invalid token signature';
        errorCode = 'INVALID_SIGNATURE';
      }

      logger.warn(`Authentication failed: ${errorMessage} - ${jwtError.message}`);

      return res.status(401).json({
        error: errorMessage,
        code: errorCode
      });
    }

  } catch (error) {
    logger.error('Authentication middleware error:', error);
    return res.status(500).json({
      error: 'Internal server error during authentication',
      code: 'AUTH_ERROR'
    });
  }
};

// Admin-only middleware
const adminAuthMiddleware = async (req, res, next) => {
  // First run regular auth
  authMiddleware(req, res, (error) => {
    if (error) {
      return;
    }

    // Check if user is admin
    if (req.user.role !== 'admin') {
      logger.warn(`Admin access denied for user: ${req.user.email}`);
      return res.status(403).json({
        error: 'Access denied. Admin privileges required.',
        code: 'ADMIN_REQUIRED'
      });
    }

    next();
  });
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rsa_dex_secret');
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };
    } catch (jwtError) {
      req.user = null;
    }

    next();

  } catch (error) {
    logger.error('Optional auth middleware error:', error);
    req.user = null;
    next();
  }
};

module.exports = authMiddleware;
module.exports.admin = adminAuthMiddleware;
module.exports.optional = optionalAuthMiddleware;