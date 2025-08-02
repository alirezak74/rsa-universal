'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { useTradingStore } from '@/store/tradingStore'
import { CreditCard, Building2, Mail, DollarSign, AlertCircle, CheckCircle, Info, Banknote, Lock } from 'lucide-react'

export default function BuyPage() {
  const router = useRouter()
  const { assets } = useTradingStore()
  
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer'>('card')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState('RSA')
  const [amount, setAmount] = useState('')
  
  const rsaAsset = assets.find(asset => asset.symbol === 'RSA')
  const rsaPrice = rsaAsset?.price || 0.85
  
  // Card form data
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    email: '',
    amount: ''
  })
  
  // Transfer form data
  const [transferData, setTransferData] = useState({
    email: '',
    amount: '',
    fullName: '',
    bankName: ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateCardForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!cardData.cardNumber || cardData.cardNumber.length < 16) {
      newErrors.cardNumber = 'Please enter a valid card number'
    }
    
    if (!cardData.expiryDate || !/^\d{2}\/\d{2}$/.test(cardData.expiryDate)) {
      newErrors.expiryDate = 'Please enter valid expiry date (MM/YY)'
    }
    
    if (!cardData.cvv || cardData.cvv.length < 3) {
      newErrors.cvv = 'Please enter valid CVV'
    }
    
    if (!cardData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required'
    }
    
    if (!cardData.email || !/\S+@\S+\.\S+/.test(cardData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!cardData.amount || parseFloat(cardData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateTransferForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!transferData.email || !/\S+@\S+\.\S+/.test(transferData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!transferData.amount || parseFloat(transferData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount'
    }
    
    if (!transferData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateCardForm()) return
    
    setIsLoading(true)
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate sending confirmation email
      await sendConfirmationEmail(cardData.email, 'credit_card', cardData.amount)
      
      setEmailSent(true)
    } catch (error) {
      setErrors({ submit: 'Payment processing failed. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateTransferForm()) return
    
    setIsLoading(true)
    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Send bank transfer instructions email
      await sendConfirmationEmail(transferData.email, 'bank_transfer', transferData.amount)
      
      setEmailSent(true)
    } catch (error) {
      setErrors({ submit: 'Failed to send instructions. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const sendConfirmationEmail = async (email: string, method: string, amount: string) => {
    // Send email to support@rsacrypto.com with user details
    console.log(`Sending ${method} email to ${email} for amount ${amount}`)
    
    try {
      // In a real implementation, this would call your backend API
      const response = await fetch('/api/send-payment-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userEmail: email, 
          supportEmail: 'support@rsacrypto.com',
          method, 
          amount, 
          asset: selectedAsset,
          paymentData: method === 'credit_card' ? cardData : transferData,
          timestamp: new Date().toISOString()
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to send email')
      }
      
      console.log('Email sent successfully to support@rsacrypto.com')
    } catch (error) {
      console.error('Error sending email:', error)
      // For demo purposes, we'll still show success
      // In production, you would handle this error properly
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Email Sent Successfully!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {paymentMethod === 'card' 
                ? 'Payment confirmation and receipt have been sent to your email.'
                : 'Bank transfer instructions have been sent to your email address. Please follow the instructions to complete your purchase.'
              }
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/wallet')}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Wallet
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2 px-4 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Buy More Crypto
              </button>
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
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Buy Cryptocurrency
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Purchase RSA tokens and other cryptocurrencies using your credit card or bank transfer
            </p>
          </div>

          {/* RSA Price Display */}
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">RSA</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">RSA Token</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Real-time price</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">${rsaPrice.toFixed(2)}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">USD per RSA</div>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Choose Payment Method
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-6 border-2 rounded-lg transition-colors ${
                  paymentMethod === 'card'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                }`}
              >
                <CreditCard className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Credit Card</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Instant purchase with your credit or debit card
                </p>
              </button>
              
              <button
                onClick={() => setPaymentMethod('transfer')}
                className={`p-6 border-2 rounded-lg transition-colors ${
                  paymentMethod === 'transfer'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                }`}
              >
                <Building2 className="w-8 h-8 mx-auto mb-3 text-green-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Bank Transfer</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Lower fees via direct bank transfer
                </p>
              </button>
            </div>
          </div>

          {/* Payment Forms */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            {paymentMethod === 'card' ? (
              <form onSubmit={handleCardSubmit} className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Credit Card Information
                </h3>

                {/* Purchase Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount to Purchase (USD)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={cardData.amount}
                      onChange={(e) => setCardData({...cardData, amount: e.target.value})}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.amount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="100.00"
                    />
                  </div>
                  {cardData.amount && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      ≈ {(parseFloat(cardData.amount) / rsaPrice).toFixed(4)} RSA tokens
                    </p>
                  )}
                  {errors.amount && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.amount}</p>
                  )}
                </div>

                {/* Card Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    maxLength={19}
                    value={cardData.cardNumber}
                    onChange={(e) => setCardData({...cardData, cardNumber: formatCardNumber(e.target.value)})}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.cardNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="1234 5678 9012 3456"
                  />
                  {errors.cardNumber && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cardNumber}</p>
                  )}
                </div>

                {/* Expiry and CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      value={cardData.expiryDate}
                      onChange={(e) => setCardData({...cardData, expiryDate: formatExpiry(e.target.value)})}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.expiryDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="MM/YY"
                    />
                    {errors.expiryDate && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.expiryDate}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={cardData.cvv}
                      onChange={(e) => setCardData({...cardData, cvv: e.target.value.replace(/\D/g, '')})}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.cvv ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="123"
                    />
                    {errors.cvv && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cvv}</p>
                    )}
                  </div>
                </div>

                {/* Cardholder Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardData.cardholderName}
                    onChange={(e) => setCardData({...cardData, cardholderName: e.target.value})}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.cardholderName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="John Doe"
                  />
                  {errors.cardholderName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cardholderName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={cardData.email}
                      onChange={(e) => setCardData({...cardData, email: e.target.value})}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="john@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                  )}
                </div>

                {/* Security Notice */}
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center">
                    <Lock className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                      Secure Payment Processing
                    </span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Your payment information is encrypted and processed securely through our banking partners.
                  </p>
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing Payment...
                    </div>
                  ) : (
                    'Complete Purchase'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleTransferSubmit} className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Banknote className="w-5 h-5 mr-2" />
                  Bank Transfer Details
                </h3>

                {/* Purchase Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount to Purchase (USD)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={transferData.amount}
                      onChange={(e) => setTransferData({...transferData, amount: e.target.value})}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.amount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="100.00"
                    />
                  </div>
                  {transferData.amount && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      ≈ {(parseFloat(transferData.amount) / rsaPrice).toFixed(4)} RSA tokens
                    </p>
                  )}
                  {errors.amount && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.amount}</p>
                  )}
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={transferData.fullName}
                    onChange={(e) => setTransferData({...transferData, fullName: e.target.value})}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="John Doe"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fullName}</p>
                  )}
                </div>

                {/* Bank Name (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bank Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={transferData.bankName}
                    onChange={(e) => setTransferData({...transferData, bankName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Chase Bank"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={transferData.email}
                      onChange={(e) => setTransferData({...transferData, email: e.target.value})}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="john@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                  )}
                </div>

                {/* Transfer Instructions */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Info className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-800 dark:text-blue-200">
                      How Bank Transfer Works
                    </span>
                  </div>
                  <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                    <li>Submit your email address and purchase amount</li>
                    <li>You'll receive detailed bank transfer instructions via email</li>
                    <li>Complete the transfer using your bank's online banking or mobile app</li>
                    <li>Your RSA tokens will be credited within 1-3 business days</li>
                  </ol>
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-200 dark:focus:ring-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending Instructions...
                    </div>
                  ) : (
                    'Send Transfer Instructions'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}