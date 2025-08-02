'use client'

import { useState } from 'react'
import { Wallet, LogOut, Copy, Check } from 'lucide-react'
import { useWalletStore } from '@/store/walletStore'

export default function WalletConnect() {
  const [copied, setCopied] = useState(false)
  const { 
    isConnected, 
    isConnecting, 
    wallet, 
    connectWallet, 
    disconnect,
    error 
  } = useWalletStore()

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleConnect = async (provider: string) => {
    const success = await connectWallet(provider)
    if (!success && error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  if (isConnected && wallet) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {wallet.provider}
                </span>
                <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-full">
                  Connected
                </span>
              </div>
              
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                  {wallet.address.slice(0, 8)}...{wallet.address.slice(-8)}
                </span>
                <button
                  onClick={() => copyToClipboard(wallet.address)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Copy address"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={disconnect}
            className="flex items-center px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect
          </button>
        </div>

        {/* Quick Balance Overview */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {wallet.balances.slice(0, 4).map((balance) => (
              <div key={balance.asset} className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {balance.asset}
                </div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {balance.available.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="text-center">
        <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Choose a wallet provider to start trading
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => handleConnect('RSA Wallet')}
            disabled={isConnecting}
            className="flex items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-2xl mr-3">🔗</span>
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white">RSA Wallet</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Native RSA Chain</div>
            </div>
          </button>

          <button
            onClick={() => handleConnect('Freighter')}
            disabled={isConnecting}
            className="flex items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-2xl mr-3">🦊</span>
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white">Freighter</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Stellar Extension</div>
            </div>
          </button>

          <button
            onClick={() => handleConnect('Albedo')}
            disabled={isConnecting}
            className="flex items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-2xl mr-3">🌅</span>
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white">Albedo</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Web Wallet</div>
            </div>
          </button>

          <button
            onClick={() => handleConnect('Ledger')}
            disabled={isConnecting}
            className="flex items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-2xl mr-3">🔒</span>
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white">Ledger</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Hardware Wallet</div>
            </div>
          </button>
        </div>

        {isConnecting && (
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Connecting to wallet...
          </div>
        )}
      </div>
    </div>
  )
} 