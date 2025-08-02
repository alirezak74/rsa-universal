import React, { useState, useEffect } from 'react';
import './App.css';

// Simple RSA key generation (in production, use a proper crypto library)
const generateRSAKeyPair = () => {
  // This is a simplified version - in production use proper RSA implementation
  const privateKey = 'rsa_private_' + Math.random().toString(36).substr(2, 9);
  const publicKey = 'rsa_public_' + Math.random().toString(36).substr(2, 9);
  const address = 'RSA' + Math.random().toString(36).substr(2, 15).toUpperCase();
  
  return { privateKey, publicKey, address };
};

// Simple encryption (in production, use proper encryption)
const encryptPrivateKey = (privateKey, password) => {
  return btoa(privateKey + '_encrypted_' + password);
};

const decryptPrivateKey = (encryptedKey, password) => {
  try {
    const decoded = atob(encryptedKey);
    const parts = decoded.split('_encrypted_');
    if (parts[1] === password) {
      return parts[0];
    }
    return null;
  } catch {
    return null;
  }
};

function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState('0.00');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [showCreateWallet, setShowCreateWallet] = useState(false);
  const [showImportWallet, setShowImportWallet] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [privateKeyInput, setPrivateKeyInput] = useState('');
  const [walletData, setWalletData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load wallet from localStorage on component mount
  useEffect(() => {
    const savedWallet = localStorage.getItem('rsaWallet');
    if (savedWallet) {
      try {
        const wallet = JSON.parse(savedWallet);
        setWalletData(wallet);
        setWalletAddress(wallet.address);
        setIsConnected(true);
        // Load mock balance
        setBalance('1,234,567.89');
        // Load mock transactions
        setTransactions([
          { id: 1, type: 'received', amount: '100,000.00', from: 'RSAFAUCET', time: '2 hours ago' },
          { id: 2, type: 'sent', amount: '50,000.00', to: 'RSA123...XYZ', time: '1 day ago' }
        ]);
      } catch (e) {
        console.error('Error loading wallet:', e);
      }
    }
  }, []);

  const createWallet = () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    const keyPair = generateRSAKeyPair();
    const encryptedPrivateKey = encryptPrivateKey(keyPair.privateKey, password);
    
    const newWallet = {
      address: keyPair.address,
      publicKey: keyPair.publicKey,
      encryptedPrivateKey: encryptedPrivateKey,
      createdAt: new Date().toISOString()
    };

    // Save to localStorage
    localStorage.setItem('rsaWallet', JSON.stringify(newWallet));
    
    setWalletData(newWallet);
    setWalletAddress(newWallet.address);
    setIsConnected(true);
    setShowCreateWallet(false);
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('Wallet created successfully!');
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(''), 3000);
  };

  const importWallet = () => {
    if (!privateKeyInput.trim()) {
      setError('Please enter your private key');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    // In a real implementation, you would validate the private key format
    // and derive the public key and address from it
    const address = 'RSA' + Math.random().toString(36).substr(2, 15).toUpperCase();
    const encryptedPrivateKey = encryptPrivateKey(privateKeyInput, password);
    
    const importedWallet = {
      address: address,
      publicKey: 'imported_public_key',
      encryptedPrivateKey: encryptedPrivateKey,
      createdAt: new Date().toISOString(),
      imported: true
    };

    localStorage.setItem('rsaWallet', JSON.stringify(importedWallet));
    
    setWalletData(importedWallet);
    setWalletAddress(importedWallet.address);
    setIsConnected(true);
    setShowImportWallet(false);
    setPrivateKeyInput('');
    setPassword('');
    setError('');
    setSuccess('Wallet imported successfully!');
    
    setTimeout(() => setSuccess(''), 3000);
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress('');
    setBalance('0.00');
    setTransactions([]);
    setWalletData(null);
    // Note: We don't clear localStorage here to allow reconnection
  };

  const sendTransaction = () => {
    if (!recipient || !amount) {
      setError('Please fill in all fields');
      return;
    }
    if (parseFloat(amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    // In a real implementation, you would:
    // 1. Decrypt the private key
    // 2. Sign the transaction
    // 3. Submit to the network
    // 4. Wait for confirmation

    const newTransaction = {
      id: Date.now(),
      type: 'sent',
      amount: parseFloat(amount).toFixed(2),
      to: recipient,
      time: 'Just now',
      status: 'pending'
    };

    setTransactions([newTransaction, ...transactions]);
    setRecipient('');
    setAmount('');
    setError('');
    setSuccess(`Transaction sent: ${amount} RSA CRYPTO (RSA) to ${recipient}`);
    
    setTimeout(() => setSuccess(''), 3000);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setSuccess('Address copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>💼 RSA Chain Wallet</h1>
        <p>Secure wallet for RSA Chain network</p>
      </header>
      
      {/* Success/Error Messages */}
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}
      
      <main className="App-main">
        {!isConnected ? (
          <div className="connect-section">
            <h2>Welcome to RSA Chain Wallet</h2>
            <p>Create a new wallet or import an existing one to get started</p>
            
            <div className="wallet-options">
              <div className="option-card">
                <h3>🆕 Create New Wallet</h3>
                <p>Generate a new RSA key pair and wallet address</p>
                <button onClick={() => setShowCreateWallet(true)} className="primary-button">
                  Create Wallet
                </button>
              </div>
              
              <div className="option-card">
                <h3>📥 Import Wallet</h3>
                <p>Import an existing wallet using your private key</p>
                <button onClick={() => setShowImportWallet(true)} className="secondary-button">
                  Import Wallet
                </button>
              </div>
            </div>

            {/* Create Wallet Modal */}
            {showCreateWallet && (
              <div className="modal-overlay">
                <div className="modal">
                  <h3>Create New Wallet</h3>
                  <p>Set a strong password to encrypt your private key</p>
                  
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password (min 8 characters)"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="modal-buttons">
                    <button onClick={createWallet} className="primary-button">
                      Create Wallet
                    </button>
                    <button onClick={() => setShowCreateWallet(false)} className="secondary-button">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Import Wallet Modal */}
            {showImportWallet && (
              <div className="modal-overlay">
                <div className="modal">
                  <h3>Import Wallet</h3>
                  <p>Enter your private key and set a password</p>
                  
                  <div className="form-group">
                    <label>Private Key</label>
                    <textarea
                      value={privateKeyInput}
                      onChange={(e) => setPrivateKeyInput(e.target.value)}
                      placeholder="Enter your private key"
                      className="form-input"
                      rows="3"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password to encrypt private key"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="modal-buttons">
                    <button onClick={importWallet} className="primary-button">
                      Import Wallet
                    </button>
                    <button onClick={() => setShowImportWallet(false)} className="secondary-button">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="wallet-header">
              <div className="wallet-info">
                <div className="address-card">
                  <h3>Wallet Address</h3>
                  <div className="address">{walletAddress}</div>
                  <button onClick={copyAddress} className="copy-button">Copy</button>
                </div>
                
                <div className="balance-card">
                  <h3>Balance</h3>
                  <div className="balance">{balance} RSA CRYPTO (RSA)</div>
                  <div className="balance-usd">≈ $1,234,567.89 USD</div>
                </div>
              </div>
              
              <button onClick={disconnectWallet} className="disconnect-button">
                Disconnect
              </button>
            </div>
            
            <div className="send-section">
              <h2>Send RSA CRYPTO (RSA)</h2>
              <div className="send-form">
                <div className="form-group">
                  <label>Recipient Address</label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="Enter recipient address..."
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>Amount (RSA CRYPTO)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="form-input"
                  />
                </div>
                
                <button onClick={sendTransaction} className="send-button">
                  Send Transaction
                </button>
              </div>
            </div>
            
            <div className="transactions-section">
              <h2>Recent Transactions</h2>
              <div className="transaction-list">
                {transactions.length === 0 ? (
                  <p className="no-transactions">No transactions yet</p>
                ) : (
                  transactions.map(tx => (
                    <div key={tx.id} className="transaction-item">
                      <div className="tx-icon">{tx.type === 'sent' ? '📤' : '📥'}</div>
                      <div className="tx-details">
                        <div className="tx-type">{tx.type === 'sent' ? 'Sent' : 'Received'}</div>
                        <div className="tx-amount">
                          {tx.type === 'sent' ? '-' : '+'}{tx.amount} RSA CRYPTO (RSA)
                        </div>
                        <div className="tx-time">{tx.time}</div>
                      </div>
                      {tx.status && <div className={`tx-status ${tx.status}`}>{tx.status}</div>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </main>
      
      <footer className="App-footer">
        <p>© 2025 RSA Chain Wallet | <a href="http://localhost:3000">Back to Main Site</a></p>
      </footer>
    </div>
  );
}

export default App; 