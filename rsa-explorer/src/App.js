import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>🔍 RSA Chain Explorer</h1>
        <p>Blockchain data explorer for RSA Chain</p>
      </header>
      
      <main className="App-main">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Network Status</h3>
            <div className="stat-value">🟢 Online</div>
            <div className="stat-label">RSA Mainnet (RSA CRYPTO)</div>
          </div>
          
          <div className="stat-card">
            <h3>Latest Block</h3>
            <div className="stat-value">#1,234,567</div>
            <div className="stat-label">2 minutes ago</div>
          </div>
          
          <div className="stat-card">
            <h3>Total Transactions</h3>
            <div className="stat-value">45,678</div>
            <div className="stat-label">Last 24 hours</div>
          </div>
          
          <div className="stat-card">
            <h3>Active Accounts</h3>
            <div className="stat-value">1,234</div>
            <div className="stat-label">Total accounts</div>
          </div>
        </div>
        
        <div className="search-section">
          <h2>Search Blockchain</h2>
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Search by transaction hash, account ID, or asset code..."
              className="search-input"
            />
            <button className="search-button">Search</button>
          </div>
        </div>
        
        <div className="recent-transactions">
          <h2>Recent Transactions</h2>
          <div className="transaction-list">
            <div className="transaction-item">
              <div className="tx-hash">abc123...def456</div>
              <div className="tx-type">Payment</div>
              <div className="tx-amount">100,000 RSA CRYPTO (RSA)</div>
              <div className="tx-time">2 min ago</div>
            </div>
            <div className="transaction-item">
              <div className="tx-hash">ghi789...jkl012</div>
              <div className="tx-type">Asset Issuance</div>
              <div className="tx-amount">NEW TOKEN</div>
              <div className="tx-time">5 min ago</div>
            </div>
            <div className="transaction-item">
              <div className="tx-hash">mno345...pqr678</div>
              <div className="tx-type">Payment</div>
              <div className="tx-amount">50,000 RSA CRYPTO (RSA)</div>
              <div className="tx-time">8 min ago</div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="App-footer">
        <p>© 2025 RSA Chain Explorer | <a href="http://localhost:3000">Back to Main Site</a></p>
      </footer>
    </div>
  );
}

export default App; 