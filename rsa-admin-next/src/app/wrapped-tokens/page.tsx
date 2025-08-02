'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Coins,
  ArrowUpCircle,
  ArrowDownCircle,
  Activity,
  RefreshCw,
  PlusCircle,
  MinusCircle,
  AlertCircle,
  CheckCircle,
  DollarSign,
  BarChart3,
  Users,
  Zap
} from 'lucide-react';

interface WrappedTokenData {
  totalCollateral: number;
  totalWrapped: number;
  collateralRatio: number;
  minimumRatio: number;
  status: string;
  wrappedTokens: Record<string, {
    collateral: number;
    collateralValue: number;
    minted: string;
    mintedValue: number;
    ratio: number;
    status: string;
    tradingVolume24h: number;
    network: string;
    users: number;
    totalSupply: string;
    circulatingSupply: string;
  }>;
  defiOperations: {
    liquidityPools: number;
    totalLiquidity: number;
    stakingRewards: number;
    totalStaked: number;
    averageAPY: number;
    yieldGenerated24h: number;
    activeStrategies: number;
  };
  bridgeStats: {
    totalBridgeVolume24h: number;
    bridgeTransactions24h: number;
    averageBridgeTime: string;
    bridgeUptime: number;
    networksActive: number;
    failedBridges24h: number;
  };
}

interface MintBurnOperation {
  id: string;
  type: 'mint' | 'burn';
  symbol: string;
  amount: string;
  status: 'processing' | 'completed' | 'failed';
  timestamp: string;
  userAddress: string;
  network: string;
  estimatedCompletion?: string;
}

