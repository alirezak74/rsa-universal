// RSA SDK JavaScript - Complete Implementation
// Compatible with RSA Chain blockchain network

const crypto = require('crypto');
const axios = require('axios');

class RSAKeypair {
  constructor(publicKey, privateKey) {
    this.publicKey = publicKey;
    this.privateKey = privateKey;
  }

  /**
   * Generate a new RSA keypair
   */
  static random() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    return new RSAKeypair(publicKey, privateKey);
  }

  /**
   * Create keypair from secret key
   */
  static fromSecret(secret) {
    try {
      // Extract public key from private key
      const publicKey = crypto.createPublicKey(secret);
      return new RSAKeypair(
        publicKey.export({ type: 'spki', format: 'pem' }),
        secret
      );
    } catch (error) {
      throw new Error('Invalid secret key format');
    }
  }

  /**
   * Get public key in RSA format
   */
  publicKey() {
    // Convert PEM to RSA format
    const keyData = this.publicKey
      .replace(/-----BEGIN PUBLIC KEY-----/, '')
      .replace(/-----END PUBLIC KEY-----/, '')
      .replace(/\s/g, '');
    
    return 'RSA' + crypto.createHash('sha256').update(keyData).digest('hex').substring(0, 53).toUpperCase();
  }

  /**
   * Get secret key in RSA format
   */
  secret() {
    const keyData = this.privateKey
      .replace(/-----BEGIN PRIVATE KEY-----/, '')
      .replace(/-----END PRIVATE KEY-----/, '')
      .replace(/\s/g, '');
    
    return 'RSAPRIV' + crypto.createHash('sha256').update(keyData).digest('hex').substring(0, 49).toUpperCase();
  }

  /**
   * Sign data with private key
   */
  sign(data) {
    try {
      const signature = crypto.sign('sha256', Buffer.from(data), this.privateKey);
      return signature.toString('base64');
    } catch (error) {
      throw new Error('Failed to sign data');
    }
  }

  /**
   * Verify signature with public key
   */
  verify(data, signature) {
    try {
      return crypto.verify('sha256', Buffer.from(data), this.publicKey, Buffer.from(signature, 'base64'));
    } catch (error) {
      return false;
    }
  }
}

class RSAAsset {
  constructor(code, issuer) {
    this.code = code;
    this.issuer = issuer;
  }

  /**
   * Create native RSA asset
   */
  static native() {
    return new RSAAsset('RSA', null);
  }

  /**
   * Check if asset is native
   */
  isNative() {
    return this.code === 'RSA' && !this.issuer;
  }

  /**
   * Get asset string representation
   */
  toString() {
    return this.isNative() ? 'RSA' : `${this.code}:${this.issuer}`;
  }
}

class RSAOperation {
  /**
   * Create payment operation
   */
  static payment(options) {
    return {
      type: 'payment',
      destination: options.destination,
      asset: options.asset,
      amount: options.amount,
      source: options.source
    };
  }

  /**
   * Create create account operation
   */
  static createAccount(options) {
    return {
      type: 'createAccount',
      destination: options.destination,
      startingBalance: options.startingBalance,
      source: options.source
    };
  }

  /**
   * Create path payment operation
   */
  static pathPaymentStrictReceive(options) {
    return {
      type: 'pathPaymentStrictReceive',
      sendAsset: options.sendAsset,
      sendMax: options.sendMax,
      destination: options.destination,
      destAsset: options.destAsset,
      destAmount: options.destAmount,
      path: options.path || [],
      source: options.source
    };
  }

  /**
   * Create manage offer operation
   */
  static manageBuyOffer(options) {
    return {
      type: 'manageBuyOffer',
      selling: options.selling,
      buying: options.buying,
      buyAmount: options.buyAmount,
      price: options.price,
      offerId: options.offerId || 0,
      source: options.source
    };
  }

  /**
   * Create manage sell offer operation
   */
  static manageSellOffer(options) {
    return {
      type: 'manageSellOffer',
      selling: options.selling,
      buying: options.buying,
      amount: options.amount,
      price: options.price,
      offerId: options.offerId || 0,
      source: options.source
    };
  }

