'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import TradingView from '@/components/TradingView'
import OrderBook from '@/components/OrderBook'
import TradingForm from '@/components/TradingForm'
import TradingPairs from '@/components/TradingPairs'
import RecentTrades from '@/components/RecentTrades'
import WalletConnect from '@/components/WalletConnect'
import { useTradingStore } from '@/store/tradingStore'
import { useWalletStore } from '@/store/walletStore'

export default function Home() {
  const { currentPair, syncAssetsFromAdmin, syncPrices } = useTradingStore()
  const { isConnected } = useWalletStore()

  useEffect(() => {
    // Initialize data on page load
    syncAssetsFromAdmin()
    syncPrices()
  }, [syncAssetsFromAdmin, syncPrices])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            RSA DEX Trading
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Trade cryptocurrencies on the RSA Chain decentralized exchange
          </p>
        </div>

        {/* Wallet Connection */}
        {!isConnected && (
          <div className="mb-6">
            <WalletConnect />
          </div>
        )}

        {/* Main Trading Interface - Improved Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Side - Trading Pairs */}
          <div className="xl:col-span-3 order-1 xl:order-1">
            <TradingPairs />
          </div>

          {/* Center - Chart with improved spacing */}
          <div className="xl:col-span-6 order-3 xl:order-2">
            <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 relative z-20">
              <div className="p-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white">
                  {currentPair} Chart
                </h2>
              </div>
              {/* Chart with time selectors above */}
              <div className="p-4 relative z-30">
                <TradingView />
              </div>
            </div>
            
            {/* Trading Form below chart */}
            <div className="mt-6">
              <TradingForm />
            </div>
          </div>

          {/* Right Side - Order Book and Recent Trades */}
          <div className="xl:col-span-3 order-2 xl:order-3 xl:ml-2">
            <div className="space-y-6">
              {/* Order Book - Properly positioned on the right */}
              <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 relative z-10">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white">
                    Order Book
                  </h3>
                </div>
                <div className="p-4">
                  <OrderBook />
                </div>
              </div>

              {/* Recent Trades */}
              <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 relative z-10">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white">
                    Recent Trades
                  </h3>
                </div>
                <div className="p-4">
                  <RecentTrades />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Market Stats */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Market Statistics
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {currentPair}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Current Pair
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  $2.4M
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  24h Volume
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  156
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Active Pairs
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Wallet Status
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <a
            href="/deposits"
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-white"
          >
            <h4 className="text-lg font-semibold mb-2">
              🚀 Cross-Chain Deposits
            </h4>
            <p className="text-blue-100 text-sm">
              Deposit Bitcoin, Ethereum, BNB & more to get wrapped tokens
            </p>
          </a>
          
          <a
            href="/markets"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
          >
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Markets
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              View all available trading pairs and market data
            </p>
          </a>
          
          <a
            href="/wallet"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
          >
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Wallet
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Manage your assets and view portfolio balance
            </p>
          </a>
          
          <a
            href="/orders"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
          >
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Orders
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Track your open orders and trading history
            </p>
          </a>
        </div>
      </div>
    </div>
  )
} 