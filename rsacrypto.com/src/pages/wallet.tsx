import Layout from '@/components/Layout'

export default function Wallet() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">RSA Chain Wallet</h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Secure, user-friendly wallet for managing your RSA tokens and assets on the RSA Chain network.
          Use our web wallet or configure external wallets to connect to RSA Chain.
        </p>

        {/* External Wallet Setup */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">External Wallet Setup</h2>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800 mb-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-200">Network Configuration</h3>
            <p className="text-blue-700 dark:text-blue-300 mb-4">
              To use RSA Chain with external wallets, you need to add it as a custom network with these settings:
            </p>
            <div className="bg-white dark:bg-gray-800 p-4 rounded border">
              <code className="text-sm text-gray-800 dark:text-gray-200">
                Network Name: RSA Chain<br/>
                RPC URL: https://rpc.rsachain.com<br/>
                Chain ID: 12345<br/>
                Currency Symbol: RSA<br/>
                Block Explorer: https://explorer.rsachain.com
              </code>
            </div>
          </div>

          {/* MetaMask Setup */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow mb-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <span className="text-2xl mr-3">🦊</span>
              MetaMask Setup
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</div>
                <div>
                  <h4 className="font-semibold">Add Custom Network</h4>
                  <p className="text-gray-600 dark:text-gray-300">Open MetaMask → Settings → Networks → Add Network</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</div>
                <div>
                  <h4 className="font-semibold">Enter Network Details</h4>
                  <p className="text-gray-600 dark:text-gray-300">Use the configuration details shown above</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</div>
                <div>
                  <h4 className="font-semibold">Import Your Wallet</h4>
                  <p className="text-gray-600 dark:text-gray-300">Export private key from RSA DEX and import into MetaMask</p>
                </div>
              </div>
            </div>
          </div>

          {/* WalletConnect Setup */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow mb-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <span className="text-2xl mr-3">🔗</span>
              WalletConnect Compatible Wallets
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Connect any WalletConnect-compatible wallet to RSA DEX:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="text-2xl mb-2">🌈</div>
                <div className="text-sm font-medium">Rainbow</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="text-2xl mb-2">🛡️</div>
                <div className="text-sm font-medium">Trust Wallet</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="text-2xl mb-2">🛡️</div>
                <div className="text-sm font-medium">Argent</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="text-2xl mb-2">🏛️</div>
                <div className="text-sm font-medium">Gnosis Safe</div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</div>
                <div>
                  <h4 className="font-semibold">Open WalletConnect</h4>
                  <p className="text-gray-600 dark:text-gray-300">Use your wallet's WalletConnect feature</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</div>
                <div>
                  <h4 className="font-semibold">Scan QR Code</h4>
                  <p className="text-gray-600 dark:text-gray-300">Scan the QR code from RSA DEX interface</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</div>
                <div>
                  <h4 className="font-semibold">Configure Network</h4>
                  <p className="text-gray-600 dark:text-gray-300">Add RSA Chain as custom network in your wallet</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hardware Wallets */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow mb-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <span className="text-2xl mr-3">🔒</span>
              Hardware Wallets
            </h3>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 mb-4">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                <strong>Note:</strong> Hardware wallet support depends on RSA Chain's compatibility with EVM standards.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Ledger</h4>
                <p className="text-gray-600 dark:text-gray-300">Check if RSA Chain has a dedicated app in Ledger Live</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Trezor</h4>
                <p className="text-gray-600 dark:text-gray-300">Use Trezor Suite to connect to RSA Chain network</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Connection Method</h4>
                <p className="text-gray-600 dark:text-gray-300">Use WalletConnect or direct connection through your hardware wallet's interface</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Start Guide */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Web Wallet Setup</h2>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-200">Step-by-Step Guide</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</div>
                <div>
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200">Launch the Web Wallet</h4>
                  <p className="text-blue-700 dark:text-blue-300">Click the "Launch Web Wallet" button below to open the RSA Chain wallet in a new tab.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</div>
                <div>
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200">Create a New Wallet</h4>
                  <p className="text-blue-700 dark:text-blue-300">Click "Create Wallet" and set a strong password (minimum 8 characters). Your private key will be encrypted and stored securely.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</div>
                <div>
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200">Save Your Recovery Information</h4>
                  <p className="text-blue-700 dark:text-blue-300">Write down your wallet address and keep your password safe. You'll need these to access your wallet.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">4</div>
                <div>
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200">Get Test Tokens</h4>
                  <p className="text-blue-700 dark:text-blue-300">Visit the <a href="http://localhost:5000" className="underline font-semibold">RSA Faucet</a> to get test tokens for your new wallet.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Wallet Features */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Wallet Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
              <div className="text-3xl mb-4">🔐</div>
              <h3 className="text-xl font-semibold mb-2">Secure Storage</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your private keys are encrypted and stored securely in your browser.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
              <div className="text-3xl mb-4">💸</div>
              <h3 className="text-xl font-semibold mb-2">Fast Transactions</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Send and receive RSA tokens with 2-5 second finality.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
              <div className="text-3xl mb-4">🌍</div>
              <h3 className="text-xl font-semibold mb-2">Multi-Asset Support</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Manage RSA tokens and other assets issued on the network.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
              <div className="text-3xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2">Cross-Platform</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Access your wallet from any device with a web browser.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
              <div className="text-3xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Transaction History</h3>
              <p className="text-gray-600 dark:text-gray-300">
                View detailed transaction history and account activity.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Low Fees</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Minimal transaction fees for all operations.
              </p>
            </div>
          </div>
        </section>

        {/* Download Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Get Started</h2>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-lg text-white text-center">
            <h3 className="text-2xl font-semibold mb-4">Ready to Start?</h3>
            <p className="text-lg mb-6 opacity-90">
              Launch the RSA Chain web wallet and start managing your digital assets today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="http://localhost:3001" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                🚀 Launch Web Wallet
              </a>
              <a 
                href="http://localhost:5000" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                🚰 Get Test Tokens
              </a>
              <a 
                href="https://github.com/rsacrypt/rsachain/tree/main/rsa-wallet-web" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                📁 View Source Code
              </a>
            </div>
          </div>
        </section>

        {/* Security Information */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Security</h2>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Security Features</h3>
            <ul className="space-y-3 text-gray-600 dark:text-gray-300">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Private keys never leave your device</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Client-side encryption and signing</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>No server-side key storage</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Open source and auditable code</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Secure connection to RSA Chain network</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Important Notes */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Important Notes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h3 className="text-xl font-semibold mb-3 text-yellow-800 dark:text-yellow-200">⚠️ Backup Your Wallet</h3>
              <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                Always keep a secure backup of your wallet address and password. If you lose access to your wallet, your funds cannot be recovered.
              </p>
              <ul className="text-yellow-700 dark:text-yellow-300 space-y-2 text-sm">
                <li>• Write down your wallet address</li>
                <li>• Store your password securely</li>
                <li>• Consider using a password manager</li>
                <li>• Never share your private key</li>
              </ul>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="text-xl font-semibold mb-3 text-green-800 dark:text-green-200">✅ Best Practices</h3>
              <p className="text-green-700 dark:text-green-300 mb-4">
                Follow these best practices to keep your wallet secure and functional.
              </p>
              <ul className="text-green-700 dark:text-green-300 space-y-2 text-sm">
                <li>• Use a strong, unique password</li>
                <li>• Keep your browser updated</li>
                <li>• Use HTTPS connections only</li>
                <li>• Test with small amounts first</li>
                <li>• Verify transaction details carefully</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Support */}
        <section>
          <h2 className="text-3xl font-semibold mb-6">Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3">Documentation</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Learn how to use the wallet and understand its features.
              </p>
              <a 
                href="/docs" 
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                View Documentation →
              </a>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3">Community</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Get help from the community and report issues.
              </p>
              <a 
                href="https://github.com/rsacrypt/rsachain/issues" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                GitHub Issues →
              </a>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
} 