// Rate Limiting Middleware for RSA DEX Backend
// Protects against DDoS and abuse

const { RateLimiterMemory, RateLimiterRedis } = require('rate-limiter-flexible');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

// Configuration
const rateLimiterConfig = {
  // General API rate limiting
  general: {
    keyPrefix: 'rl_general',
    points: 100, // Number of requests
    duration: 60, // Per 60 seconds
    blockDuration: 60, // Block for 60 seconds if limit exceeded
  },
  
  // Authentication endpoints (more restrictive)
  auth: {
    keyPrefix: 'rl_auth',
    points: 5, // 5 attempts
    duration: 60, // Per 60 seconds
    blockDuration: 300, // Block for 5 minutes
  },
  
  // Admin endpoints (very restrictive)
  admin: {
    keyPrefix: 'rl_admin',
    points: 30, // 30 requests
    duration: 60, // Per 60 seconds
    blockDuration: 120, // Block for 2 minutes
  },
  
  // Withdrawal endpoints (security-critical)
  withdrawal: {
    keyPrefix: 'rl_withdrawal',
    points: 3, // 3 withdrawal requests
    duration: 300, // Per 5 minutes
    blockDuration: 600, // Block for 10 minutes
  },
  
  // Public endpoints (more lenient)
  public: {
    keyPrefix: 'rl_public',
    points: 200, // 200 requests
    duration: 60, // Per 60 seconds
    blockDuration: 30, // Block for 30 seconds
  }
};

// Create rate limiters
const rateLimiters = {};

// Use Redis if available, fallback to memory
const createRateLimiter = (config) => {
  try {
    // Try Redis first
    if (process.env.REDIS_URL) {
      const redis = require('redis');
      const client = redis.createClient({
        url: process.env.REDIS_URL
      });
      
      return new RateLimiterRedis({
        storeClient: client,
        ...config
      });
    }
  } catch (error) {
    logger.warn('Redis not available, using memory rate limiter');
  }
  
  // Fallback to memory
  return new RateLimiterMemory(config);
};

// Initialize rate limiters
for (const [type, config] of Object.entries(rateLimiterConfig)) {
  rateLimiters[type] = createRateLimiter(config);
}

// General rate limiter middleware
const createRateLimiterMiddleware = (type = 'general') => {
  const rateLimiter = rateLimiters[type];
  
  if (!rateLimiter) {
    logger.error(`Rate limiter type '${type}' not found`);
    return (req, res, next) => next();
  }

  return async (req, res, next) => {
    try {
      // Get client identifier (IP + user ID if available)
      const key = req.user ? `${req.ip}-${req.user.userId}` : req.ip;
      
      // Check rate limit
      await rateLimiter.consume(key);
      
      // Add rate limit headers
      const resRateLimiter = await rateLimiter.get(key);
      
      if (resRateLimiter) {
        res.set({
          'X-RateLimit-Limit': rateLimiterConfig[type].points,
          'X-RateLimit-Remaining': resRateLimiter.remainingPoints || 0,
          'X-RateLimit-Reset': new Date(Date.now() + resRateLimiter.msBeforeNext)
        });
      }
      
      next();
      
    } catch (rejRes) {
      // Rate limit exceeded
      const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
      
      logger.warn(`Rate limit exceeded for ${req.ip} on ${req.path} (type: ${type})`);
      
      res.set({
        'X-RateLimit-Limit': rateLimiterConfig[type].points,
        'X-RateLimit-Remaining': 0,
        'X-RateLimit-Reset': new Date(Date.now() + rejRes.msBeforeNext),
        'Retry-After': String(secs)
      });
      
      return res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${secs} seconds.`,
        retryAfter: secs,
        type: type
      });
    }
  };
};

// Specific rate limiter middlewares
const generalRateLimit = createRateLimiterMiddleware('general');
const authRateLimit = createRateLimiterMiddleware('auth');
const adminRateLimit = createRateLimiterMiddleware('admin');
const withdrawalRateLimit = createRateLimiterMiddleware('withdrawal');
const publicRateLimit = createRateLimiterMiddleware('public');

// Smart rate limiter that chooses appropriate limits based on endpoint
const smartRateLimit = (req, res, next) => {
  const path = req.path.toLowerCase();
  
  // Choose appropriate rate limiter based on path
  if (path.includes('/auth/') || path.includes('/login') || path.includes('/register')) {
    return authRateLimit(req, res, next);
  }
  
  if (path.includes('/admin/')) {
    return adminRateLimit(req, res, next);
  }
  
  if (path.includes('/withdrawal')) {
    return withdrawalRateLimit(req, res, next);
  }
  
  if (path.includes('/tokens') || path.includes('/networks/status') || path.includes('/health')) {
    return publicRateLimit(req, res, next);
  }
  
  // Default to general rate limiting
  return generalRateLimit(req, res, next);
};

// Bypass rate limiting for specific IPs (admin/monitoring systems)
const bypassIPs = (process.env.RATE_LIMIT_BYPASS_IPS || '').split(',').filter(Boolean);

const rateLimiterWithBypass = (req, res, next) => {
  // Check if IP should bypass rate limiting
  if (bypassIPs.includes(req.ip)) {
    logger.info(`Rate limiting bypassed for IP: ${req.ip}`);
    return next();
  }
  
  return smartRateLimit(req, res, next);
};

// Advanced rate limiter for high-security endpoints
const securityRateLimit = createRateLimiterMiddleware('withdrawal');

// Progressive rate limiting (increases restrictions for repeated violations)
const progressiveRateLimit = async (req, res, next) => {
  try {
    const key = `progressive_${req.ip}`;
    const violations = await rateLimiters.general.get(key);
    
    let multiplier = 1;
    if (violations && violations.hitCount > 10) {
      multiplier = Math.min(violations.hitCount / 10, 5); // Max 5x penalty
    }
    
    // Create temporary stricter rate limiter
    const strictLimiter = new (require('rate-limiter-flexible').RateLimiterMemory)({
      keyPrefix: 'rl_progressive',
      points: Math.max(1, Math.floor(rateLimiterConfig.general.points / multiplier)),
      duration: rateLimiterConfig.general.duration,
      blockDuration: rateLimiterConfig.general.blockDuration * multiplier,
    });
    
    await strictLimiter.consume(req.ip);
    next();
    
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    
    logger.warn(`Progressive rate limit exceeded for ${req.ip}`);
    
    return res.status(429).json({
      error: 'Too many requests - progressive limiting active',
      message: `Enhanced rate limiting due to repeated violations. Try again in ${secs} seconds.`,
      retryAfter: secs
    });
  }
};

// Rate limiter stats (for monitoring)
const getRateLimiterStats = async () => {
  const stats = {};
  
  for (const [type, limiter] of Object.entries(rateLimiters)) {
    try {
      // This would depend on the rate limiter implementation
      // For now, return basic info
      stats[type] = {
        type: type,
        config: rateLimiterConfig[type],
        active: true
      };
    } catch (error) {
      stats[type] = {
        type: type,
        error: error.message,
        active: false
      };
    }
  }
  
  return stats;
};

// Export all rate limiters
module.exports = rateLimiterWithBypass;
module.exports.general = generalRateLimit;
module.exports.auth = authRateLimit;
module.exports.admin = adminRateLimit;
module.exports.withdrawal = withdrawalRateLimit;
module.exports.public = publicRateLimit;
module.exports.security = securityRateLimit;
module.exports.progressive = progressiveRateLimit;
module.exports.stats = getRateLimiterStats;