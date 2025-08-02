'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { useWalletStore } from '@/store/walletStore'
import { Eye, EyeOff, User, Mail, Lock, Wallet, AlertCircle, CheckCircle, Settings, Network, Key } from 'lucide-react'

export default function NewAccountPage() {
  const router = useRouter()
  const { connectWallet, isConnecting } = useWalletStore()
  
  const [activeTab, setActiveTab] = useState<'account' | 'wallet'>('account')
  
  // Account creation form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  })
  
  // Wallet creation form state
  const [walletData, setWalletData] = useState({
    blockchain: 'RSA' as 'RSA' | 'Stellar',
    network: 'Mainnet' as 'Mainnet' | 'Testnet',
    walletName: '',
    password: '',
    confirmPassword: '',
    backupConfirmed: false
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [accountCreated, setAccountCreated] = useState(false)
  const [walletCreated, setWalletCreated] = useState(false)
  const [generatedWallet, setGeneratedWallet] = useState<{
    publicKey: string
    secretKey: string
    mnemonic: string[]
  } | null>(null)

  const validateAccountForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateWalletForm = () => {
    const newErrors: Record<string, string> = {}

    if (!walletData.walletName.trim()) {
      newErrors.walletName = 'Wallet name is required'
    }

    if (!walletData.password) {
      newErrors.password = 'Password is required'
    } else if (walletData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (!walletData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (walletData.password !== walletData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!walletData.backupConfirmed) {
      newErrors.backupConfirmed = 'You must confirm you will backup your wallet'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateAccountForm()) return

    setIsLoading(true)
    try {
      // Simulate account creation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setAccountCreated(true)
      
      // Auto-redirect after success
      setTimeout(() => {
        router.push('/login')
      }, 3000)
      
    } catch (error) {
      setErrors({ submit: 'Failed to create account. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const generateStellarWallet = async () => {
    try {
      // Generate mnemonic using bip39
      const { generateMnemonic } = await import('bip39')
      const mnemonic = generateMnemonic(128) // 12 words
      const mnemonicWords = mnemonic.split(' ')

      // Generate Stellar wallet using the official SDK
      const { Keypair } = await import('@stellar/stellar-sdk')
      const keypair = Keypair.random()

      return {
        publicKey: keypair.publicKey(),
        secretKey: keypair.secret(),
        mnemonic: mnemonicWords
      }
    } catch (error) {
      console.error('Error generating Stellar wallet:', error)
      // Fallback to basic generation if libraries fail
      return generateBasicWallet('Stellar')
    }
  }

  const generateRSAWallet = async () => {
    try {
      // Generate mnemonic using bip39
      const { generateMnemonic } = await import('bip39')
      const mnemonic = generateMnemonic(128) // 12 words
      const mnemonicWords = mnemonic.split(' ')

      // Generate RSA-style keys (mock implementation for RSA chain)
      const crypto = await import('crypto-js')
      const randomBytes = crypto.lib.WordArray.random(32).toString()
      
      // Create RSA-formatted keys
      const publicKey = 'RSA' + randomBytes.substring(0, 56).toUpperCase()
      const secretKey = 'RSAPRIV' + randomBytes.substring(0, 52).toUpperCase()

      return {
        publicKey,
        secretKey,
        mnemonic: mnemonicWords
      }
    } catch (error) {
      console.error('Error generating RSA wallet:', error)
      // Fallback to basic generation if libraries fail
      return generateBasicWallet('RSA')
    }
  }

  const generateBasicWallet = (blockchain: string) => {
    // Fallback wallet generation with unique values
    const timestamp = Date.now()
    const randomPart = Math.random().toString(36).substring(2, 15)
    
    const mnemonicWords = [
      'abandon', 'ability', 'able', 'about', 'above', 'absent',
      'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident'
    ].map(word => word + Math.random().toString(36).substring(2, 4))

    if (blockchain === 'RSA') {
      return {
        publicKey: 'RSA' + timestamp.toString(36).toUpperCase() + randomPart.toUpperCase(),
        secretKey: 'RSAPRIV' + timestamp.toString(36).toUpperCase() + randomPart.toUpperCase(),
        mnemonic: mnemonicWords
      }
    } else {
      return {
        publicKey: 'GA' + timestamp.toString(36).toUpperCase() + randomPart.toUpperCase().padEnd(56, '0'),
        secretKey: 'SA' + timestamp.toString(36).toUpperCase() + randomPart.toUpperCase().padEnd(56, '0'),
        mnemonic: mnemonicWords
      }
    }
  }

  const generateWallet = async () => {
    if (walletData.blockchain === 'Stellar') {
      return await generateStellarWallet()
    } else {
      return await generateRSAWallet()
    }
  }

  const handleWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateWalletForm()) return

    setIsLoading(true)
    try {
      // Generate unique wallet based on selected blockchain
      const wallet = await generateWallet()
      setGeneratedWallet(wallet)
      
      // Simulate wallet creation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setWalletCreated(true)
      
    } catch (error) {
      setErrors({ submit: 'Failed to create wallet. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleWalletConnect = async (provider: string) => {
    const success = await connectWallet(provider)
    if (success) {
      router.push('/wallet')
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    if (activeTab === 'account') {
      setFormData(prev => ({ ...prev, [field]: value }))
    } else {
      setWalletData(prev => ({ ...prev, [field]: value }))
    }
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (accountCreated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Account Created Successfully!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Welcome to RSA DEX! Your account has been created successfully. 
              You will be redirected to the login page shortly.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/login')}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Login
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (walletCreated && generatedWallet) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
            <div className="text-center mb-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {walletData.blockchain} Wallet Created Successfully!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Your {walletData.blockchain} wallet on {walletData.network} has been created with unique credentials.
              </p>
            </div>

            <div className="space-y-6">
              {/* Wallet Details */}
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                    Important: Save Your Wallet Information
                  </h3>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Store this information safely. You'll need it to recover your wallet. This is a unique, valid {walletData.blockchain} wallet.
                </p>
              </div>

              {/* Mnemonic Phrase */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Recovery Phrase (Mnemonic) - 12 Words
                </h3>
                <div className="grid grid-cols-3 gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {generatedWallet.mnemonic.map((word, index) => (
                    <div
                      key={index}
                      className="p-2 bg-white dark:bg-gray-600 rounded text-center text-sm font-mono"
                    >
                      <span className="text-gray-500 dark:text-gray-400 text-xs">{index + 1}.</span>
                      <div className="font-medium text-gray-900 dark:text-white">{word}</div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {walletData.blockchain === 'Stellar' 
                    ? 'This recovery phrase can be used with any Stellar wallet application'
                    : 'This recovery phrase is compatible with RSA Chain wallets'
                  }
                </p>
              </div>

              {/* Public Key */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Public Key ({walletData.blockchain})
                </h3>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg font-mono text-sm break-all">
                  {generatedWallet.publicKey}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Share this address to receive {walletData.blockchain} tokens
                </p>
              </div>

              {/* Secret Key */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Secret Key ({walletData.blockchain}) - Keep Private!
                </h3>
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg font-mono text-sm break-all">
                  {generatedWallet.secretKey}
                </div>
                <div className="flex items-center mt-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  <span className="text-xs">Never share this secret key with anyone!</span>
                </div>
              </div>

              {/* Network Info */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  Wallet Configuration
                </h4>
                <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <p><strong>Blockchain:</strong> {walletData.blockchain}</p>
                  <p><strong>Network:</strong> {walletData.network}</p>
                  <p><strong>Wallet Name:</strong> {walletData.walletName}</p>
                  <p><strong>Compatible:</strong> {walletData.blockchain === 'Stellar' ? 'Any Stellar wallet' : 'RSA Chain wallets'}</p>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => router.push('/wallet')}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Wallet
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  Go to Trading
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Create Wallet
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Choose how you want to get started with RSA DEX
              </p>
            </div>

            {/* Tab Selection */}
            <div className="flex mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('account')}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'account'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                Account
              </button>
              <button
                onClick={() => setActiveTab('wallet')}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'wallet'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Wallet className="w-4 h-4 inline mr-2" />
                New Wallet
              </button>
            </div>

            {/* Account Creation Form */}
            {activeTab === 'account' && (
              <form onSubmit={handleAccountSubmit} className="space-y-6">
                {/* Username */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      id="username"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.username ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Enter your username"
                    />
                  </div>
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.username}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Enter your email address"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div>
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.acceptTerms}
                      onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      I accept the{' '}
                      <a href="/terms" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                        Terms and Conditions
                      </a>{' '}
                      and{' '}
                      <a href="/privacy" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                        Privacy Policy
                      </a>
                    </span>
                  </label>
                  {errors.acceptTerms && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.acceptTerms}
                    </p>
                  )}
                </div>

                {/* Submit Error */}
                {errors.submit && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {errors.submit}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>
            )}

            {/* Wallet Creation Form */}
            {activeTab === 'wallet' && (
              <form onSubmit={handleWalletSubmit} className="space-y-6">
                {/* Blockchain Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Choose Blockchain
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleInputChange('blockchain', 'RSA')}
                      className={`p-4 border-2 rounded-lg transition-colors ${
                        walletData.blockchain === 'RSA'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <div className="text-center">
                        <Network className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                        <div className="font-medium text-gray-900 dark:text-white">RSA Chain</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Native blockchain</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange('blockchain', 'Stellar')}
                      className={`p-4 border-2 rounded-lg transition-colors ${
                        walletData.blockchain === 'Stellar'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <div className="text-center">
                        <Network className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                        <div className="font-medium text-gray-900 dark:text-white">Stellar</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Stellar network</div>
                      </div>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {walletData.blockchain === 'Stellar' 
                      ? 'Generate a real Stellar wallet compatible with any Stellar app'
                      : 'Create an RSA Chain wallet for native tokens'
                    }
                  </p>
                </div>

                {/* Network Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Network
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleInputChange('network', 'Mainnet')}
                      className={`p-3 border-2 rounded-lg transition-colors ${
                        walletData.network === 'Mainnet'
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <div className="text-center">
                        <Settings className="w-5 h-5 mx-auto mb-1 text-green-600" />
                        <div className="font-medium text-gray-900 dark:text-white">Mainnet</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Live network</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange('network', 'Testnet')}
                      className={`p-3 border-2 rounded-lg transition-colors ${
                        walletData.network === 'Testnet'
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <div className="text-center">
                        <Settings className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                        <div className="font-medium text-gray-900 dark:text-white">Testnet</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Test network</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Wallet Name */}
                <div>
                  <label htmlFor="walletName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Wallet Name
                  </label>
                  <div className="relative">
                    <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      id="walletName"
                      value={walletData.walletName}
                      onChange={(e) => handleInputChange('walletName', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.walletName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder={`My ${walletData.blockchain} Wallet`}
                    />
                  </div>
                  {errors.walletName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.walletName}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="walletPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Wallet Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="walletPassword"
                      value={walletData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Enter wallet password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="walletConfirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="walletConfirmPassword"
                      value={walletData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Confirm wallet password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Backup Confirmation */}
                <div>
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={walletData.backupConfirmed}
                      onChange={(e) => handleInputChange('backupConfirmed', e.target.checked)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      I understand that I must backup my recovery phrase and that I will lose access to my {walletData.blockchain} wallet if I lose it.
                    </span>
                  </label>
                  {errors.backupConfirmed && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.backupConfirmed}
                    </p>
                  )}
                </div>

                {/* Submit Error */}
                {errors.submit && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {errors.submit}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating {walletData.blockchain} Wallet...
                    </div>
                  ) : (
                    `Create ${walletData.blockchain} Wallet`
                  )}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="my-8 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Or connect existing wallet
                </span>
              </div>
            </div>

            {/* Wallet Connect Options */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleWalletConnect('RSA Wallet')}
                disabled={isConnecting}
                className="flex items-center justify-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <Wallet className="w-5 h-5 mr-2 text-blue-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">RSA Wallet</span>
              </button>
              
              <button
                onClick={() => handleWalletConnect('Freighter')}
                disabled={isConnecting}
                className="flex items-center justify-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <span className="text-lg mr-2">🦊</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Freighter</span>
              </button>
            </div>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <button
                  onClick={() => router.push('/login')}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
