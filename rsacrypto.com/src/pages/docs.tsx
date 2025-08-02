import Layout from '@/components/Layout'

export default function Docs() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Documentation</h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Welcome to the RSA Chain developer and integration documentation. 
          Find everything you need to build on RSA Chain.
        </p>

        {/* Documentation Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
            <ul className="space-y-3">
              <li>
                <a href="#installation" className="text-blue-600 hover:text-blue-700 flex items-center">
                  <span className="mr-2">📦</span>
                  Installation Guide
                </a>
              </li>
              <li>
                <a href="#quickstart" className="text-blue-600 hover:text-blue-700 flex items-center">
                  <span className="mr-2">⚡</span>
                  Quick Start Guide
                </a>
              </li>
              <li>
                <a href="#environment" className="text-blue-600 hover:text-blue-700 flex items-center">
                  <span className="mr-2">⚙️</span>
                  Environment Setup
                </a>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Development</h2>
            <ul className="space-y-3">
              <li>
                <a href="#api" className="text-blue-600 hover:text-blue-700 flex items-center">
                  <span className="mr-2">🔌</span>
                  API Reference
                </a>
              </li>
              <li>
                <a href="#sdk" className="text-blue-600 hover:text-blue-700 flex items-center">
                  <span className="mr-2">📚</span>
                  SDK Usage
                </a>
              </li>
              <li>
                <a href="#developer-guide" className="text-blue-600 hover:text-blue-700 flex items-center">
                  <span className="mr-2">👨‍💻</span>
                  Developer Guide
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Installation Guide */}
        <section id="installation" className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Installation Guide</h2>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Prerequisites</h3>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 mb-6">
              <li>Git</li>
              <li>Node.js (v16+ recommended)</li>
              <li>Go (v1.18+ recommended)</li>
              <li>CMake & a C++ compiler (for rsa-core)</li>
              <li>PostgreSQL (for Horizon and Faucet)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-4">Quick Setup</h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
              <code className="text-sm">
                git clone https://github.com/rsacrypt/rsachane.git<br/>
                cd rsachane<br/>
                cp .env.example .env<br/>
                # Edit .env with your configuration
              </code>
            </div>
          </div>
        </section>

        {/* API Reference */}
        <section id="api" className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">API Reference</h2>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              RSA Chain provides a Horizon-style API server for easy integration with your applications.
            </p>
            
            <h3 className="text-xl font-semibold mb-4">Core Endpoints</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold">Accounts</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">GET /accounts/&#123;account_id&#125;</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold">Transactions</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">GET /transactions/&#123;tx_hash&#125;</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold">Assets</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">GET /assets</p>
              </div>
            </div>
          </div>
        </section>

        {/* SDK Usage */}
        <section id="sdk" className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">SDK Usage</h2>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Use the JavaScript SDK to easily integrate RSA Chain into your applications.
            </p>
            
            <h3 className="text-xl font-semibold mb-4">Installation</h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
              <code className="text-sm">npm install @rsacrypt/sdk</code>
            </div>

            <h3 className="text-xl font-semibold mb-4">Basic Usage</h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <code className="text-sm">
                import RSAChain from '@rsacrypt/sdk';<br/><br/>
                const client = new RSAChain.Client({<br/>
                &nbsp;&nbsp;serverUrl: 'https://horizon.rsacrypto.com'<br/>
                });<br/><br/>
                // Get account details<br/>
                const account = await client.loadAccount('account_id');
              </code>
            </div>
          </div>
        </section>

        {/* Developer Resources */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Developer Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3">GitHub Repository</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Access the full source code and contribute to the project.
              </p>
              <a 
                href="https://github.com/rsacrypt/rsachane" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded transition-colors"
              >
                View on GitHub
              </a>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3">Testnet Faucet</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Get test tokens for development and testing.
              </p>
              <a 
                href="http://localhost:5000" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
              >
                Get Test Tokens
              </a>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
} 