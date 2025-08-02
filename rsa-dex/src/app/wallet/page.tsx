'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { useTradingStore } from '@/store/tradingStore'
import { useWalletStore } from '@/store/walletStore'
import { Wallet, Send, Download, Upload, Copy, Check, RefreshCw, Eye, EyeOff, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react'
import { Asset } from '@/types'
import Link from 'next/link'

export default function WalletPage() {
  const { assets, syncAssetsFromAdmin, syncPrices } = useTradingStore()
  const { 
    wallet, 
    isConnected, 
    refreshBalances, 
    getBalance,
    connectWallet,
    disconnect
  } = useWalletStore()
  
  const [copied, setCopied] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'send' | 'receive'>('overview')
  const [showBalances, setShowBalances] = useState(true)
  const [loading, setLoading] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [sendAmount, setSendAmount] = useState('')
  const [recipientAddress, setRecipientAddress] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Sync assets and balances on component mount
  useEffect(() => {
    syncAssetsFromAdmin()
    if (isConnected) {
      refreshBalances()
    }
  }, [syncAssetsFromAdmin, refreshBalances, isConnected])

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleRefresh = async () => {
    setLoading(true)
    try {
      await Promise.all([
        syncAssetsFromAdmin(),
        syncPrices(),
        isConnected ? refreshBalances() : Promise.resolve()
      ])
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  }

  const formatBalance = (balance: number, decimals: number = 6) => {
    return balance.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals,
    })
  }

  const calculateTotalValue = () => {
    if (!wallet || !showBalances) return 0
    
    return assets.reduce((total, asset) => {
      const balance = getBalance(asset.symbol)
      return total + (balance * asset.price)
    }, 0)
  }

  const getVisibleAssets = () => {
    return assets.filter(asset => 
      asset.visibilitySettings.wallets && 
      asset.status === 'active' &&
      (searchTerm === '' || 
       asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }

  const handleConnectWallet = async (provider: string) => {
    const success = await connectWallet(provider)
    if (success) {
      await refreshBalances()
    }
  }

  const handleSendTransaction = async () => {
    if (!selectedAsset || !sendAmount || !recipientAddress) return
    
    // Mock transaction for demo
    const amount = parseFloat(sendAmount)
    if (amount > getBalance(selectedAsset.symbol)) {
      alert('Insufficient balance')
      return
    }
    
    // Simulate transaction
    alert(`Sending ${amount} ${selectedAsset.symbol} to ${recipientAddress}`)
    setSendAmount('')
    setRecipientAddress('')
    setSelectedAsset(null)
    setActiveTab('overview')
  }

  if (!isConnected || !wallet) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto text-center py-12">
            <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Connect your wallet to view balances and manage your assets
            </p>
            
            {/* Wallet Connection Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
              <button
                onClick={() => handleConnectWallet('RSA Wallet')}
                className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span className="text-2xl mr-3">🔗</span>
                <div className="text-left">
                  <div className="font-medium">RSA Wallet</div>
                  <div className="text-sm opacity-90">Native RSA Chain</div>
                </div>
              </button>
              
              <button
                onClick={() => handleConnectWallet('Freighter')}
                className="flex items-center justify-center p-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <span className="text-2xl mr-3">🦊</span>
                <div className="text-left">
                  <div className="font-medium">Freighter</div>
                  <div className="text-sm opacity-90">Stellar Extension</div>
                </div>
              </button>
              
              <button
                onClick={() => handleConnectWallet('Albedo')}
                className="flex items-center justify-center p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <span className="text-2xl mr-3">🌅</span>
                <div className="text-left">
                  <div className="font-medium">Albedo</div>
                  <div className="text-sm opacity-90">Web Wallet</div>
                </div>
              </button>
              
              <button
                onClick={() => handleConnectWallet('Ledger')}
                className="flex items-center justify-center p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <span className="text-2xl mr-3">🔒</span>
                <div className="text-left">
                  <div className="font-medium">Ledger</div>
                  <div className="text-sm opacity-90">Hardware Wallet</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const visibleAssets = getVisibleAssets()
  const totalValue = calculateTotalValue()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Wallet Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mr-3">
                      My Wallet
                    </h1>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                      {wallet.provider}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                        Address:
                      </span>
                      <span className="text-sm font-mono text-gray-900 dark:text-white">
                        {wallet.address.slice(0, 8)}...{wallet.address.slice(-8)}
                      </span>
                      <button
                        onClick={() => copyToClipboard(wallet.address, 'address')}
                        className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {copied === 'address' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                        Network:
                      </span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {wallet.network}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowBalances(!showBalances)}
                    className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    title={showBalances ? 'Hide balances' : 'Show balances'}
                  >
                    {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  
                  <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                  
                  <button
                    onClick={disconnect}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
              
              {/* Total Portfolio Value */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Portfolio Value</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {showBalances ? formatPrice(totalValue) : '••••••'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-6">
                {[
                  { key: 'overview', label: 'Overview', icon: Wallet },
                  { key: 'send', label: 'Send', icon: Send },
                  { key: 'receive', label: 'Receive', icon: Upload }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.key
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div>
                  {/* Search */}
                  <div className="mb-6">
                    <input
                      type="text"
                      placeholder="Search assets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Assets List */}
                  <div className="space-y-4">
                    {visibleAssets.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-gray-500 dark:text-gray-400">
                          No assets found
                        </div>
                      </div>
                    ) : (
                      visibleAssets.map((asset) => {
                        const balance = getBalance(asset.symbol)
                        const value = balance * asset.price
                        const change24h = asset.metadata?.change24h || 0
                        
                        return (
                          <div
                            key={asset.id}
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          >
                            <div className="flex items-center">
                              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 mr-4 text-xl">
                                {asset.icon}
                              </div>
                              
                              <div>
                                <div className="flex items-center">
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {asset.name}
                                  </div>
                                  <div className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                    {asset.symbol}
                                  </div>
                                </div>
                                
                                <div className="flex items-center mt-1">
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {formatPrice(asset.price)}
                                  </div>
                                  
                                  <div className={`ml-2 flex items-center text-sm ${
                                    change24h >= 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {change24h >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                    {Math.abs(change24h).toFixed(2)}%
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {showBalances ? formatBalance(balance, asset.decimals) : '••••••'} {asset.symbol}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {showBalances ? formatPrice(value) : '••••••'}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={() => {
                                  setSelectedAsset(asset)
                                  setActiveTab('send')
                                }}
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                              >
                                Send
                              </button>
                              
                              <Link
                                href="/exchange"
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                              >
                                Trade
                              </Link>
                              
                              {asset.contractAddress && (
                                <a
                                  href={asset.metadata?.explorer}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                  title="View on Explorer"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Send Tab */}
              {activeTab === 'send' && (
                <div className="max-w-md mx-auto">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Send Assets</h3>
                  
                  <div className="space-y-4">
                    {/* Asset Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Asset
                      </label>
                      <select
                        value={selectedAsset?.id || ''}
                        onChange={(e) => {
                          const asset = assets.find(a => a.id === e.target.value)
                          setSelectedAsset(asset || null)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Select an asset</option>
                        {visibleAssets.map((asset) => (
                          <option key={asset.id} value={asset.id}>
                            {asset.name} ({asset.symbol}) - Balance: {formatBalance(getBalance(asset.symbol), asset.decimals)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Recipient Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Recipient Address
                      </label>
                      <input
                        type="text"
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        placeholder="Enter recipient address..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Amount
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={sendAmount}
                          onChange={(e) => setSendAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        {selectedAsset && (
                          <button
                            onClick={() => setSendAmount(getBalance(selectedAsset.symbol).toString())}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700 text-sm"
                          >
                            Max
                          </button>
                        )}
                      </div>
                      {selectedAsset && (
                        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Available: {formatBalance(getBalance(selectedAsset.symbol), selectedAsset.decimals)} {selectedAsset.symbol}
                        </div>
                      )}
                    </div>

                    {/* Send Button */}
                    <button
                      onClick={handleSendTransaction}
                      disabled={!selectedAsset || !sendAmount || !recipientAddress}
                      className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Send Transaction
                    </button>
                  </div>
                </div>
              )}

              {/* Receive Tab */}
              {activeTab === 'receive' && (
                <div className="max-w-md mx-auto text-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Receive Assets</h3>
                  
                  <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Your Address</div>
                    <div className="font-mono text-gray-900 dark:text-white break-all mb-4">
                      {wallet.address}
                    </div>
                    
                    <button
                      onClick={() => copyToClipboard(wallet.address, 'receive-address')}
                      className="flex items-center justify-center mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {copied === 'receive-address' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                      Copy Address
                    </button>
                  </div>
                  
                  <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                    Send assets to this address to add them to your wallet. Make sure the sender uses the correct network ({wallet.network}).
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 