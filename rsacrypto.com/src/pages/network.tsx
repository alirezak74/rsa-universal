import Layout from '@/components/Layout'

export default function Network() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Network Status</h1>
        
        {/* Network Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Network Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-2">Network Name</h3>
              <p className="text-gray-600 dark:text-gray-300">RSA Mainnet</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-2">Native Token</h3>
              <p className="text-gray-600 dark:text-gray-300">RSA</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-2">Consensus Mechanism</h3>
              <p className="text-gray-600 dark:text-gray-300">FBA (Federated Byzantine Agreement)</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-2">Transaction Finality</h3>
              <p className="text-gray-600 dark:text-gray-300">2-5 seconds</p>
            </div>
          </div>
        </section>

        {/* Network Services */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Network Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-3">Blockchain Explorer</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Real-time blockchain data explorer for viewing transactions, accounts, and network statistics.
              </p>
              <a 
                href="http://localhost:4000" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
              >
                View Explorer
              </a>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-3">Testnet Faucet</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Get test tokens for development and testing on the RSA Chain testnet.
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

        {/* Validator Information */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Validator Information</h2>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              RSA Chain uses Federated Byzantine Agreement (FBA) consensus, similar to Stellar. 
              Validators participate in the consensus process to secure the network.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <h4 className="font-semibold mb-2">Consensus Features:</h4>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                  <li>Fast finality (2-5 seconds)</li>
                  <li>Low energy consumption</li>
                  <li>High transaction throughput</li>
                  <li>Decentralized validation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Network Security:</h4>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                  <li>Byzantine fault tolerance</li>
                  <li>Cryptographic security</li>
                  <li>Distributed consensus</li>
                  <li>Real-time validation</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Network Statistics */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Network Statistics</h2>
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Real-time network statistics will be displayed here once the network is live.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">Coming Soon</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total Transactions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">Coming Soon</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Active Accounts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">Coming Soon</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Network Uptime</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
} 