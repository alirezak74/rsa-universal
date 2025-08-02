'use client'

import React, { useState, useEffect } from 'react'
import { ArrowUpDown, Settings, AlertCircle, Loader2 } from 'lucide-react'
import { useWalletStore } from '../store/walletStore'
import { RSA_SDK_CONFIG, NETWORKS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/settings'

const SwapForm = () => {
  const { publicKey } = useWalletStore()
  const [assets, setAssets] = useState<Array<{code: string, issuer: string | null}>>([])
  const [fromAsset, setFromAsset] = useState<string>('RSA')
  const [toAsset, setToAsset] = useState<string>('BTC')
  const [fromAmount, setFromAmount] = useState<string>('')
  const [toAmount, setToAmount] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [slippage, setSlippage] = useState<number>(0.5)
  const [showSettings, setShowSettings] = useState<boolean>(false)

  // Load RSA SDK
  const loadRSASDK = async () => {
    try {
      // In a real implementation, this would load the RSA SDK from a CDN or local build
      // For now, we'll create a mock SDK that uses our new RSA SDK structure
      if (!(window as any).RsaSdk) {
        // Import our RSA SDK (in a real app, this would be from a built bundle)
        const RSASDKModule = await import('../lib/rsa-sdk')
        ;(window as any).RsaSdk = RSASDKModule
      }
      return true
    } catch (error) {
      console.error('Failed to load RSA SDK:', error)
      return false
    }
  }

  // Initialize component
  useEffect(() => {
    const init = async () => {
      const sdkLoaded = await loadRSASDK()
      if (sdkLoaded) {
        fetchAssets()
      } else {
        setError(ERROR_MESSAGES.SDK_NOT_LOADED)
      }
    }
    
    init()
  }, [])

  const fetchAssets = async () => {
    try {
      const RsaSdk = (window as any).RsaSdk
      if (!RsaSdk) {
        setError(ERROR_MESSAGES.SDK_NOT_LOADED)
        return
      }

      const server = new RsaSdk.Server(RSA_SDK_CONFIG.SERVER_URL)
      const response = await server.assets().limit(10).call()
      
      const fetchedAssets = response.records.map((asset: any) => ({
        code: asset.asset_code || 'RSA',
        issuer: asset.asset_issuer || null,
      }))
      
      // Add native RSA asset
      const allAssets = [
        { code: 'RSA', issuer: null },
        ...fetchedAssets.filter((asset: any) => asset.code !== 'RSA')
      ]
      
      setAssets(allAssets)
      
      // Set default assets if not already set
      if (!fromAsset) setFromAsset('RSA')
      if (!toAsset && allAssets.length > 1) {
        setToAsset(allAssets[1].code)
      }
    } catch (error) {
      console.error('Error fetching assets:', error)
      setError('Failed to load available assets')
      
      // Fallback to default assets
      setAssets([
        { code: 'RSA', issuer: null },
        { code: 'BTC', issuer: 'GARDNV3Q7YGT...MMXJTEDL5' },
        { code: 'ETH', issuer: 'GA7FCCMTTSUIC...MMXJTEDL5' },
        { code: 'USDT', issuer: 'GCQFBVR3QDBC...MMXJTEDL5' },
      ])
    }
  }

  const handleSwap = async () => {
    if (!publicKey) {
      setError(ERROR_MESSAGES.WALLET_NOT_CONNECTED)
      return
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setError(ERROR_MESSAGES.INVALID_AMOUNT)
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const RsaSdk = (window as any).RsaSdk
      if (!RsaSdk) {
        throw new Error(ERROR_MESSAGES.SDK_NOT_LOADED)
      }

      const server = new RsaSdk.Server(RSA_SDK_CONFIG.SERVER_URL)
      
      // Load source account
      const sourceAccount = await server.loadAccount(publicKey)
      
      // Create assets
      const sendAsset = fromAsset === 'RSA' 
        ? RsaSdk.Asset.native() 
        : new RsaSdk.Asset(fromAsset, assets.find(a => a.code === fromAsset)?.issuer || '')
        
      const destAsset = toAsset === 'RSA' 
        ? RsaSdk.Asset.native() 
        : new RsaSdk.Asset(toAsset, assets.find(a => a.code === toAsset)?.issuer || '')

      // Calculate destination amount (mock calculation - in reality this would use pathfinding)
      const mockExchangeRate = fromAsset === 'RSA' && toAsset === 'BTC' ? 0.00001308 : 1.0
      const calculatedToAmount = (parseFloat(fromAmount) * mockExchangeRate).toFixed(7)
      
      // Build transaction
      const transaction = new RsaSdk.TransactionBuilder(sourceAccount, {
        fee: RSA_SDK_CONFIG.BASE_FEE,
        networkPassphrase: RSA_SDK_CONFIG.NETWORK_PASSPHRASE,
      })
        .addOperation(
          RsaSdk.Operation.pathPaymentStrictReceive({
            sendAsset: sendAsset,
            sendMax: fromAmount,
            destination: publicKey,
            destAsset: destAsset,
            destAmount: calculatedToAmount,
            path: [], // In a real implementation, this would be calculated
          })
        )
        .setTimeout(RSA_SDK_CONFIG.TRANSACTION_TIMEOUT)
        .build()

      // For demo purposes, we'll just log the transaction
      console.log('Swap transaction built:', {
        from: fromAsset,
        to: toAsset,
        amount: fromAmount,
        estimatedReceive: calculatedToAmount,
        transaction: transaction.toXDR()
      })

      // In a real implementation, you would:
      // 1. Sign the transaction with the user's private key
      // 2. Submit to the network
      // 3. Wait for confirmation
      
      // Simulate transaction processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSuccess(SUCCESS_MESSAGES.TRANSACTION_SUBMITTED)
      setToAmount(calculatedToAmount)
      
      // Clear form after successful swap
      setTimeout(() => {
        setFromAmount('')
        setToAmount('')
        setSuccess('')
      }, 5000)
      
    } catch (error: any) {
      console.error('Swap failed:', error)
      
      if (error.message?.includes('Account not found')) {
        setError(ERROR_MESSAGES.ACCOUNT_NOT_FOUND)
      } else if (error.message?.includes('Insufficient balance')) {
        setError(ERROR_MESSAGES.INSUFFICIENT_BALANCE)
      } else {
        setError(error.message || ERROR_MESSAGES.TRANSACTION_FAILED)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssetSwap = () => {
    setFromAsset(toAsset)
    setToAsset(fromAsset)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value)
    
    // Simple mock price calculation
    if (value && parseFloat(value) > 0) {
      const mockRate = fromAsset === 'RSA' && toAsset === 'BTC' ? 0.00001308 :
                      fromAsset === 'BTC' && toAsset === 'RSA' ? 76485.0 :
                      fromAsset === 'RSA' && toAsset === 'ETH' ? 0.000246 :
                      fromAsset === 'ETH' && toAsset === 'RSA' ? 4065.0 : 1.0
      
      const estimated = (parseFloat(value) * mockRate).toFixed(7)
      setToAmount(estimated)
    } else {
      setToAmount('')
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Swap Tokens
        </h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Swap Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Slippage Tolerance
            </label>
            <div className="flex items-center space-x-2">
              {[0.1, 0.5, 1.0].map((value) => (
                <button
                  key={value}
                  onClick={() => setSlippage(value)}
                  className={`px-3 py-1 text-xs rounded ${
                    slippage === value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {value}%
                </button>
              ))}
              <input
                type="number"
                value={slippage}
                onChange={(e) => setSlippage(parseFloat(e.target.value) || 0.5)}
                className="w-16 px-2 py-1 text-xs border rounded dark:bg-gray-600 dark:border-gray-500"
                step="0.1"
                min="0.1"
                max="50"
              />
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center">
          <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
          <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center">
          <AlertCircle className="w-4 h-4 text-green-600 mr-2" />
          <span className="text-sm text-green-700 dark:text-green-400">{success}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* From Section */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              From
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Balance: 10,000 {fromAsset}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => handleFromAmountChange(e.target.value)}
              placeholder="0.00"
              className="flex-1 text-lg font-medium bg-transparent border-none outline-none text-gray-900 dark:text-white"
              step="any"
              min="0"
            />
            <select
              value={fromAsset}
              onChange={(e) => setFromAsset(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-sm font-medium"
            >
              {assets.map((asset) => (
                <option key={`${asset.code}-${asset.issuer}`} value={asset.code}>
                  {asset.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={handleAssetSwap}
            className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            title="Swap assets"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        {/* To Section */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              To
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Balance: 0.5 {toAsset}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={toAmount}
              readOnly
              placeholder="0.00"
              className="flex-1 text-lg font-medium bg-transparent border-none outline-none text-gray-900 dark:text-white"
            />
            <select
              value={toAsset}
              onChange={(e) => setToAsset(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-sm font-medium"
            >
              {assets.map((asset) => (
                <option key={`${asset.code}-${asset.issuer}`} value={asset.code}>
                  {asset.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Information */}
        {fromAmount && toAmount && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Exchange Rate</span>
              <span className="font-medium text-gray-900 dark:text-white">
                1 {fromAsset} = {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(8)} {toAsset}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-600 dark:text-gray-400">Slippage Tolerance</span>
              <span className="font-medium text-gray-900 dark:text-white">{slippage}%</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-600 dark:text-gray-400">Network Fee</span>
              <span className="font-medium text-gray-900 dark:text-white">0.00001 RSA</span>
            </div>
          </div>
        )}

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          disabled={isLoading || !publicKey || !fromAmount || parseFloat(fromAmount) <= 0}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing Swap...
            </>
          ) : !publicKey ? (
            'Connect Wallet to Swap'
          ) : (
            'Swap Tokens'
          )}
        </button>
      </div>
    </div>
  )
}

export default SwapForm