  /**
   * Create trust line operation
   */
  static changeTrust(options) {
    return {
      type: 'changeTrust',
      asset: options.asset,
      limit: options.limit,
      source: options.source
    };
  }
}

class RSAAccount {
  constructor(accountId, sequence, balances = []) {
    this.accountId = accountId;
    this.sequence = sequence;
    this.balances = balances;
  }

  /**
   * Increment sequence number
   */
  incrementSequenceNumber() {
    this.sequence = (parseInt(this.sequence) + 1).toString();
    return this;
  }

  /**
   * Get balance for specific asset
   */
  getBalance(asset) {
    const balance = this.balances.find(b => {
      if (asset.isNative()) {
        return b.asset_type === 'native';
      }
      return b.asset_code === asset.code && b.asset_issuer === asset.issuer;
    });
    return balance ? balance.balance : '0';
  }
}

class RSATransactionBuilder {
  constructor(sourceAccount, options = {}) {
    this.sourceAccount = sourceAccount;
    this.operations = [];
    this.fee = options.fee || RSAServer.BASE_FEE;
    this.networkPassphrase = options.networkPassphrase || RSANetworks.TESTNET;
    this.timeBounds = null;
  }

  /**
   * Add operation to transaction
   */
  addOperation(operation) {
    this.operations.push(operation);
    return this;
  }

  /**
   * Set timeout for transaction
   */
  setTimeout(timeout) {
    const now = Math.floor(Date.now() / 1000);
    this.timeBounds = {
      minTime: 0,
      maxTime: now + timeout
    };
    return this;
  }

  /**
   * Build the transaction
   */
  build() {
    const transaction = new RSATransaction({
      source: this.sourceAccount.accountId,
      fee: this.fee,
      sequence: this.sourceAccount.sequence,
      operations: this.operations,
      timeBounds: this.timeBounds,
      networkPassphrase: this.networkPassphrase
    });

    // Increment sequence number
    this.sourceAccount.incrementSequenceNumber();

    return transaction;
  }
}

class RSATransaction {
  constructor(options) {
    this.source = options.source;
    this.fee = options.fee;
    this.sequence = options.sequence;
    this.operations = options.operations;
    this.timeBounds = options.timeBounds;
    this.networkPassphrase = options.networkPassphrase;
    this.signatures = [];
  }

  /**
   * Sign transaction with keypair
   */
  sign(keypair) {
    const txData = this.toXDR();
    const signature = keypair.sign(txData);
    this.signatures.push({
      signature: signature,
      publicKey: keypair.publicKey()
    });
    return this;
  }

  /**
   * Convert transaction to XDR format
   */
  toXDR() {
    const txData = {
      source: this.source,
      fee: this.fee,
      sequence: this.sequence,
      operations: this.operations,
      timeBounds: this.timeBounds,
      networkPassphrase: this.networkPassphrase
    };
    
    // Convert to JSON string for signing (simplified XDR)
    return JSON.stringify(txData);
  }

  /**
   * Get transaction hash
   */
  hash() {
    const txData = this.toXDR();
    return crypto.createHash('sha256').update(txData).digest('hex');
  }
}

class RSAServer {
  constructor(serverUrl, options = {}) {
    this.serverUrl = serverUrl || 'http://localhost:8000';
    this.timeout = options.timeout || 30000;
  }

