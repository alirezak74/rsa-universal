'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { Settings, Database, Shield, Bell, CreditCard, DollarSign, Percent, Calculator, TrendingUp, AlertTriangle } from 'lucide-react'

interface FeeStructure {
  tradingFee: number
  withdrawalFee: number
  depositFee: number
  bridgeFee: number
  makerFee: number
  takerFee: number
  minimumWithdrawal: number
  maximumWithdrawal: number
}

interface RevenueStats {
  dailyRevenue: number
  weeklyRevenue: number
  monthlyRevenue: number
  totalRevenue: number
  tradingFees: number
  withdrawalFees: number
  bridgeFees: number
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [sessionTimeout, setSessionTimeout] = useState('30')
  const [feeStructure, setFeeStructure] = useState<FeeStructure>({
    tradingFee: 0.1,
    withdrawalFee: 0.5,
    depositFee: 0,
    bridgeFee: 0.2,
    makerFee: 0.05,
    takerFee: 0.1,
    minimumWithdrawal: 10,
    maximumWithdrawal: 100000
  })
  const [revenueStats, setRevenueStats] = useState<RevenueStats>({
    dailyRevenue: 1250.50,
    weeklyRevenue: 8750.25,
    monthlyRevenue: 37500.75,
    totalRevenue: 125000.00,
    tradingFees: 85000.00,
    withdrawalFees: 25000.00,
    bridgeFees: 15000.00
  })
  const [loading, setLoading] = useState(false)

  const tabs = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'fees', name: 'Fee Management', icon: '💰' },
    { id: 'revenue', name: 'Revenue Analytics', icon: '📊' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' }
  ]

  const handleFeeUpdate = async (field: keyof FeeStructure, value: number) => {
    setLoading(true)
    try {
      const updatedFees = { ...feeStructure, [field]: value }
      setFeeStructure(updatedFees)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      console.log('Fee structure updated:', updatedFees)
    } catch (error) {
      console.error('Failed to update fee structure:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRevenueExport = () => {
    const data = {
      feeStructure,
      revenueStats,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `revenue-report-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">Configure system settings, manage feature flags, and adjust network and security parameters.</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">General Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout</label>
                  <select
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">Current: {sessionTimeout} minutes</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">System Status</label>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-900">Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Security Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout</label>
                  <select
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">Current: {sessionTimeout} minutes</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Two-Factor Authentication</label>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-900">Enabled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fee Management */}
        {activeTab === 'fees' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Fee Management
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trading Fee (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={feeStructure.tradingFee}
                    onChange={(e) => handleFeeUpdate('tradingFee', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Withdrawal Fee (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={feeStructure.withdrawalFee}
                    onChange={(e) => handleFeeUpdate('withdrawalFee', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bridge Fee (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={feeStructure.bridgeFee}
                    onChange={(e) => handleFeeUpdate('bridgeFee', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maker Fee (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={feeStructure.makerFee}
                    onChange={(e) => handleFeeUpdate('makerFee', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Taker Fee (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={feeStructure.takerFee}
                    onChange={(e) => handleFeeUpdate('takerFee', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Withdrawal ($)</label>
                  <input
                    type="number"
                    value={feeStructure.minimumWithdrawal}
                    onChange={(e) => handleFeeUpdate('minimumWithdrawal', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Fee Calculator
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-blue-900">Trading Fee</div>
                  <div className="text-2xl font-bold text-blue-600">{feeStructure.tradingFee}%</div>
                  <div className="text-xs text-blue-700">Per trade</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-green-900">Withdrawal Fee</div>
                  <div className="text-2xl font-bold text-green-600">{feeStructure.withdrawalFee}%</div>
                  <div className="text-xs text-green-700">Per withdrawal</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-purple-900">Bridge Fee</div>
                  <div className="text-2xl font-bold text-purple-600">{feeStructure.bridgeFee}%</div>
                  <div className="text-xs text-purple-700">Cross-chain transfer</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Analytics */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Revenue Analytics
                </h2>
                <button
                  onClick={handleRevenueExport}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Export Report
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-blue-900">Daily Revenue</div>
                  <div className="text-2xl font-bold text-blue-600">${revenueStats.dailyRevenue.toLocaleString()}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-green-900">Weekly Revenue</div>
                  <div className="text-2xl font-bold text-green-600">${revenueStats.weeklyRevenue.toLocaleString()}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-purple-900">Monthly Revenue</div>
                  <div className="text-2xl font-bold text-purple-600">${revenueStats.monthlyRevenue.toLocaleString()}</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-orange-900">Total Revenue</div>
                  <div className="text-2xl font-bold text-orange-600">${revenueStats.totalRevenue.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue Breakdown</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Trading Fees</span>
                  <span className="text-sm font-bold text-gray-900">${revenueStats.tradingFees.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Withdrawal Fees</span>
                  <span className="text-sm font-bold text-gray-900">${revenueStats.withdrawalFees.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Bridge Fees</span>
                  <span className="text-sm font-bold text-gray-900">${revenueStats.bridgeFees.toLocaleString()}</span>
                </div>
                <hr className="my-4" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">Total Revenue</span>
                  <span className="text-sm font-bold text-gray-900">${revenueStats.totalRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Settings */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notification Settings
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Email Notifications</div>
                    <div className="text-sm text-gray-500">Receive notifications via email</div>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Large Transaction Alerts</div>
                    <div className="text-sm text-gray-500">Alert for transactions over $10,000</div>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">System Status Alerts</div>
                    <div className="text-sm text-gray-500">Receive system status updates</div>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Settings className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Settings Information</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Configure system settings, manage feature flags, and adjust network and security parameters. Changes are applied immediately.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
} 