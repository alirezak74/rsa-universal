'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Shield, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Eye,
  Settings,
  Bell,
  FileText
} from 'lucide-react';

interface HotWalletData {
  totalValue: number;
  totalNetworks: number;
  hotWalletRatio: number;
  dailyVolume: number;
  realCoinBalances: Record<string, any>;
  treasuryOperations: {
    dailyDeposits: number;
    dailyWithdrawals: number;
    pendingApprovals: number;
    requiresAttention: number;
  };
  riskMetrics: {
    hotColdRatio: { current: number; recommended: number; status: string };
    liquidityScore: number;
    securityScore: number;
    overallRisk: string;
  };
}

interface Alert {
  id: string;
  type: string;
  severity: 'critical' | 'warning' | 'info';
  network: string;
  symbol: string;
  message: string;
  createdAt: string;
}

export default function HotWalletPage() {
  const [data, setData] = useState<HotWalletData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchHotWalletData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/hot-wallet/dashboard');
      
      if (response.success) {
        setData(response.data as HotWalletData);
        setLastUpdated(new Date());
      } else {
        toast.error('Failed to load hot wallet data');
      }
    } catch (error) {
      console.error('Error fetching hot wallet data:', error);
      toast.error('Error loading hot wallet dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      setAlertsLoading(true);
      const response = await apiClient.get('/admin/hot-wallet/alerts');
      
      if (response.success) {
        setAlerts((response.data as any)?.alerts || []);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setAlertsLoading(false);
    }
  };

  useEffect(() => {
    fetchHotWalletData();
    fetchAlerts();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchHotWalletData();
      fetchAlerts();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTopNetworksByValue = () => {
    if (!data?.realCoinBalances) return [];
    
    return Object.entries(data.realCoinBalances)
      .sort(([,a], [,b]) => b.usdValue - a.usdValue)
      .slice(0, 6);
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-gray-300 rounded-lg"></div>
              <div className="h-96 bg-gray-300 rounded-lg"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🔥 Hot Wallet Management</h1>
            <p className="text-gray-600 mt-1">
              Real-time monitoring and management of cryptocurrency treasury operations
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <button
              onClick={() => {
                fetchHotWalletData();
                fetchAlerts();
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Portfolio Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data ? formatCurrency(data.totalValue) : '--'}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 ml-1">Across {data?.totalNetworks || 0} networks</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hot/Cold Ratio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data?.hotWalletRatio || 0}% / {100 - (data?.hotWalletRatio || 0)}%
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className={`text-sm px-2 py-1 rounded-full ${
                data?.riskMetrics?.hotColdRatio?.status === 'optimal' 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-yellow-100 text-yellow-600'
              }`}>
                {data?.riskMetrics?.hotColdRatio?.status || 'Unknown'}
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Daily Volume</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data ? formatCurrency(data.dailyVolume) : '--'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center">
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-gray-600">{formatNumber(data?.treasuryOperations?.dailyDeposits || 0)} deposits</span>
              </div>
              <div className="flex items-center">
                <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                <span className="text-gray-600">{formatNumber(data?.treasuryOperations?.dailyWithdrawals || 0)} withdrawals</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Security Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data?.riskMetrics?.securityScore || 0}/10
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className={`text-sm px-2 py-1 rounded-full ${getRiskColor(data?.riskMetrics?.overallRisk || 'low')}`}>
                {data?.riskMetrics?.overallRisk || 'Unknown'} risk
              </span>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-yellow-500" />
                  Active Alerts ({alerts.length})
                </h2>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View All
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {alerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          <span className="font-medium capitalize">{alert.type.replace('_', ' ')}</span>
                          <span className="ml-2 text-sm">• {alert.network.toUpperCase()}</span>
                        </div>
                        <p className="mt-1 text-sm">{alert.message}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(alert.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Network Balances and Treasury Operations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Networks by Value */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Wallet className="h-5 w-5 mr-2 text-blue-500" />
                Top Networks by Value
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {getTopNetworksByValue().map(([network, balance]) => (
                  <div key={network} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {balance.symbol}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900 capitalize">{balance.name}</p>
                        <p className="text-sm text-gray-600">{balance.balance}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(balance.usdValue)}</p>
                      <p className="text-sm text-gray-600">{balance.addresses} addresses</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <button className="w-full px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                  View All Networks
                </button>
              </div>
            </div>
          </div>

          {/* Treasury Operations */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-green-500" />
                Treasury Operations
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formatNumber(data?.treasuryOperations?.dailyDeposits || 0)}
                  </div>
                  <div className="text-sm text-green-700">Daily Deposits</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatNumber(data?.treasuryOperations?.dailyWithdrawals || 0)}
                  </div>
                  <div className="text-sm text-blue-700">Daily Withdrawals</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm font-medium text-yellow-800">Pending Approvals</span>
                  <span className="text-lg font-bold text-yellow-600">
                    {data?.treasuryOperations?.pendingApprovals || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium text-red-800">Requires Attention</span>
                  <span className="text-lg font-bold text-red-600">
                    {data?.treasuryOperations?.requiresAttention || 0}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  View Transactions
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  Manage Approvals
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="p-4 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Settings className="h-6 w-6 text-gray-600 mb-2" />
                <div className="font-medium text-gray-900">Transfer Funds</div>
                <div className="text-sm text-gray-600">Move funds between wallets</div>
              </button>
              
              <button className="p-4 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Eye className="h-6 w-6 text-gray-600 mb-2" />
                <div className="font-medium text-gray-900">View Balances</div>
                <div className="text-sm text-gray-600">Detailed network balances</div>
              </button>
              
              <button className="p-4 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Bell className="h-6 w-6 text-gray-600 mb-2" />
                <div className="font-medium text-gray-900">Manage Alerts</div>
                <div className="text-sm text-gray-600">Configure alert settings</div>
              </button>
              
              <button className="p-4 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <FileText className="h-6 w-6 text-gray-600 mb-2" />
                <div className="font-medium text-gray-900">Compliance Report</div>
                <div className="text-sm text-gray-600">Generate audit reports</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}