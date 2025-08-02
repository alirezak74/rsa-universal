import Layout from '@/components/Layout'

export default function Developers() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Developers</h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Build powerful applications on RSA Chain. Everything you need to get started as a developer.
        </p>

        {/* Quick Start */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Quick Start</h2>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">1. Clone the Repository</h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
              <code className="text-sm">
                git clone https://github.com/rsacrypt/rsachane.git<br/>
                cd rsachane
              </code>
            </div>
            
            <h3 className="text-xl font-semibold mb-4">2. Set Up Environment</h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
              <code className="text-sm">
                cp .env.example .env<br/>
                # Edit .env with your configuration
              </code>
            </div>
            
            <h3 className="text-xl font-semibold mb-4">3. Run Components</h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <code className="text-sm">
                # Start core node<br/>
                cd rsa-core && mkdir build && cd build<br/>
                cmake .. && make -j4<br/>
                ./rsa-core --conf rsa.cfg<br/><br/>
                # Start Horizon API (new terminal)<br/>
                cd rsa-horizon && go run ./main.go
              </code>
            </div>
          </div>
        </section>

        {/* Development Tools */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Development Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3">Horizon API</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                RESTful API server for accessing blockchain data and submitting transactions.
              </p>
              <a 
                href="/docs" 
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                API Documentation →
              </a>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3">JavaScript SDK</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Easy-to-use SDK for integrating RSA Chain into your JavaScript applications.
              </p>
              <a 
                href="/docs" 
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                SDK Documentation →
              </a>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3">Testnet Faucet</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Get test tokens for development and testing your applications.
              </p>
              <a 
                href="http://localhost:5000" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Get Test Tokens →
              </a>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3">Blockchain Explorer</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Real-time blockchain data explorer for debugging and monitoring.
              </p>
              <a 
                href="http://localhost:4000" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                View Explorer →
              </a>
            </div>
          </div>
        </section>

        {/* Running Components */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Running Components</h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3">Core Node</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                The core blockchain protocol implementation.
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <code className="text-sm">
                  cd rsa-core<br/>
                  mkdir build && cd build<br/>
                  cmake ..<br/>
                  make -j4<br/>
                  ./rsa-core --conf ../rsa.cfg.example
                </code>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3">Horizon API Server</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                RESTful API server for blockchain data access.
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <code className="text-sm">
                  cd rsa-horizon<br/>
                  go run ./main.go
                </code>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3">Web Wallet</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                User-friendly web wallet interface.
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <code className="text-sm">
                  cd rsa-wallet-web<br/>
                  npm install<br/>
                  npm start
                </code>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3">Blockchain Explorer</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Real-time blockchain data explorer.
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <code className="text-sm">
                  cd rsa-explorer<br/>
                  npm install<br/>
                  npm start
                </code>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3">Testnet Faucet</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Service for distributing test tokens.
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <code className="text-sm">
                  cd rsa-faucet<br/>
                  npm install<br/>
                  node index.js
                </code>
              </div>
            </div>
          </div>
        </section>

        {/* Resources */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Resources</h2>
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
              <h3 className="text-xl font-semibold mb-3">Issue Tracker</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Report bugs, request features, and track development progress.
              </p>
              <a 
                href="https://github.com/rsacrypt/rsachane/issues" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
              >
                View Issues
              </a>
            </div>
          </div>
        </section>

        {/* Contributing */}
        <section>
          <h2 className="text-3xl font-semibold mb-6">Contributing</h2>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We welcome contributions from developers. To get started:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
              <li>Fork the repository</li>
              <li>Create a feature branch</li>
              <li>Make your changes</li>
              <li>Submit a pull request</li>
            </ol>
            <div className="mt-6">
              <a 
                href="https://github.com/rsacrypt/rsachane/blob/main/CONTRIBUTING.md" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Read Contributing Guidelines →
              </a>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
} 