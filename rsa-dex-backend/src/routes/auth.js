const express = require('express');
const router = express.Router();
const { generateToken } = require('../middleware/auth');
const blockchainService = require('../services/blockchainService');

// Mock user database (in production, use a real database)
const users = new Map();

// Initialize default admin user
const defaultAdmin = {
  id: 'admin-1',
  username: 'admin',
  password: 'admin123',
  walletAddress: '0x0000000000000000000000000000000000000000', // Placeholder address
  createdAt: new Date().toISOString(),
  role: 'admin'
};

users.set('admin', defaultAdmin);

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, password, walletAddress } = req.body;
    
    if (!username || !password || !walletAddress) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: username, password, walletAddress' 
      });
    }

    // Check if user already exists
    if (users.has(username)) {
      return res.status(409).json({ 
        success: false, 
        error: 'Username already exists' 
      });
    }

    // Validate wallet address
    if (!blockchainService.isValidAddress(walletAddress)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid wallet address' 
      });
    }

    // Create user
    const userId = Date.now().toString();
    const user = {
      id: userId,
      username,
      password, // In production, hash the password
      walletAddress,
      createdAt: new Date().toISOString()
    };

    users.set(username, user);

    // Generate JWT token
    const token = generateToken(userId, username);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: userId,
          username,
          walletAddress
        }
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: username, password' 
      });
    }

    const user = users.get(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = generateToken(user.id, user.username);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          walletAddress: user.walletAddress
        }
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// Connect wallet
router.post('/connect-wallet', async (req, res) => {
  try {
    const { walletAddress, signature, message } = req.body;
    
    if (!walletAddress || !signature || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: walletAddress, signature, message' 
      });
    }

    // Validate wallet address
    if (!blockchainService.isValidAddress(walletAddress)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid wallet address' 
      });
    }

    // Verify signature (in production, implement proper signature verification)
    const isValidSignature = await blockchainService.verifySignature(
      walletAddress, 
      message, 
      signature
    );

    if (!isValidSignature) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid signature' 
      });
    }

    // Check if wallet is already connected to a user
    let existingUser = null;
    for (const [username, user] of users.entries()) {
      if (user.walletAddress === walletAddress) {
        existingUser = user;
        break;
      }
    }

    if (existingUser) {
      // Return existing user token
      const token = generateToken(existingUser.id, existingUser.username);
      return res.json({
        success: true,
        data: {
          token,
          user: {
            id: existingUser.id,
            username: existingUser.username,
            walletAddress: existingUser.walletAddress
          }
        }
      });
    }

    // Create new user for this wallet
    const userId = Date.now().toString();
    const username = `user_${walletAddress.slice(-8)}`;
    
    const user = {
      id: userId,
      username,
      walletAddress,
      createdAt: new Date().toISOString()
    };

    users.set(username, user);

    // Generate JWT token
    const token = generateToken(userId, username);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: userId,
          username,
          walletAddress
        }
      }
    });
  } catch (error) {
    console.error('Error connecting wallet:', error);
    res.status(500).json({ success: false, error: 'Wallet connection failed' });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Access token required' 
      });
    }

    // In production, verify the token and get user from database
    // For now, return a mock response
    res.json({
      success: true,
      data: {
        user: {
          id: 'mock-user-id',
          username: 'mock-user',
          walletAddress: 'mock-wallet-address'
        }
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

module.exports = router; 