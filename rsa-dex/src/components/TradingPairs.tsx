'use client'

import { useState, useEffect } from 'react'
import { useTradingStore } from '@/store/tradingStore'
import { Search, TrendingUp, TrendingDown, Star } from 'lucide-react'
import { formatPrice, formatPercentage, formatVolume } from '@/utils/formatters'

export default function TradingPairs() {
  const { 
    tradingPairs, 
    currentPair, 
    setCurrentPair,
    syncAssetsFromAdmin,
    syncPrices 
  } = useTradingStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [favorites, setFavorites] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'RSA' | 'USDT' | 'BTC'>('all')

  useEffect(() => {
    syncAssetsFromAdmin()
    syncPrices()
    
    // Set up price sync interval
    const interval = setInterval(() => {
      syncPrices()
    }, 10000) // Update every 10 seconds
    
    return () => clearInterval(interval)
  }, [syncAssetsFromAdmin, syncPrices])

  const toggleFavorite = (pair: string) => {
    setFavorites(prev => 
      prev.includes(pair) 
        ? prev.filter(p => p !== pair)
        : [...prev, pair]
    )
  }

  const getFilteredPairs = () => {
    let filtered = tradingPairs

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(pair => 
        pair.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pair.baseAsset.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pair.quoteAsset.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by tab
    switch (activeTab) {
      case 'favorites':
        filtered = filtered.filter(pair => favorites.includes(pair.symbol))
        break
      case 'RSA':
        filtered = filtered.filter(pair => pair.quoteAsset === 'RSA')
        break
      case 'USDT':
        filtered = filtered.filter(pair => pair.quoteAsset === 'USDT')
        break
      case 'BTC':
        filtered = filtered.filter(pair => pair.quoteAsset === 'BTC')
        break
      default:
        // 'all' - no additional filtering
        break
    }

    return filtered.sort((a, b) => b.volume24h - a.volume24h) // Sort by volume
  }

  const formatChange = (change: number) => {
    return formatPercentage(change)
  }

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getChangeIcon = (change: number) => {
    return change >= 0 ? TrendingUp : TrendingDown
  }

  const filteredPairs = getFilteredPairs()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Trading Pairs
        </h3>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search pairs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {[
            { key: 'all', label: 'All' },
            { key: 'favorites', label: '★' },
            { key: 'RSA', label: 'RSA' },
            { key: 'USDT', label: 'USDT' },
            { key: 'BTC', label: 'BTC' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pairs List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredPairs.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            {searchTerm ? 'No pairs found' : 'No trading pairs available'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredPairs.map((pair) => {
              const ChangeIcon = getChangeIcon(pair.change24h)
              const isFavorite = favorites.includes(pair.symbol)
              const isSelected = currentPair === pair.symbol

              return (
                <div
                  key={pair.symbol}
                  onClick={() => setCurrentPair(pair.symbol)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-r-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(pair.symbol)
                        }}
                        className="mr-3 text-gray-400 hover:text-yellow-500 transition-colors"
                      >
                        <Star 
                          className={`w-4 h-4 ${isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`}
                        />
                      </button>
                      
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {pair.symbol}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Vol {formatVolume(pair.volume24h)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-mono text-sm text-gray-900 dark:text-white">
                        {formatPrice(pair.price)}
                      </div>
                      <div className={`flex items-center justify-end text-xs ${getChangeColor(pair.change24h)}`}>
                        <ChangeIcon className="w-3 h-3 mr-1" />
                        {formatChange(pair.change24h)}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {filteredPairs.length} pairs • Updated every 10s
        </div>
      </div>
    </div>
  )
}