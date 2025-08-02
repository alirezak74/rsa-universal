'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { apiClient } from '@/lib/api';
import { TRADING_PAIRS, CONFIG } from '@/config/settings';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalOrders: number;
  totalTrades: number;
  activeMarkets: number;
  recentTrades: any[];
  marketData: any[];
  loading: boolean;
  error: string | null;
}

const COINGECKO_IDS = {
  BTC: 'bitcoin',
  USDT: 'tether',
  RSA: 'rsachain', // Replace with actual CoinGecko ID for RSA if available
};

const fetchLivePrices = async () => {
  const ids = Object.values(COINGECKO_IDS).join(',');
  // Use backend proxy to avoid CORS issues
  const url = `/api/proxy/coingecko/simple/price?ids=${ids}&vs_currencies=usd`;
  const res = await apiClient.get(url);
  return res.data;
};

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalTrades: 0,
    activeMarkets: 0,
    recentTrades: [],
    marketData: [],
    loading: true,
    error: null,
  });
  const [livePrices, setLivePrices] = useState<any>(null);
  const [livePricesLoading, setLivePricesLoading] = useState(false);
  const [livePricesError, setLivePricesError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
    getPrices();
  }, []);

  const fetchDashboardData = async () => {
    setStats(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Fetch data from RSA DEX backend
      const [ordersRes, marketsRes, tradesRes] = await Promise.all([
        apiClient.getOrders(1, 100), // Get recent orders
        apiClient.getMarkets(), // Get available markets
        Promise.all(TRADING_PAIRS.map(pair => 
          apiClient.getTrades(pair).catch(() => ({ success: false, data: [] }))
        )), // Get recent trades for each pair
      ]);

      // Process orders data
      const totalOrders = ordersRes.success ? ordersRes.data?.data?.length || 0 : 0;
      
      // Process markets data
      const activeMarkets = marketsRes.success && Array.isArray(marketsRes.data) ? marketsRes.data.length : 0;
      
      // Process trades data
      const allTrades = tradesRes
        .filter(res => res.success)
        .flatMap(res => Array.isArray(res.data) ? res.data : [])
        .filter(trade => trade && (trade.createdAt || trade.timestamp))
        .sort((a, b) => new Date(b.createdAt || b.timestamp).getTime() - new Date(a.createdAt || a.timestamp).getTime())
        .slice(0, 10);

      const totalTrades = allTrades.length;

      setStats({
        totalOrders,
        totalTrades,
        activeMarkets,
        recentTrades: allTrades,
        marketData: marketsRes.success && Array.isArray(marketsRes.data) ? marketsRes.data : [],
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Dashboard data fetch error:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load dashboard data. Please check if the RSA DEX backend is running.',
      }));
      toast.error('Failed to load dashboard data');
    }
  };

  const getPrices = async () => {
    setLivePricesLoading(true);
    setLivePricesError(null);
    try {
      const data = await fetchLivePrices();
      setLivePrices(data);
    } catch (err) {
      setLivePricesError('Failed to fetch live prices');
    } finally {
      setLivePricesLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(amount);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(price);
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">RSA DEX Admin Dashboard</h1>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        {stats.loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading dashboard data...</div>
          </div>
        ) : stats.error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="text-red-800">{stats.error}</div>
            <div className="text-red-600 text-sm mt-2">
              Make sure the RSA DEX backend is running on http://localhost:8000
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div
                className="bg-white rounded-lg shadow p-6 cursor-pointer hover:ring-2 hover:ring-blue-400 transition"
                onClick={() => router.push('/orders')}
                title="View all orders"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Orders</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
                  </div>
                </div>
              </div>

              <div
                className="bg-white rounded-lg shadow p-6 cursor-pointer hover:ring-2 hover:ring-green-400 transition"
                onClick={() => router.push('/trades')}
                title="View all trades"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Trades</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalTrades}</p>
                  </div>
                </div>
              </div>

              <div
                className="bg-white rounded-lg shadow p-6 cursor-pointer hover:ring-2 hover:ring-purple-400 transition"
                onClick={() => router.push('/markets')}
                title="View all markets"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Markets</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.activeMarkets}</p>
                  </div>
                </div>
              </div>

              <div
                className="bg-white rounded-lg shadow p-6 cursor-pointer hover:ring-2 hover:ring-yellow-400 transition"
                onClick={() => router.push('/wallets')}
                title="View all trading purses"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Trading Pairs</p>
                    <p className="text-2xl font-semibold text-gray-900">{TRADING_PAIRS.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Trades */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Trades</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pair</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Side</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.recentTrades.length > 0 ? (
                      stats.recentTrades.map((trade, index) => (
                        <tr key={`trade-${trade.id || index}-${trade.timestamp || new Date().getTime()}-${index}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {trade.pair || trade.symbol || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              trade.side === 'buy' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {trade.side?.toUpperCase() || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatAmount(trade.amount || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${formatAmount(trade.price || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {trade.timestamp ? new Date(trade.timestamp).toLocaleTimeString() : 'N/A'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          No recent trades found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Market Data */}
            {stats.marketData.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Market Overview</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pair</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">24h Change</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">24h Volume</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.marketData.map((market, index) => (
                        <tr key={`market-${market.pair || 'unknown'}-${market.lastPrice || 0}-${index}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {market.pair || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatPrice(market.lastPrice || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              (market.change24h || 0) >= 0 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {market.change24h ? `${market.change24h >= 0 ? '+' : ''}${market.change24h.toFixed(2)}%` : 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatPrice(market.volume24h || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Live Prices Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2">Live Prices (USD)</h2>
              {livePricesLoading ? (
                <div className="text-gray-500">Loading prices...</div>
              ) : livePricesError ? (
                <div className="text-red-600">{livePricesError}</div>
              ) : livePrices ? (
                <div className="flex flex-wrap gap-4">
                  {Object.entries(COINGECKO_IDS).map(([symbol, id]) => (
                    <div key={symbol} className="px-4 py-2 bg-gray-100 rounded shadow text-center">
                      <div className="text-sm text-gray-500">{symbol}</div>
                      <div className="text-xl font-bold text-gray-900">
                        {livePrices[id]?.usd ? `$${livePrices[id].usd.toLocaleString()}` : 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
} 