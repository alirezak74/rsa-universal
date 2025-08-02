'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { useTradingStore } from '@/store/tradingStore'
import { useWalletStore } from '@/store/walletStore'
import { ArrowUpDown, Settings, RefreshCw, AlertCircle, Info, TrendingUp, TrendingDown } from 'lucide-react'

export default function SwapPage() {
  const router = useRouter()
  const { assets, syncAssetsFromAdmin, syncPrices } = useTradingStore()
  const { isConnected, wallet, getBalance } = useWalletStore()
  
  const [fromAsset, setFromAsset] = useState('RSA')
  const [toAsset, setToAsset] = useState('USDT')
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [slippage, setSlippage] = useState(0.5)
  const [showSettings, setShowSettings] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [priceImpact, setPriceImpact] = useState(0)

  const fromAssetData = assets.find(asset => asset.symbol === fromAsset)
  const toAssetData = assets.find(asset => asset.symbol === toAsset)
  const fromBalance = getBalance(fromAsset)
  const toBalance = getBalance(toAsset)

  useEffect(() => {
    syncAssetsFromAdmin()
    syncPrices()
  }, [syncAssetsFromAdmin, syncPrices])

  useEffect(() => {
    if (fromAmount && fromAssetData && toAssetData) {
      const rate = fromAssetData.price / toAssetData.price
      const calculatedToAmount = (parseFloat(fromAmount) * rate).toFixed(6)
      setToAmount(calculatedToAmount)
      
      // Calculate price impact (mock calculation)
      const impact = (parseFloat(fromAmount) / 10000) * 100
      setPriceImpact(Math.min(impact, 10))
    } else {
      setToAmount('')
      setPriceImpact(0)
    }
  }, [fromAmount, fromAssetData, toAssetData])

  const handleSwapAssets = () => {
    const tempAsset = fromAsset
    const tempAmount = fromAmount
    setFromAsset(toAsset)
    setToAsset(tempAsset)
    setFromAmount(toAmount)
    setToAmount(tempAmount)
  }

  const handleMaxClick = () => {
    setFromAmount(fromBalance.toString())
  }

  const handlePercentageClick = (percentage: number) => {
    const amount = (fromBalance * percentage / 100).toString()
    setFromAmount(amount)
  }

  const handleSwap = async () => {
    if (!isConnected) {
      router.push('/login')
      return
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      return
    }

    if (parseFloat(fromAmount) > fromBalance) {
      return
    }

    setIsLoading(true)
    try {
      // Simulate swap transaction
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Show success and redirect to wallet
      router.push('/wallet')
    } catch (error) {
      console.error('Swap failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getPriceImpactColor = (impact: number) => {
    if (impact < 1) return 'text-green-600'
    if (impact < 3) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Swap Tokens
              </h1>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Slippage Tolerance
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {slippage}%
                  </span>
                </div>
                <div className="flex space-x-2">
                  {[0.1, 0.5, 1.0].map((value) => (
                    <button
                      key={value}
                      onClick={() => setSlippage(value)}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        slippage === value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                      }`}
                    >
                      {value}%
                    </button>
                  ))}
                  <input
                    type="number"
                    value={slippage}
                    onChange={(e) => setSlippage(parseFloat(e.target.value) || 0)}
                    className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Custom"
                    step="0.1"
                    min="0"
                    max="50"
                  />
                </div>
              </div>
            )}

            {/* From Token */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  From
                </label>
                {isConnected && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Balance: {fromBalance.toFixed(6)}
                  </span>
                )}
              </div>
              
              <div className="relative bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <input
                    type="number"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    placeholder="0.0"
                    className="flex-1 bg-transparent text-xl font-semibold text-gray-900 dark:text-white placeholder-gray-500 border-none outline-none"
                  />
                  
                  <div className="flex items-center space-x-2">
                    <select
                      value={fromAsset}
                      onChange={(e) => setFromAsset(e.target.value)}
                      className="bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
                    >
                      {assets.map((asset) => (
                        <option key={asset.symbol} value={asset.symbol}>
                          {asset.icon} {asset.symbol}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {isConnected && (
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex space-x-2">
                      {[25, 50, 75, 100].map((percentage) => (
                        <button
                          key={percentage}
                          onClick={() => handlePercentageClick(percentage)}
                          className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                        >
                          {percentage}%
                        </button>
                      ))}
                    </div>
                    
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      ≈ ${fromAssetData ? (parseFloat(fromAmount || '0') * fromAssetData.price).toFixed(2) : '0.00'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center my-4">
              <button
                onClick={handleSwapAssets}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <ArrowUpDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* To Token */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  To
                </label>
                {isConnected && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Balance: {toBalance.toFixed(6)}
                  </span>
                )}
              </div>
              
              <div className="relative bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <input
                    type="number"
                    value={toAmount}
                    readOnly
                    placeholder="0.0"
                    className="flex-1 bg-transparent text-xl font-semibold text-gray-900 dark:text-white placeholder-gray-500 border-none outline-none"
                  />
                  
                  <div className="flex items-center space-x-2">
                    <select
                      value={toAsset}
                      onChange={(e) => setToAsset(e.target.value)}
                      className="bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
                    >
                      {assets.map((asset) => (
                        <option key={asset.symbol} value={asset.symbol}>
                          {asset.icon} {asset.symbol}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center justify-end mt-3">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    ≈ ${toAssetData ? (parseFloat(toAmount || '0') * toAssetData.price).toFixed(2) : '0.00'}
                  </div>
                </div>
              </div>
            </div>

            {/* Swap Details */}
            {fromAmount && toAmount && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Rate</span>
                  <span className="text-gray-900 dark:text-white">
                    1 {fromAsset} = {fromAssetData && toAssetData ? (fromAssetData.price / toAssetData.price).toFixed(6) : '0'} {toAsset}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Price Impact</span>
                  <span className={`flex items-center ${getPriceImpactColor(priceImpact)}`}>
                    {priceImpact >= 1 ? (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    )}
                    {priceImpact.toFixed(2)}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Minimum Received</span>
                  <span className="text-gray-900 dark:text-white">
                    {(parseFloat(toAmount) * (100 - slippage) / 100).toFixed(6)} {toAsset}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Slippage Tolerance</span>
                  <span className="text-gray-900 dark:text-white">{slippage}%</span>
                </div>
              </div>
            )}

            {/* Warnings */}
            {priceImpact > 3 && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mr-2" />
                  <span className="text-sm text-red-700 dark:text-red-300">
                    High price impact! Consider reducing swap amount.
                  </span>
                </div>
              </div>
            )}

            {/* Swap Button */}
            {!isConnected ? (
              <button
                onClick={() => router.push('/login')}
                className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Connect Wallet to Swap
              </button>
            ) : !fromAmount || parseFloat(fromAmount) <= 0 ? (
              <button
                disabled
                className="w-full py-4 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed font-medium"
              >
                Enter Amount
              </button>
            ) : parseFloat(fromAmount) > fromBalance ? (
              <button
                disabled
                className="w-full py-4 bg-red-300 dark:bg-red-600 text-red-700 dark:text-red-300 rounded-lg cursor-not-allowed font-medium"
              >
                Insufficient {fromAsset} Balance
              </button>
            ) : (
              <button
                onClick={handleSwap}
                disabled={isLoading}
                className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                    Swapping...
                  </div>
                ) : (
                  `Swap ${fromAsset} for ${toAsset}`
                )}
              </button>
            )}

            {/* Info */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="mb-1">Swaps are executed at market rates with minimal slippage.</p>
                  <p>For large trades, consider using the Exchange for better rates.</p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => router.push('/exchange')}
                className="flex-1 py-2 px-3 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Advanced Trading
              </button>
              <button
                onClick={() => router.push('/wallet')}
                className="flex-1 py-2 px-3 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                View Wallet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}