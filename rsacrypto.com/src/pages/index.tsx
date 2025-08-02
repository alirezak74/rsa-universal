import Layout from '@/components/Layout'
import FeatureSection from '@/components/FeatureSection'
import Link from 'next/link'

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="text-center py-16">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          RSA Chain
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          A high-performance, secure, and decentralized blockchain network inspired by Stellar (XLM), 
          designed for instant, low-cost global payments and asset issuance.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/network" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
            Join Network
          </Link>
          <Link href="http://localhost:4000" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
            View Explorer
          </Link>
          <Link href="http://localhost:3001" target="_blank" rel="noopener noreferrer" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
            Download Wallet
          </Link>
        </div>
      </section>

      {/* Key Features */}
      <FeatureSection />

      {/* Network Info */}
      <section className="mt-16 bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">Network Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <h3 className="font-semibold text-lg">Network Name</h3>
            <p className="text-gray-600 dark:text-gray-300">RSA Mainnet</p>
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-lg">Native Token</h3>
            <p className="text-gray-600 dark:text-gray-300">RSA</p>
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-lg">Consensus</h3>
            <p className="text-gray-600 dark:text-gray-300">FBA</p>
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-lg">Finality</h3>
            <p className="text-gray-600 dark:text-gray-300">2-5 seconds</p>
          </div>
        </div>
      </section>

      {/* Repository Structure */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold mb-6 text-center">Project Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-2">Core Protocol</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-3">Core blockchain protocol forked from Stellar</p>
            <Link href="/developers" className="text-blue-600 hover:text-blue-700">Learn More →</Link>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-2">Horizon API</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-3">Horizon-style API server for developers</p>
            <Link href="/docs" className="text-blue-600 hover:text-blue-700">API Docs →</Link>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-2">Web Wallet</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-3">User-friendly web wallet interface</p>
            <Link href="/wallet" className="text-blue-600 hover:text-blue-700">Get Wallet →</Link>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-2">Blockchain Explorer</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-3">Real-time blockchain data explorer</p>
            <a href="http://localhost:4000" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">View Explorer →</a>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-2">Testnet Faucet</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-3">Get test tokens for development</p>
            <a href="http://localhost:5000" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">Get Test Tokens →</a>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-2">JavaScript SDK</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-3">Easy integration for developers</p>
            <Link href="/docs" className="text-blue-600 hover:text-blue-700">SDK Docs →</Link>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-2">Admin Panel</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-3">Network management and transaction control</p>
                            <a href="http://localhost:3001" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700">Admin Panel →</a>
          </div>
        </div>
      </section>
    </Layout>
  )
} 