export default function WrappedTokensPage() {
  const [data, setData] = useState<WrappedTokenData | null>(null);
  const [recentOperations, setRecentOperations] = useState<MintBurnOperation[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [showMintModal, setShowMintModal] = useState(false);
  const [showBurnModal, setShowBurnModal] = useState(false);

  const fetchWrappedTokenData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/wrapped-tokens/dashboard');
      
      if (response.success) {
        setData(response.data as WrappedTokenData);
        setLastUpdated(new Date());
      } else {
        toast.error('Failed to load wrapped token data');
      }
    } catch (error) {
      console.error('Error fetching wrapped token data:', error);
      toast.error('Error loading wrapped tokens dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWrappedTokenData();
    
    // Mock recent operations for demonstration
    setRecentOperations([
      {
        id: 'mint_001',
        type: 'mint',
        symbol: 'rBTC',
        amount: '2.5',
        status: 'completed',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        userAddress: '0x742d35Cc6634C0532925a3b8D000B44C123CF98E',
        network: 'bitcoin'
      },
      {
        id: 'burn_002',
        type: 'burn',
        symbol: 'rETH',
        amount: '15.8',
        status: 'processing',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        userAddress: '0x456d35Cc6634C0532925a3b8D000B44C789DEF12',
        network: 'ethereum',
        estimatedCompletion: new Date(Date.now() + 1200000).toISOString()
      }
    ]);
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchWrappedTokenData, 30000);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getOperationStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing': return <Activity className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getWrappedTokensArray = () => {
    if (!data?.wrappedTokens) return [];
    
    return Object.entries(data.wrappedTokens).map(([symbol, tokenData]) => ({
      symbol,
      ...tokenData
    }));
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
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
            <h1 className="text-3xl font-bold text-gray-900">🌟 Wrapped Tokens Management</h1>
            <p className="text-gray-600 mt-1">
              Collateral monitoring and wrapped token lifecycle management
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <button
              onClick={fetchWrappedTokenData}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Collateral Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Collateral</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data ? formatCurrency(data.totalCollateral) : '--'}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 ml-1">Backing {Object.keys(data?.wrappedTokens || {}).length} tokens</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Collateral Ratio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data?.collateralRatio || 0}%
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className={`text-sm px-2 py-1 rounded-full ${
                data?.status === 'HEALTHY' 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-yellow-100 text-yellow-600'
              }`}>
                {data?.status || 'Unknown'}
              </span>
              <span className="text-xs text-gray-500 ml-2">Min: {data?.minimumRatio || 0}%</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Wrapped Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data ? formatCurrency(data.totalWrapped) : '--'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Coins className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-blue-600 ml-1">
                {getWrappedTokensArray().reduce((sum, token) => sum + token.users, 0)} total users
              </span>
            </div>
          </div>
        </div>

        {/* Wrapped Tokens Overview */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Coins className="h-5 w-5 mr-2 text-purple-500" />
                Wrapped Tokens Portfolio
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowMintModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Mint</span>
                </button>
                <button
                  onClick={() => setShowBurnModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <MinusCircle className="h-4 w-4" />
                  <span>Burn</span>
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {getWrappedTokensArray().map((token) => (
                <div key={token.symbol} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                        {token.symbol.replace('r', '')}
                      </div>
                      <div className="ml-3">
                        <h3 className="font-semibold text-gray-900">{token.symbol}</h3>
                        <p className="text-sm text-gray-600 capitalize">{token.network} Network</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(token.status)}`}>
                      {token.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Collateral</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(token.collateralValue)}</p>
                      <p className="text-xs text-gray-500">{token.collateral} {token.symbol.replace('r', '')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Minted</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(token.mintedValue)}</p>
                      <p className="text-xs text-gray-500">{token.minted}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Collateral Ratio</span>
                      <span className={`text-sm font-semibold ${
                        (token.ratio || 100) >= 110 ? 'text-green-600' : 
                        (token.ratio || 100) >= 105 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {(token.ratio || 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          (token.ratio || 100) >= 110 ? 'bg-green-500' : 
                          (token.ratio || 100) >= 105 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(token.ratio || 100, 150)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center text-sm">
                    <div>
                      <p className="text-gray-600">24h Volume</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(token.tradingVolume24h)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Users</p>
                      <p className="font-semibold text-gray-900">{formatNumber(token.users)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Supply</p>
                      <p className="font-semibold text-gray-900">{token.circulatingSupply.split(' ')[0]}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DeFi Operations and Bridge Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* DeFi Operations */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                DeFi Operations
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {data?.defiOperations?.liquidityPools || 0}
                  </div>
                  <div className="text-sm text-blue-700">Liquidity Pools</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {data?.defiOperations?.averageAPY || 0}%
                  </div>
                  <div className="text-sm text-green-700">Average APY</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Liquidity</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(data?.defiOperations?.totalLiquidity || 0)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Staked</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(data?.defiOperations?.totalStaked || 0)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Daily Rewards</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(data?.defiOperations?.stakingRewards || 0)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">24h Yield Generated</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(data?.defiOperations?.yieldGenerated24h || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bridge Statistics */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-indigo-500" />
                Cross-Chain Bridge Stats
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">
                    {data?.bridgeStats?.bridgeTransactions24h || 0}
                  </div>
                  <div className="text-sm text-indigo-700">24h Transactions</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {data?.bridgeStats?.bridgeUptime || 0}%
                  </div>
                  <div className="text-sm text-purple-700">Bridge Uptime</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">24h Volume</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(data?.bridgeStats?.totalBridgeVolume24h || 0)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Bridge Time</span>
                  <span className="font-semibold text-gray-900">
                    {data?.bridgeStats?.averageBridgeTime || '0 minutes'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Networks</span>
                  <span className="font-semibold text-gray-900">
                    {data?.bridgeStats?.networksActive || 0}/13
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Failed Bridges (24h)</span>
                  <span className={`font-semibold ${
                    (data?.bridgeStats?.failedBridges24h || 0) === 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {data?.bridgeStats?.failedBridges24h || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Operations */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-green-500" />
              Recent Mint/Burn Operations
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentOperations.map((operation) => (
                <div key={operation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200">
                      {operation.type === 'mint' ? (
                        <ArrowUpCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <ArrowDownCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900 capitalize">{operation.type}</span>
                        <span className="ml-2 text-sm text-gray-600">
                          {operation.amount} {operation.symbol}
                        </span>
                        {getOperationStatusIcon(operation.status)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {operation.network.toUpperCase()} • {operation.userAddress.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-900">
                      {new Date(operation.timestamp).toLocaleTimeString()}
                    </div>
                    {operation.estimatedCompletion && (
                      <div className="text-xs text-blue-600">
                        ETA: {new Date(operation.estimatedCompletion).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}