'use client'

import React, { useState } from 'react'
import { useWalletStore } from '../store/walletStore'
import { Keypair } from '@stellar/stellar-sdk'

interface ImportSecretKeyFormProps {
  onClose: () => void
}

export default function ImportSecretKeyForm({ onClose }: ImportSecretKeyFormProps) {
  const [secretKey, setSecretKey] = useState('')
  const [error, setError] = useState('')
  const { setPublicKey } = useWalletStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const keypair = Keypair.fromSecret(secretKey)
      const publicKey = keypair.publicKey()
      setPublicKey(publicKey)
      onClose()
    } catch (err) {
      setError('Invalid secret key')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="secretKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Secret Key
        </label>
        <input
          type="password"
          id="secretKey"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
          placeholder="S..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          required
        />
      </div>
      
      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
      )}
      
      <div className="flex space-x-3">
        <button
          type="submit"
          className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Import
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2 px-4 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
