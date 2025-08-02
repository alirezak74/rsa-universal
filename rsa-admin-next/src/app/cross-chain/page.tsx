'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { Bitcoin, RefreshCw, ExternalLink, CheckCircle, Clock, AlertCircle, Eye, Search, Filter, Coins, Zap, Hexagon } from 'lucide-react'

interface DepositAddress {
  id: string
  userId: string
  network: string
  address: string
  createdAt: string
  isActive: boolean
}

interface Deposit {
  id: string
  userId: string
  network: string
  txHash: string
  fromAddress: string
  toAddress: string
  amount: number
  tokenSymbol: string
  confirmations: number
  requiredConfirmations: number
  status: 'pending' | 'confirming' | 'completed' | 'failed'
  wrappedAmount?: number
  createdAt: string
}

interface Withdrawal {
  id: string
  userId: string
  network: string
  txHash?: string
  toAddress: string
  amount: number
  tokenSymbol: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
}

const NETWORK_ICONS: { [key: string]: string } = {
  bitcoin: '₿',
  ethereum: 'Ξ',
  solana: '◎',
  avalanche: '🔺',
  bsc: '🟡',
  usdt: '₮',
  usdc: '🔵'
}

const EXPLORER_URLS: { [key: string]: string } = {
  bitcoin: 'https://blockstream.info/tx/',
  ethereum: 'https://etherscan.io/tx/',
  solana: 'https://solscan.io/tx/',
  avalanche: 'https://snowtrace.io/tx/',
  bsc: 'https://bscscan.com/tx/',
  usdt: 'https://etherscan.io/tx/',
  usdc: 'https://etherscan.io/tx/'
}

