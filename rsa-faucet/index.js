const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Serve the main HTML page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>RSA Chain Faucet</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
            }
            
            .header {
                background: rgba(0, 0, 0, 0.2);
                padding: 2rem 0;
                text-align: center;
            }
            
            .header h1 {
                font-size: 2.5rem;
                margin-bottom: 0.5rem;
            }
            
            .header p {
                font-size: 1.2rem;
                opacity: 0.9;
            }
            
            .main {
                flex: 1;
                max-width: 600px;
                margin: 0 auto;
                padding: 2rem;
            }
            
            .faucet-card {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 12px;
                padding: 2rem;
                border: 1px solid rgba(255, 255, 255, 0.2);
                margin-bottom: 2rem;
            }
            
            .faucet-card h2 {
                margin-bottom: 1.5rem;
                font-size: 1.5rem;
            }
            
            .form-group {
                margin-bottom: 1.5rem;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: bold;
            }
            
            .form-input {
                width: 100%;
                padding: 1rem;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                background: rgba(255, 255, 255, 0.9);
                color: #333;
            }
            
            .form-input::placeholder {
                color: #666;
            }
            
            .request-button {
                background: #4CAF50;
                color: white;
                border: none;
                padding: 1rem 2rem;
                font-size: 1.1rem;
                font-weight: bold;
                border-radius: 8px;
                cursor: pointer;
                transition: background 0.3s;
                width: 100%;
            }
            
            .request-button:hover {
                background: #45a049;
            }
            
            .request-button:disabled {
                background: #666;
                cursor: not-allowed;
            }
            
            .info-card {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 12px;
                padding: 1.5rem;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .info-card h3 {
                margin-bottom: 1rem;
                color: #FFD700;
            }
            
            .info-list {
                list-style: none;
            }
            
            .info-list li {
                margin-bottom: 0.5rem;
                padding-left: 1.5rem;
                position: relative;
            }
            
            .info-list li:before {
                content: "✓";
                position: absolute;
                left: 0;
                color: #4CAF50;
                font-weight: bold;
            }
            
            .footer {
                background: rgba(0, 0, 0, 0.2);
                padding: 2rem;
                text-align: center;
            }
            
            .footer a {
                color: #4CAF50;
                text-decoration: none;
            }
            
            .footer a:hover {
                text-decoration: underline;
            }
            
            .success-message {
                background: rgba(76, 175, 80, 0.2);
                border: 1px solid #4CAF50;
                border-radius: 8px;
                padding: 1rem;
                margin-bottom: 1rem;
                display: none;
            }
            
            .error-message {
                background: rgba(244, 67, 54, 0.2);
                border: 1px solid #F44336;
                border-radius: 8px;
                padding: 1rem;
                margin-bottom: 1rem;
                display: none;
            }
        </style>
    </head>
    <body>
        <header class="header">
            <h1>🚰 RSA Chain Faucet</h1>
            <p>Get test tokens for development and testing</p>
        </header>
        
        <main class="main">
            <div class="faucet-card">
                <h2>Request Test Tokens</h2>
                
                <div id="successMessage" class="success-message">
                    ✅ Test tokens sent successfully! Check your wallet.
                </div>
                
                <div id="errorMessage" class="error-message">
                    ❌ Error: Please try again later.
                </div>
                
                <form id="faucetForm">
                    <div class="form-group">
                        <label for="address">Wallet Address</label>
                        <input 
                            type="text" 
                            id="address" 
                            name="address" 
                            class="form-input" 
                            placeholder="Enter your RSA Chain wallet address..."
                            required
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="amount">Amount (RSA CRYPTO)</label>
                        <select id="amount" name="amount" class="form-input">
                            <option value="10000">10,000 RSA CRYPTO</option>
                            <option value="50000">50,000 RSA CRYPTO</option>
                            <option value="100000" selected>100,000 RSA CRYPTO</option>
                            <option value="500000">500,000 RSA CRYPTO</option>
                        </select>
                    </div>
                    
                    <button type="submit" class="request-button" id="requestButton">
                        Request Test Tokens
                    </button>
                </form>
            </div>
            
            <div class="info-card">
                <h3>📋 Faucet Information</h3>
                <ul class="info-list">
                    <li>This faucet provides test tokens for development</li>
                    <li>Tokens are sent to the RSA Chain testnet</li>
                    <li>You can request tokens once per hour</li>
                    <li>Test tokens have no real value</li>
                    <li>Use these tokens for testing your applications</li>
                </ul>
            </div>
        </main>
        
        <footer class="footer">
            <p>© 2025 RSA Chain Faucet | <a href="http://localhost:3000">Back to Main Site</a></p>
        </footer>
        
        <script>
            document.getElementById('faucetForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const button = document.getElementById('requestButton');
                const successMessage = document.getElementById('successMessage');
                const errorMessage = document.getElementById('errorMessage');
                
                // Hide previous messages
                successMessage.style.display = 'none';
                errorMessage.style.display = 'none';
                
                // Disable button
                button.disabled = true;
                button.textContent = 'Processing...';
                
                const formData = new FormData(e.target);
                const data = {
                    address: formData.get('address'),
                    amount: parseInt(formData.get('amount'))
                };
                
                try {
                    const response = await fetch('/api/request', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    });
                    
                    if (response.ok) {
                        successMessage.style.display = 'block';
                        e.target.reset();
                    } else {
                        errorMessage.style.display = 'block';
                    }
                } catch (error) {
                    errorMessage.style.display = 'block';
                } finally {
                    button.disabled = false;
                    button.textContent = 'Request Test Tokens';
                }
            });
        </script>
    </body>
    </html>
  `);
});

// API endpoint for requesting tokens
app.post('/api/request', (req, res) => {
  const { address, amount } = req.body;
  
  // Validate input
  if (!address || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  if (amount < 1 || amount > 1000) {
    return res.status(400).json({ error: 'Invalid amount' });
  }
  
  // Simulate faucet dispensing
  const dispensedAmount = Math.floor(Math.random() * 100000) + 10000; // 10,000 to 110,000 RSA
  
  setTimeout(() => {
    // In a real implementation, this would send tokens to the blockchain
    console.log("Sending " + dispensedAmount + " RSA to " + address);
    
    res.json({ 
      success: true, 
      message: "Successfully sent " + dispensedAmount + " RSA CRYPTO (RSA) to " + address,
      transactionId: 'tx_' + Math.random().toString(36).substr(2, 9)
    });
  }, 2000);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'RSA Chain Faucet' });
});

app.listen(PORT, () => {
  console.log(`🚰 RSA Chain Faucet running on http://localhost:${PORT}`);
  console.log('📋 API endpoint: POST /api/request');
  console.log('🏥 Health check: GET /health');
}); 