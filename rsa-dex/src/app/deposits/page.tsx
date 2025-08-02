'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { useWalletStore } from '@/store/walletStore'
import { useTradingStore } from '@/store/tradingStore'
import { Copy, Check, RefreshCw, ExternalLink, AlertCircle, CheckCircle, Clock, Bitcoin } from 'lucide-react'

interface DepositAddress {
  network: string
  address: string
  qrCode?: string
}

interface DepositStatus {
  txHash?: string
  confirmations: number
  requiredConfirmations: number
  status: 'pending' | 'confirming' | 'completed' | 'failed'
  amount?: number
  wrappedAmount?: number
}

const SUPPORTED_NETWORKS = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    wrappedSymbol: 'rBTC',
    icon: '₿',
    confirmations: 3,
    explorerUrl: 'https://blockstream.info/tx/',
    description: 'Deposit Bitcoin to receive rBTC on RSA Chain'
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    wrappedSymbol: 'rETH',
    icon: 'Ξ',
    confirmations: 12,
    explorerUrl: 'https://etherscan.io/tx/',
    description: 'Deposit Ethereum to receive rETH on RSA Chain'
  },
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    wrappedSymbol: 'rSOL',
    icon: '◎',
    confirmations: 32,
    explorerUrl: 'https://solscan.io/tx/',
    description: 'Deposit Solana to receive rSOL on RSA Chain'
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    symbol: 'AVAX',
    wrappedSymbol: 'rAVAX',
    icon: '🔺',
    confirmations: 10,
    explorerUrl: 'https://snowtrace.io/tx/',
    description: 'Deposit AVAX to receive rAVAX on RSA Chain'
  },
  {
    id: 'bsc',
    name: 'Binance Smart Chain',
    symbol: 'BNB',
    wrappedSymbol: 'rBNB',
    icon: '🟡',
    confirmations: 15,
    explorerUrl: 'https://bscscan.com/tx/',
    description: 'Deposit BNB to receive rBNB on RSA Chain'
  },
  {
    id: 'usdt',
    name: 'Tether USD',
    symbol: 'USDT',
    wrappedSymbol: 'rUSDT',
    icon: '₮',
    confirmations: 12,
    explorerUrl: 'https://etherscan.io/tx/',
    description: 'Deposit USDT to receive rUSDT on RSA Chain'
  },
  {
    id: 'usdc',
    name: 'USD Coin',
    symbol: 'USDC',
    wrappedSymbol: 'rUSDC',
    icon: '🔵',
    confirmations: 12,
    explorerUrl: 'https://etherscan.io/tx/',
    description: 'Deposit USDC to receive rUSDC on RSA Chain'
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    wrappedSymbol: 'rMATIC',
    icon: '🔷',
    confirmations: 20,
    explorerUrl: 'https://polygonscan.com/tx/',
    description: 'Deposit MATIC to receive rMATIC on RSA Chain'
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    symbol: 'ARB',
    wrappedSymbol: 'rARB',
    icon: '🔵',
    confirmations: 5,
    explorerUrl: 'https://arbiscan.io/tx/',
    description: 'Deposit ARB to receive rARB on RSA Chain'
  },
  {
    id: 'fantom',
    name: 'Fantom',
    symbol: 'FTM',
    wrappedSymbol: 'rFTM',
    icon: '👻',
    confirmations: 10,
    explorerUrl: 'https://ftmscan.com/tx/',
    description: 'Deposit FTM to receive rFTM on RSA Chain'
  },
  {
    id: 'linea',
    name: 'Linea',
    symbol: 'ETH',
    wrappedSymbol: 'rLINEA',
    icon: '🟢',
    confirmations: 12,
    explorerUrl: 'https://lineascan.build/tx/',
    description: 'Deposit ETH on Linea to receive rLINEA on RSA Chain'
  },
  {
    id: 'unichain',
    name: 'Unichain',
    symbol: 'UNI',
    wrappedSymbol: 'rUNI',
    icon: '🦄',
    confirmations: 8,
    explorerUrl: 'https://unichain.org/tx/',
    description: 'Deposit UNI to receive rUNI on RSA Chain'
  },
  {
    id: 'opbnb',
    name: 'opBNB',
    symbol: 'BNB',
    wrappedSymbol: 'rOPBNB',
    icon: '⚡',
    confirmations: 5,
    explorerUrl: 'https://opbnbscan.com/tx/',
    description: 'Deposit BNB on opBNB to receive rOPBNB on RSA Chain'
  },
  {
    id: 'base',
    name: 'Base',
    symbol: 'ETH',
    wrappedSymbol: 'rBASE',
    icon: '🔵',
    confirmations: 10,
    explorerUrl: 'https://basescan.org/tx/',
    description: 'Deposit ETH on Base to receive rBASE on RSA Chain'
  },
  {
    id: 'polygon-zkevm',
    name: 'Polygon zkEVM',
    symbol: 'ETH',
    wrappedSymbol: 'rZKEVM',
    icon: '⚡',
    confirmations: 15,
    explorerUrl: 'https://zkevm.polygonscan.com/tx/',
    description: 'Deposit ETH on Polygon zkEVM to receive rZKEVM on RSA Chain'
  }
]

