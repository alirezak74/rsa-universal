'use client'

import { useEffect } from 'react'
import { useTradingStore } from '@/store/tradingStore'
import { formatPrice, formatAmount, formatTotal } from '@/utils/formatters'

export default function OrderBook() {
  const { 
    currentPair, 
    orderbook, 
    fetchOrderbook,
    loading 
  } = useTradingStore()

  useEffect(() => {
    if (currentPair) {
      fetchOrderbook(currentPair)
      
      // Set up real-time updates
      const interval = setInterval(() => {
        fetchOrderbook(currentPair)
      }, 5000) // Update every 5 seconds
      
      return () => clearInterval(interval)
    }
  }, [currentPair, fetchOrderbook])

  const calculateTotal = (price: number, amount: number) => {
    return formatTotal(price * amount)
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400">Loading order book...</div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Headers */}
          <div className="grid grid-cols-3 gap-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-t-lg">
            <div className="text-left font-semibold">Price</div>
            <div className="text-center font-semibold">Amount</div>
            <div className="text-right font-semibold">Total</div>
          </div>

          {/* Sell Orders (Asks) */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-2 px-4">
              Sell Orders
            </div>
            {orderbook.asks.slice(0, 10).reverse().map((ask, index) => (
              <div 
                key={`ask-${index}`} 
                className="grid grid-cols-3 gap-3 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded transition-colors border-b border-gray-100 dark:border-gray-700"
              >
                <div className="text-red-600 dark:text-red-400 font-mono text-left font-medium">
                  {formatPrice(ask.price)}
                </div>
                <div className="text-center text-gray-900 dark:text-white font-mono">
                  {formatAmount(ask.amount)}
                </div>
                <div className="text-right text-gray-600 dark:text-gray-300 font-mono">
                  {calculateTotal(ask.price, ask.amount)}
                </div>
              </div>
            ))}
          </div>

          {/* Spread */}
          <div className="border-t border-b border-gray-200 dark:border-gray-600 py-3 mx-3">
            <div className="text-center text-sm">
              {orderbook.asks.length > 0 && orderbook.bids.length > 0 && (
                <>
                  <div className="text-gray-500 dark:text-gray-400">Spread</div>
                  <div className="font-mono text-gray-900 dark:text-white">
                    {formatPrice(orderbook.asks[0]?.price - orderbook.bids[0]?.price)}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Buy Orders (Bids) */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-2 px-4">
              Buy Orders
            </div>
            {orderbook.bids.slice(0, 10).map((bid, index) => (
              <div 
                key={`bid-${index}`} 
                className="grid grid-cols-3 gap-3 text-sm hover:bg-green-50 dark:hover:bg-green-900/20 px-3 py-2 rounded transition-colors border-b border-gray-100 dark:border-gray-700"
              >
                <div className="text-green-600 dark:text-green-400 font-mono text-left font-medium">
                  {formatPrice(bid.price)}
                </div>
                <div className="text-center text-gray-900 dark:text-white font-mono">
                  {formatAmount(bid.amount)}
                </div>
                <div className="text-right text-gray-600 dark:text-gray-300 font-mono">
                  {calculateTotal(bid.price, bid.amount)}
                </div>
              </div>
            ))}
          </div>

          {/* Order Book Stats */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 px-3">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-gray-500 dark:text-gray-400">Total Bids</div>
                <div className="font-mono text-green-600 dark:text-green-400">
                  {formatAmount(orderbook.bids.reduce((sum, bid) => sum + bid.amount, 0))}
                </div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Total Asks</div>
                <div className="font-mono text-red-600 dark:text-red-400">
                  {formatAmount(orderbook.asks.reduce((sum, ask) => sum + ask.amount, 0))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}