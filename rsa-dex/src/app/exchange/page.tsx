'use client'

import React, { useState, useEffect } from 'react'
import { useTradingStore } from '@/store/tradingStore'
import { useWalletStore } from '@/store/walletStore'
import Header from '@/components/Header'
import TradingView from '@/components/TradingView'
import OrderBook from '@/components/OrderBook'
import TradingForm from '@/components/TradingForm'
import RecentTrades from '@/components/RecentTrades'
import TradingPairs from '@/components/TradingPairs'
import WalletConnect from '@/components/WalletConnect'
import { ArrowUpDown, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react'

export default function ExchangePage() {
  const { 
    currentPair, 
    tradingPairs, 
    assets, 
    syncAssetsFromAdmin, 
    syncPrices,
    fetchOrderbook,
    fetchRecentTrades,
    loading 
  } = useTradingStore()
  
  const { isConnected, wallet } = useWalletStore()
  
  const [selectedTab, setSelectedTab] = useState<'spot' | 'futures' | 'options'>('spot')

  // Get current pair data
  const currentPairData = tradingPairs.find(pair => pair.symbol === currentPair)
  const baseAsset = assets.find(asset => asset.symbol === currentPairData?.baseAsset)
  const quoteAsset = assets.find(asset => asset.symbol === currentPairData?.quoteAsset)

  useEffect(() => {
    // Initialize data
    syncAssetsFromAdmin()
    syncPrices()
    
    if (currentPair) {
      fetchOrderbook(currentPair)
      fetchRecentTrades(currentPair)
    }

    // Set up intervals for real-time updates
    const priceInterval = setInterval(() => {
      syncPrices()
    }, 30000) // 30 seconds

    const orderBookInterval = setInterval(() => {
      if (currentPair) {
        fetchOrderbook(currentPair)
        fetchRecentTrades(currentPair)
      }
    }, 5000) // 5 seconds

    return () => {
      clearInterval(priceInterval)
      clearInterval(orderBookInterval)
    }
  }, [currentPair, syncAssetsFromAdmin, syncPrices, fetchOrderbook, fetchRecentTrades])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Exchange
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Trade cryptocurrencies with advanced tools and real-time data
              </p>
            </div>
            
            {/* Trading Mode Tabs */}
            <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
              {(['spot', 'futures', 'options'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedTab === tab
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Market Overview */}
        {currentPairData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{baseAsset?.icon}</span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {currentPair}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {baseAsset?.name} / {quoteAsset?.name}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Price</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${currentPairData.price.toFixed(4)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">24h Change</p>
                    <div className={`flex items-center space-x-1 ${
                      currentPairData.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {currentPairData.change24h >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span className="font-semibold">
                        {Math.abs(currentPairData.change24h).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">24h Volume</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ${(currentPairData.volume24h / 1000000).toFixed(2)}M
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">24h High</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ${currentPairData.high24h.toFixed(4)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">24h Low</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ${currentPairData.low24h.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>
              
              {!isConnected && (
                <WalletConnect />
              )}
            </div>
          </div>
        )}

        {/* Main Trading Interface */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Trading Pairs */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm h-[600px]">
              <TradingPairs />
            </div>
          </div>

          {/* Center - Chart and Order Book */}
          <div className="col-span-12 lg:col-span-6 space-y-6">
            {/* Trading Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <TradingView />
            </div>

            {/* Order Book and Recent Trades */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <OrderBook />
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <RecentTrades />
              </div>
            </div>
          </div>

          {/* Right Sidebar - Trading Form */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <TradingForm />
            </div>
          </div>
        </div>

        {/* Portfolio Summary */}
        {isConnected && wallet && (
          <div className="mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Portfolio Summary
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Total Value
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${wallet.balances.reduce((total, balance) => {
                      const asset = assets.find(a => a.symbol === balance.asset)
                      return total + (balance.available * (asset?.price || 0))
                    }, 0).toFixed(2)}
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Assets
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {wallet.balances.length}
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <ArrowUpDown className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Available
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${wallet.balances.reduce((total, balance) => {
                      const asset = assets.find(a => a.symbol === balance.asset)
                      return total + (balance.available * (asset?.price || 0))
                    }, 0).toFixed(2)}
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="w-5 h-5 text-center text-orange-600 font-bold">🔒</span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      In Orders
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${wallet.balances.reduce((total, balance) => {
                      const asset = assets.find(a => a.symbol === balance.asset)
                      return total + (balance.locked * (asset?.price || 0))
                    }, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center space-x-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-900 dark:text-white font-medium">
                Loading market data...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}