export default function DepositsPage() {
  const { isConnected, wallet, connectWallet } = useWalletStore()
  const { syncAssetsFromAdmin } = useTradingStore()
  
  const [selectedNetwork, setSelectedNetwork] = useState(SUPPORTED_NETWORKS[0])
  const [depositAddress, setDepositAddress] = useState<DepositAddress | null>(null)
  const [depositStatus, setDepositStatus] = useState<DepositStatus | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [monitoringTx, setMonitoringTx] = useState(false)

  useEffect(() => {
    syncAssetsFromAdmin()
  }, [syncAssetsFromAdmin])

  const generateDepositAddress = async () => {
    if (!isConnected || !wallet) {
      alert('Please connect your wallet first')
      return
    }

    setLoading(true)
    try {
      // Call backend to generate deposit address
      const response = await fetch('http://localhost:8001/api/deposits/generate-address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: wallet.address,
          network: selectedNetwork.id,
          symbol: selectedNetwork.symbol
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate deposit address')
      }

      const data = await response.json()
      setDepositAddress({
        network: selectedNetwork.name,
        address: data.address,
        qrCode: data.qrCode
      })
    } catch (error) {
      console.error('Error generating deposit address:', error)
      alert('Failed to generate deposit address. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const checkDepositStatus = async (txHash: string) => {
    setMonitoringTx(true)
    try {
      const response = await fetch(`http://localhost:8001/api/deposits/status/${txHash}`)
      if (response.ok) {
        const status = await response.json()
        setDepositStatus(status)
      }
    } catch (error) {
      console.error('Error checking deposit status:', error)
    } finally {
      setMonitoringTx(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'confirming':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300'
      case 'confirming':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300'
      case 'completed':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300'
      case 'failed':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto text-center py-12">
            <Bitcoin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Connect Your Wallet to Start Depositing
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Connect your RSA wallet to deposit cryptocurrencies and receive wrapped tokens
            </p>
            
            <button
              onClick={() => connectWallet('RSA Wallet')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Cross-Chain Deposits
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Deposit cryptocurrencies from other blockchains and receive wrapped tokens on RSA Chain
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Network Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Select Network
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Choose the cryptocurrency you want to deposit
                </p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 gap-3">
                  {SUPPORTED_NETWORKS.map((network) => (
                    <button
                      key={network.id}
                      onClick={() => {
                        setSelectedNetwork(network)
                        setDepositAddress(null)
                        setDepositStatus(null)
                      }}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedNetwork.id === network.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{network.icon}</span>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {network.name} ({network.symbol})
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Receive {network.wrappedSymbol} • {network.confirmations} confirmations
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            1:1 Ratio
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Deposit Instructions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Deposit {selectedNetwork.symbol}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  {selectedNetwork.description}
                </p>
              </div>
              
              <div className="p-6">
                {!depositAddress ? (
                  <div className="text-center">
                    <div className="text-6xl mb-4">{selectedNetwork.icon}</div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Generate Deposit Address
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Click below to generate a unique deposit address for {selectedNetwork.name}
                    </p>
                    
                    <button
                      onClick={generateDepositAddress}
                      disabled={loading}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        `Generate ${selectedNetwork.symbol} Address`
                      )}
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Send {selectedNetwork.symbol} to this address:
                      </h3>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="font-mono text-sm text-gray-900 dark:text-white break-all mr-4">
                            {depositAddress.address}
                          </div>
                          <button
                            onClick={() => copyToClipboard(depositAddress.address)}
                            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex-shrink-0"
                          >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
                        <div className="text-sm">
                          <div className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                            Important Instructions:
                          </div>
                          <ul className="text-yellow-700 dark:text-yellow-300 space-y-1">
                            <li>• Only send {selectedNetwork.symbol} to this address</li>
                            <li>• Minimum deposit: 0.001 {selectedNetwork.symbol}</li>
                            <li>• Requires {selectedNetwork.confirmations} network confirmations</li>
                            <li>• You will receive {selectedNetwork.wrappedSymbol} at 1:1 ratio</li>
                          </ul>
                        </div>
                      </div>

                      <div className="text-center">
                        <button
                          onClick={generateDepositAddress}
                          className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                        >
                          Generate New Address
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Deposit Status */}
          {depositStatus && (
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Deposit Status
                </h2>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {getStatusIcon(depositStatus.status)}
                    <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(depositStatus.status)}`}>
                      {depositStatus.status.charAt(0).toUpperCase() + depositStatus.status.slice(1)}
                    </span>
                  </div>
                  
                  {depositStatus.txHash && (
                    <a
                      href={`${selectedNetwork.explorerUrl}${depositStatus.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View Transaction
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {depositStatus.confirmations}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Confirmations
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {depositStatus.requiredConfirmations}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Required
                    </div>
                  </div>
                  
                  {depositStatus.amount && (
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {depositStatus.amount}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedNetwork.symbol}
                      </div>
                    </div>
                  )}
                  
                  {depositStatus.wrappedAmount && (
                    <div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {depositStatus.wrappedAmount}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedNetwork.wrappedSymbol}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* How It Works */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                How Cross-Chain Deposits Work
              </h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">1️⃣</span>
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Generate Address</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Generate a unique deposit address for the cryptocurrency you want to deposit
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">2️⃣</span>
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Send Crypto</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Send your cryptocurrency to the generated address from any wallet or exchange
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">3️⃣</span>
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Receive Wrapped Tokens</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    After confirmations, receive wrapped tokens in your RSA wallet at 1:1 ratio
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}