  /**
   * Load account from network
   */
  async loadAccount(accountId) {
    try {
      const response = await axios.get(`${this.serverUrl}/accounts/${accountId}`, {
        timeout: this.timeout
      });

      return new RSAAccount(
        response.data.account_id,
        response.data.sequence,
        response.data.balances
      );
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new Error('Account not found');
      }
      throw new Error(`Failed to load account: ${error.message}`);
    }
  }

  /**
   * Submit transaction to network
   */
  async submitTransaction(transaction) {
    try {
      const response = await axios.post(`${this.serverUrl}/transactions`, {
        tx: transaction.toXDR(),
        signatures: transaction.signatures
      }, {
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to submit transaction: ${error.message}`);
    }
  }

  /**
   * Get account transactions
   */
  async transactions() {
    return new TransactionCallBuilder(this.serverUrl);
  }

  /**
   * Get account payments
   */
  async payments() {
    return new PaymentCallBuilder(this.serverUrl);
  }

  /**
   * Get account offers
   */
  async offers() {
    return new OfferCallBuilder(this.serverUrl);
  }

  /**
   * Get account assets
   */
  async assets() {
    return new AssetCallBuilder(this.serverUrl);
  }

  /**
   * Get ledgers
   */
  async ledgers() {
    return new LedgerCallBuilder(this.serverUrl);
  }

  /**
   * Stream account updates
   */
  streamAccount(accountId, callback) {
    // WebSocket or EventSource implementation for real-time updates
    const eventSource = new EventSource(`${this.serverUrl}/accounts/${accountId}/stream`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };

    eventSource.onerror = (error) => {
      console.error('Stream error:', error);
    };

    return eventSource;
  }
}

// Call builders for API endpoints
class CallBuilder {
  constructor(serverUrl, endpoint) {
    this.serverUrl = serverUrl;
    this.endpoint = endpoint;
    this.params = {};
  }

  limit(limit) {
    this.params.limit = limit;
    return this;
  }

  order(direction) {
    this.params.order = direction;
    return this;
  }

  cursor(cursor) {
    this.params.cursor = cursor;
    return this;
  }

  async call() {
    const params = new URLSearchParams(this.params);
    const url = `${this.serverUrl}${this.endpoint}?${params}`;
    
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw new Error(`API call failed: ${error.message}`);
    }
  }

  async stream(callback) {
    const params = new URLSearchParams({ ...this.params, stream: 'true' });
    const url = `${this.serverUrl}${this.endpoint}?${params}`;
    
    const eventSource = new EventSource(url);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };

    return eventSource;
  }
}

class TransactionCallBuilder extends CallBuilder {
  constructor(serverUrl) {
    super(serverUrl, '/transactions');
  }

  forAccount(accountId) {
    this.endpoint = `/accounts/${accountId}/transactions`;
    return this;
  }

  includeFailed(include) {
    this.params.include_failed = include;
    return this;
  }
}

class PaymentCallBuilder extends CallBuilder {
  constructor(serverUrl) {
    super(serverUrl, '/payments');
  }

  forAccount(accountId) {
    this.endpoint = `/accounts/${accountId}/payments`;
    return this;
  }
}

class OfferCallBuilder extends CallBuilder {
  constructor(serverUrl) {
    super(serverUrl, '/offers');
  }

  forAccount(accountId) {
    this.endpoint = `/accounts/${accountId}/offers`;
    return this;
  }
}

class AssetCallBuilder extends CallBuilder {
  constructor(serverUrl) {
    super(serverUrl, '/assets');
  }

  forCode(assetCode) {
    this.params.asset_code = assetCode;
    return this;
  }

  forIssuer(assetIssuer) {
    this.params.asset_issuer = assetIssuer;
    return this;
  }
}

class LedgerCallBuilder extends CallBuilder {
  constructor(serverUrl) {
    super(serverUrl, '/ledgers');
  }
}

// Network configurations
const RSANetworks = {
  TESTNET: 'RSA Chain Testnet ; July 2024',
  MAINNET: 'RSA Chain Mainnet ; July 2024'
};

// Constants
RSAServer.BASE_FEE = '100'; // 100 stroops = 0.00001 RSA

// Export everything
module.exports = {
  Keypair: RSAKeypair,
  Asset: RSAAsset,
  Operation: RSAOperation,
  Account: RSAAccount,
  TransactionBuilder: RSATransactionBuilder,
  Transaction: RSATransaction,
  Server: RSAServer,
  Networks: RSANetworks,
  BASE_FEE: RSAServer.BASE_FEE,
  
  // Call builders
  TransactionCallBuilder,
  PaymentCallBuilder,
  OfferCallBuilder,
  AssetCallBuilder,
  LedgerCallBuilder
}; 