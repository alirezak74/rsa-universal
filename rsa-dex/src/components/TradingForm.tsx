'use client'

import { useState } from 'react'
import { useTradingStore } from '@/store/tradingStore'
import { useWalletStore } from '@/store/walletStore'
import { ArrowUp, ArrowDown, Percent, DollarSign } from 'lucide-react'

export default function TradingForm() {
  const [orderType, setOrderType] = useState<'market' | 'limit'>('limit')
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [price, setPrice] = useState('')
  const [amount, setAmount] = useState('')
  const [percentage, setPercentage] = useState(25)
  
  const { 
    currentPair, 
    tradingPairs, 
    addOrder,
    assets 
  } = useTradingStore()
  
  const { 
    isConnected, 
    getBalance,
    connectWallet 
  } = useWalletStore()

  // Get current trading pair data
  const pairData = tradingPairs.find(p => p.symbol === currentPair)
  const currentPrice = pairData?.price || 0
  const [baseAsset, quoteAsset] = currentPair.split('/')

  // Get asset info
  const baseAssetInfo = assets.find(a => a.symbol === baseAsset)
  const quoteAssetInfo = assets.find(a => a.symbol === quoteAsset)

  // Get balances
  const baseBalance = getBalance(baseAsset)
  const quoteBalance = getBalance(quoteAsset)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }

    if (!amount || (!price && orderType === 'limit')) {
      alert('Please fill in all required fields')
      return
    }

    const orderPrice = orderType === 'market' ? currentPrice : parseFloat(price)
    const orderAmount = parseFloat(amount)

    // Check balance
    const requiredAmount = side === 'buy' ? orderAmount * orderPrice : orderAmount
    const availableBalance = side === 'buy' ? quoteBalance : baseBalance
    const requiredAsset = side === 'buy' ? quoteAsset : baseAsset

    if (requiredAmount > availableBalance) {
      alert(`Insufficient ${requiredAsset} balance`)
      return
    }

    // Place order
    addOrder({
      pair: currentPair,
      side,
      type: orderType,
      amount: orderAmount,
      price: orderType === 'limit' ? orderPrice : undefined,
      filled: 0,
      status: 'pending' as const,
    })

    // Reset form
    setAmount('')
    setPrice('')
    setPercentage(25)

    alert(`${side.toUpperCase()} order placed successfully!`)
  }

  const calculateTotal = () => {
    if (!amount) return 0
    const orderPrice = orderType === 'market' ? currentPrice : parseFloat(price) || 0
    return parseFloat(amount) * orderPrice
  }

  const handlePercentageClick = (pct: number) => {
    setPercentage(pct)
    
    if (side === 'buy') {
      // Calculate amount based on quote balance
      const total = (quoteBalance * pct) / 100
      const orderPrice = orderType === 'market' ? currentPrice : parseFloat(price) || currentPrice
      if (orderPrice > 0) {
        setAmount((total / orderPrice).toFixed(6))
      }
    } else {
      // Calculate amount based on base balance
      const maxAmount = (baseBalance * pct) / 100
      setAmount(maxAmount.toFixed(6))
    }
  }

  const formatBalance = (balance: number) => {
    return balance.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Trade {currentPair}
        </h2>
      </div>

      <div className="p-4">
        {!isConnected ? (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              Connect your wallet to start trading
            </div>
            <button
              onClick={() => connectWallet('RSA Wallet')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Order Type Tabs */}
            <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
              <button
                type="button"
                onClick={() => setOrderType('limit')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  orderType === 'limit'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Limit Order
              </button>
              <button
                type="button"
                onClick={() => setOrderType('market')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  orderType === 'market'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Market Order
              </button>
            </div>

            {/* Buy/Sell Tabs */}
            <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
              <button
                type="button"
                onClick={() => setSide('buy')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  side === 'buy'
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <ArrowUp className="w-4 h-4 inline mr-1" />
                Buy {baseAsset}
              </button>
              <button
                type="button"
                onClick={() => setSide('sell')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  side === 'sell'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <ArrowDown className="w-4 h-4 inline mr-1" />
                Sell {baseAsset}
              </button>
            </div>

            {/* Price Input */}
            {orderType === 'limit' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price ({quoteAsset})
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder={currentPrice.toFixed(6)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    step="0.000001"
                  />
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Market price: {currentPrice.toFixed(6)} {quoteAsset}
                </div>
              </div>
            )}

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount ({baseAsset})
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                step="0.000001"
                required
              />
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Available: {formatBalance(side === 'buy' ? quoteBalance : baseBalance)} {side === 'buy' ? quoteAsset : baseAsset}
              </div>
            </div>

            {/* Percentage Buttons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Percent className="w-4 h-4 inline mr-1" />
                Quick Amount
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handlePercentageClick(pct)}
                    className={`py-2 px-3 text-sm rounded-lg border transition-colors ${
                      percentage === pct
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Order Type:</span>
                  <span className="text-gray-900 dark:text-white capitalize">
                    {orderType} {side}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Price:</span>
                  <span className="text-gray-900 dark:text-white">
                    {orderType === 'market' ? 'Market Price' : `${price || '0'} ${quoteAsset}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                  <span className="text-gray-900 dark:text-white">
                    {amount || '0'} {baseAsset}
                  </span>
                </div>
                <div className="flex justify-between font-medium border-t border-gray-200 dark:border-gray-600 pt-2">
                  <span className="text-gray-600 dark:text-gray-400">Total:</span>
                  <span className="text-gray-900 dark:text-white">
                    {calculateTotal().toFixed(6)} {quoteAsset}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!amount || (orderType === 'limit' && !price)}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                side === 'buy'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {side === 'buy' ? 'Buy' : 'Sell'} {baseAsset}
            </button>
          </form>
        )}
      </div>
    </div>
  )
} 