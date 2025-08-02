'use client'

import { useState, useEffect } from 'react'
import { useTradingStore } from '@/store/tradingStore'
import { formatDistanceToNow } from 'date-fns'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatPrice, formatAmount } from '@/utils/formatters'

export default function RecentTrades() {
  const { recentTrades, currentPair, fetchRecentTrades } = useTradingStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (currentPair) {
      fetchRecentTrades(currentPair)
      
      // Set up real-time updates
      const interval = setInterval(() => {
        fetchRecentTrades(currentPair)
      }, 10000) // Update every 10 seconds
      
      return () => clearInterval(interval)
    }
  }, [currentPair, fetchRecentTrades])

  const filteredTrades = recentTrades.filter(trade => trade.pair === currentPair)

  if (!mounted) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Trades
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {currentPair}
        </div>
      </div>

      <div className="space-y-2">
        {/* Headers */}
        <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600 pb-2">
          <div className="font-semibold">Price</div>
          <div className="text-right font-semibold">Amount</div>
          <div className="text-right font-semibold">Time</div>
          <div className="text-center font-semibold">Side</div>
        </div>

        {/* Trades List */}
        <div className="max-h-64 overflow-y-auto space-y-1">
          {filteredTrades.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No recent trades
            </div>
          ) : (
            filteredTrades.slice(0, 20).map((trade) => (
              <div 
                key={trade.id}
                className="grid grid-cols-4 gap-2 text-sm py-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors border-b border-gray-100 dark:border-gray-700"
              >
                <div className={`font-mono tabular-nums ${
                  trade.side === 'buy' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatPrice(trade.price)}
                </div>
                
                <div className="text-right font-mono tabular-nums text-gray-900 dark:text-white">
                  {formatAmount(trade.amount)}
                </div>
                
                <div className="text-right text-gray-500 dark:text-gray-400 text-xs">
                  {formatDistanceToNow(new Date(trade.timestamp), { addSuffix: true })}
                </div>
                
                <div className="text-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    trade.side === 'buy' 
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                      : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                  }`}>
                    {trade.side === 'buy' ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {trade.side.toUpperCase()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Trade Stats */}
      {filteredTrades.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="text-gray-500 dark:text-gray-400">Last Price</div>
              <div className={`font-mono tabular-nums text-sm ${
                filteredTrades[0]?.side === 'buy' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {formatPrice(filteredTrades[0]?.price || 0)}
              </div>
            </div>
            <div>
              <div className="text-gray-500 dark:text-gray-400">Total Trades</div>
              <div className="font-mono tabular-nums text-sm text-gray-900 dark:text-white">
                {filteredTrades.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 