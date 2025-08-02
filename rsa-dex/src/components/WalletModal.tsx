'use client'

import React, { useState } from 'react'
import { X } from 'lucide-react'
import ImportSecretKeyForm from './ImportSecretKeyForm'
import { useWalletStore } from '../store/walletStore'

interface WalletModalProps {
  onClose: () => void
}

export default function WalletModal({ onClose }: WalletModalProps) {
  const [showImportForm, setShowImportForm] = useState(false)
  const { connectWallet, isConnecting } = useWalletStore()

  const handleConnect = async (provider: string) => {
    const success = await connectWallet(provider)
    if (success) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Connect Wallet
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {showImportForm ? (
          <ImportSecretKeyForm onClose={onClose} />
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => handleConnect('RSA Chain')}
              disabled={isConnecting}
              className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-colors"
            >
              🔗 RSA Chain
            </button>
            
            <button
              onClick={() => handleConnect('Stronger Network')}
              disabled={isConnecting}
              className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 transition-colors"
            >
              💪 Stronger Network
            </button>
            
            <button
              onClick={() => handleConnect('Freighter')}
              disabled={isConnecting}
              className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              🦊 Freighter
            </button>
            
            <button
              onClick={() => handleConnect('Albedo')}
              disabled={isConnecting}
              className="w-full flex items-center justify-center py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              🌅 Albedo
            </button>
            
            <button
              onClick={() => handleConnect('Ledger')}
              disabled={isConnecting}
              className="w-full flex items-center justify-center py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              🔒 Ledger
            </button>
            
            <button
              onClick={() => setShowImportForm(true)}
              disabled={isConnecting}
              className="w-full py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              Import Secret Key
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