export default function CrossChainPage() {
  const [activeTab, setActiveTab] = useState<'deposits' | 'addresses' | 'withdrawals'>('deposits')
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [addresses, setAddresses] = useState<DepositAddress[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [networkFilter, setNetworkFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showAddAddressModal, setShowAddAddressModal] = useState(false)
  const [newAddress, setNewAddress] = useState({ network: 'bitcoin', userId: '', address: '' })

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      const endpoint = activeTab === 'deposits' ? '/api/dev/admin/deposits' :
                     activeTab === 'addresses' ? '/api/dev/admin/deposit-addresses' :
                     '/api/dev/admin/withdrawals'
      
      const response = await fetch(`http://localhost:8001${endpoint}`)
      if (response.ok) {
        const data = await response.json()
        
        if (activeTab === 'deposits') {
          setDeposits(data.deposits || [])
        } else if (activeTab === 'addresses') {
          setAddresses(data.addresses || [])
        } else {
          setWithdrawals(data.withdrawals || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'confirming':
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300'
      case 'confirming':
      case 'processing':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300'
      case 'completed':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300'
      case 'failed':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const handleAddAddress = async () => {
    if (!newAddress.userId || !newAddress.address) {
      alert('Please fill in all fields')
      return
    }

    try {
      const response = await fetch('http://localhost:8001/api/deposits/generate-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: newAddress.userId,
          network: newAddress.network,
          symbol: 'BTC' // Default to BTC for now
        })
      })

      if (response.ok) {
        // Refresh addresses
        if (activeTab === 'addresses') {
          fetchData()
        }
        setShowAddAddressModal(false)
        setNewAddress({ network: 'bitcoin', userId: '', address: '' })
      }
    } catch (error) {
      console.error('Failed to add address:', error)
    }
  }

  const filteredData = () => {
    let data: any[] = []
    
    if (activeTab === 'deposits') {
      data = deposits
    } else if (activeTab === 'addresses') {
      data = addresses
    } else {
      data = withdrawals
    }

    return data.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.txHash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.toAddress?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesNetwork = networkFilter === '' || item.network === networkFilter
      const matchesStatus = statusFilter === '' || item.status === statusFilter

      return matchesSearch && matchesNetwork && matchesStatus
    })
  }

  const getUniqueNetworks = () => {
    let data: any[] = []
    if (activeTab === 'deposits') data = deposits
    else if (activeTab === 'addresses') data = addresses
    else data = withdrawals

    return Array.from(new Set(data.map(item => item.network)))
  }

  const getUniqueStatuses = () => {
    let data: any[] = []
    if (activeTab === 'deposits') data = deposits
    else if (activeTab === 'withdrawals') data = withdrawals
    else return []

    return Array.from(new Set(data.map(item => item.status)))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatAmount = (amount: number, decimals: number = 6) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals
    })
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Cross-Chain Admin Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Monitor and manage cross-chain deposits, addresses, and withdrawals for admin control
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'deposits', label: 'Deposits', icon: Bitcoin },
              { key: 'addresses', label: 'Deposit Addresses', icon: Eye },
              { key: 'withdrawals', label: 'Withdrawals', icon: Coins }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by user ID, address, or transaction..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <select
                value={networkFilter}
                onChange={(e) => setNetworkFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Networks</option>
                {getUniqueNetworks().map(network => (
                  <option key={network} value={network}>
                    {NETWORK_ICONS[network]} {network.charAt(0).toUpperCase() + network.slice(1)}
                  </option>
                ))}
              </select>

              {(activeTab === 'deposits' || activeTab === 'withdrawals') && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Statuses</option>
                  {getUniqueStatuses().map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              {activeTab === 'addresses' && (
                <button
                  onClick={() => setShowAddAddressModal(true)}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Add Address
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Loading...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Deposits Table */}
              {activeTab === 'deposits' && (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">User ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Network</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Confirmations</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData().map((deposit: Deposit) => (
                      <tr key={deposit.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                        <td className="py-3 px-4 text-gray-900 dark:text-white font-mono text-sm">
                          {deposit.userId.slice(0, 8)}...
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <span className="text-xl mr-2">{NETWORK_ICONS[deposit.network]}</span>
                            <span className="text-gray-900 dark:text-white capitalize">{deposit.network}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-white">
                          {formatAmount(deposit.amount)} {deposit.tokenSymbol}
                          {deposit.wrappedAmount && (
                            <div className="text-sm text-green-600 dark:text-green-400">
                              → {formatAmount(deposit.wrappedAmount)} r{deposit.tokenSymbol}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {getStatusIcon(deposit.status)}
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deposit.status)}`}>
                              {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-white">
                          {deposit.confirmations}/{deposit.requiredConfirmations}
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-sm">
                          {formatDate(deposit.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          {deposit.txHash && (
                            <a
                              href={`${EXPLORER_URLS[deposit.network]}${deposit.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                            >
                              View TX
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Addresses Table */}
              {activeTab === 'addresses' && (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">User ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Network</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Address</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData().map((address: DepositAddress) => (
                      <tr key={address.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                        <td className="py-3 px-4 text-gray-900 dark:text-white font-mono text-sm">
                          {address.userId.slice(0, 8)}...
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <span className="text-xl mr-2">{NETWORK_ICONS[address.network]}</span>
                            <span className="text-gray-900 dark:text-white capitalize">{address.network}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-white font-mono text-sm">
                          {address.address}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            address.isActive 
                              ? 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300'
                              : 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300'
                          }`}>
                            {address.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-sm">
                          {formatDate(address.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Withdrawals Table */}
              {activeTab === 'withdrawals' && (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">User ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Network</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">To Address</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData().map((withdrawal: Withdrawal) => (
                      <tr key={withdrawal.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                        <td className="py-3 px-4 text-gray-900 dark:text-white font-mono text-sm">
                          {withdrawal.userId.slice(0, 8)}...
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <span className="text-xl mr-2">{NETWORK_ICONS[withdrawal.network]}</span>
                            <span className="text-gray-900 dark:text-white capitalize">{withdrawal.network}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-white">
                          {formatAmount(withdrawal.amount)} {withdrawal.tokenSymbol}
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-white font-mono text-sm">
                          {withdrawal.toAddress.slice(0, 8)}...{withdrawal.toAddress.slice(-8)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {getStatusIcon(withdrawal.status)}
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                              {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-sm">
                          {formatDate(withdrawal.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          {withdrawal.txHash && (
                            <a
                              href={`${EXPLORER_URLS[withdrawal.network]}${withdrawal.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                            >
                              View TX
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {filteredData().length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-500 dark:text-gray-400">
                    No {activeTab} found
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Bitcoin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {deposits.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total Deposits
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {deposits.filter(d => d.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Completed
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {deposits.filter(d => d.status === 'pending' || d.status === 'confirming').length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Pending
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {addresses.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Active Addresses
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add Deposit Address
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Network
                </label>
                <select
                  value={newAddress.network}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, network: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="bitcoin">Bitcoin</option>
                  <option value="ethereum">Ethereum</option>
                  <option value="usdt">USDT</option>
                  <option value="usdc">USDC</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  User ID
                </label>
                <input
                  type="text"
                  value={newAddress.userId}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, userId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter user ID"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddAddressModal(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAddress}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Generate Address
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </Layout>
  )
}