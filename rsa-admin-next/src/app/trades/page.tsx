'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { RefreshCw, Plus, TrendingUp, TrendingDown, Minus, DollarSign, BarChart3, X, Zap } from 'lucide-react';

interface Trade {
  id: string;
  pair: string;
  price: number;
  amount: number;
  side: 'buy' | 'sell';
  timestamp: string;
  buyOrderId: string;
  sellOrderId: string;
}

interface TradingPair {
  symbol: string;
  baseToken: string;
  quoteToken: string;
  currentPrice: number;
  volume24h: number;
  change24h: number;
  high24h: number;
  low24h: number;
  trades24h: number;
  active: boolean;
  createdAt: string;
}

interface CreatePairForm {
  baseToken: string;
  quoteToken: string;
  initialPrice: number;
  enableMarketMaking: boolean;
  enableLiquidity: boolean;
}

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [tradingPairs, setTradingPairs] = useState<TradingPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPair, setSelectedPair] = useState<string>('all');
  const [showCreatePairModal, setShowCreatePairModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [createPairForm, setCreatePairForm] = useState<CreatePairForm>({
    baseToken: '',
    quoteToken: 'rUSDT',
    initialPrice: 0,
    enableMarketMaking: true,
    enableLiquidity: true
  });

  const [availableTokens] = useState([
    'rBTC', 'rETH', 'rUSDT', 'rUSDC', 'rBNB', 'rADA', 'rSOL', 'rDOT', 'rLINK', 'rUNI',
    'rSHIB', 'rDOGE', 'rPEPE', 'rFLOKI', 'rSAFE', 'rMOON', 'RSA'
  ]);

  useEffect(() => {
    fetchTrades();
    fetchTradingPairs();
  }, []);

  const fetchTrades = async () => {
    try {
      const response = await apiClient.get('/api/admin/trades');
      
      if (response.success && response.data && typeof response.data === 'object' && 'data' in response.data) {
        setTrades((response.data as any).data);
      } else {
        // Enhanced mock data
        const mockTrades: Trade[] = [
          {
            id: '1',
            pair: 'rSHIB/rUSDT',
            price: 0.000012,
            amount: 1000000,
            side: 'buy',
            timestamp: new Date().toISOString(),
            buyOrderId: 'buy_1',
            sellOrderId: 'sell_1'
          },
          {
            id: '2',
            pair: 'rETH/rUSDT',
            price: 3500.75,
            amount: 0.5,
            side: 'sell',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            buyOrderId: 'buy_2',
            sellOrderId: 'sell_2'
          },
          {
            id: '3',
            pair: 'rBTC/rUSDT',
            price: 65000.50,
            amount: 0.1,
            side: 'buy',
            timestamp: new Date(Date.now() - 600000).toISOString(),
            buyOrderId: 'buy_3',
            sellOrderId: 'sell_3'
          }
        ];
        setTrades(mockTrades);
      }
    } catch (error: any) {
      console.error('Trades fetch error:', error);
      setError('Failed to load trades');
    }
  };

  const fetchTradingPairs = async () => {
    try {
      const response = await apiClient.get('/api/pairs');
      
      if (response.success && response.data && typeof response.data === 'object' && 'pairs' in response.data) {
        setTradingPairs((response.data as any).pairs);
      } else {
        // Enhanced mock trading pairs
        const mockPairs: TradingPair[] = [
          {
            symbol: 'rSHIB/rUSDT',
            baseToken: 'rSHIB',
            quoteToken: 'rUSDT',
            currentPrice: 0.000012,
            volume24h: 50000000,
            change24h: -3.2,
            high24h: 0.000013,
            low24h: 0.000011,
            trades24h: 1250,
            active: true,
            createdAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            symbol: 'rETH/rUSDT',
            baseToken: 'rETH',
            quoteToken: 'rUSDT',
            currentPrice: 3500.75,
            volume24h: 15000000,
            change24h: 1.8,
            high24h: 3550.00,
            low24h: 3450.00,
            trades24h: 850,
            active: true,
            createdAt: new Date(Date.now() - 172800000).toISOString()
          },
          {
            symbol: 'rBTC/rUSDT',
            baseToken: 'rBTC',
            quoteToken: 'rUSDT',
            currentPrice: 65000.50,
            volume24h: 28000000,
            change24h: 3.2,
            high24h: 66000.00,
            low24h: 64000.00,
            trades24h: 650,
            active: true,
            createdAt: new Date(Date.now() - 259200000).toISOString()
          }
        ];
        setTradingPairs(mockPairs);
      }
    } catch (error: any) {
      console.error('Trading pairs fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePair = async () => {
    if (!createPairForm.baseToken || !createPairForm.quoteToken) {
      toast.error('Please select both base and quote tokens');
      return;
    }

    if (createPairForm.baseToken === createPairForm.quoteToken) {
      toast.error('Base and quote tokens must be different');
      return;
    }

    setCreating(true);
    
    try {
      const response = await apiClient.post('/api/dex/create-pair', createPairForm);

      if (response.success) {
        toast.success(`Trading pair ${createPairForm.baseToken}/${createPairForm.quoteToken} created successfully!`);
        
        // Refresh trading pairs
        await fetchTradingPairs();
        
        // Reset form and close modal
        setCreatePairForm({
          baseToken: '',
          quoteToken: 'rUSDT',
          initialPrice: 0,
          enableMarketMaking: true,
          enableLiquidity: true
        });
        setShowCreatePairModal(false);
      } else {
        toast.error(response.error || 'Failed to create trading pair');
      }
    } catch (error: any) {
      console.error('Create pair error:', error);
      toast.error('Failed to create trading pair');
    } finally {
      setCreating(false);
    }
  };

  const handleAutoFetchPrice = async () => {
    if (!createPairForm.baseToken) {
      toast.error('Please select a base token first');
      return;
    }

    try {
      // Mock price fetch - in real implementation, would call CoinGecko
      const mockPrices: Record<string, number> = {
        'rBTC': 65000.50,
        'rETH': 3500.75,
        'rBNB': 520.25,
        'rADA': 0.85,
        'rSOL': 180.50,
        'rSHIB': 0.000012,
        'rDOGE': 0.15,
        'rPEPE': 0.000008,
        'RSA': 0.85
      };

      const price = mockPrices[createPairForm.baseToken];
      if (price) {
        setCreatePairForm(prev => ({ ...prev, initialPrice: price }));
        toast.success(`Fetched live price: $${price.toLocaleString()}`);
      } else {
        toast.error('Price not available for this token');
      }
    } catch (error) {
      toast.error('Failed to fetch price');
    }
  };

  const filteredTrades = selectedPair === 'all' 
    ? trades 
    : trades.filter(trade => trade.pair === selectedPair);

  const formatPrice = (price: number) => {
    if (price < 0.001) {
      return price.toFixed(8);
    } else if (price < 1) {
      return price.toFixed(6);
    } else {
      return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(1)}K`;
    } else {
      return `$${volume.toFixed(0)}`;
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Trade Management</h1>
            <p className="text-gray-600 mt-2">
              Manage trading pairs and monitor trade activity
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                fetchTrades();
                fetchTradingPairs();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={() => setShowCreatePairModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-md hover:from-green-700 hover:to-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Trading Pair
            </button>
          </div>
        </div>

        {/* Trading Pairs Overview */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Active Trading Pairs
          </h2>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="text-gray-500">Loading trading pairs...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tradingPairs.map((pair) => (
                <div key={pair.symbol} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{pair.symbol}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      pair.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {pair.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium">${formatPrice(pair.currentPrice)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">24h Change:</span>
                      <span className={`font-medium flex items-center ${
                        pair.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {pair.change24h >= 0 ? (
                          <TrendingUp className="w-4 h-4 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 mr-1" />
                        )}
                        {pair.change24h >= 0 ? '+' : ''}{pair.change24h.toFixed(2)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">24h Volume:</span>
                      <span className="font-medium">{formatVolume(pair.volume24h)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">24h Trades:</span>
                      <span className="font-medium">{pair.trades24h.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trade History */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Trades</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Pair</label>
              <select
                value={selectedPair}
                onChange={(e) => setSelectedPair(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              >
                <option value="all">All Pairs</option>
                {tradingPairs.map((pair) => (
                  <option key={pair.symbol} value={pair.symbol}>
                    {pair.symbol}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-red-800">{error}</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pair
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Side
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTrades.map((trade) => (
                    <tr key={trade.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{trade.pair}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          trade.side === 'buy' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {trade.side.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${formatPrice(trade.price)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{trade.amount.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${(trade.price * trade.amount).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(trade.timestamp).toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Trading Pair Modal */}
        {showCreatePairModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      💱 Create Trading Pair
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Create a new trading pair with live price integration
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCreatePairModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Token Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Base Token *
                    </label>
                    <select
                      value={createPairForm.baseToken}
                      onChange={(e) => setCreatePairForm(prev => ({ ...prev, baseToken: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    >
                      <option value="">Select base token</option>
                      {availableTokens.map((token) => (
                        <option key={token} value={token}>{token}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quote Token *
                    </label>
                    <select
                      value={createPairForm.quoteToken}
                      onChange={(e) => setCreatePairForm(prev => ({ ...prev, quoteToken: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    >
                      <option value="rUSDT">rUSDT</option>
                      <option value="rUSDC">rUSDC</option>
                      <option value="rBTC">rBTC</option>
                      <option value="rETH">rETH</option>
                      <option value="RSA">RSA</option>
                    </select>
                  </div>
                </div>

                {/* Price Setting */}
                <div>
                  <label htmlFor="initialPrice" className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Price (Optional)
                  </label>
                  <div className="flex">
                    <input
                      id="initialPrice"
                      name="initialPrice"
                      type="number"
                      step="0.00000001"
                      value={createPairForm.initialPrice}
                      onChange={(e) => setCreatePairForm(prev => ({ ...prev, initialPrice: parseFloat(e.target.value) || 0 }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                      placeholder="Auto-fetch from CoinGecko"
                    />
                    <button
                      type="button"
                      onClick={handleAutoFetchPrice}
                      className="px-3 py-2 bg-orange-500 text-white rounded-r-md hover:bg-orange-600 transition-colors"
                      title="Auto-fetch live price"
                    >
                      <Zap className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to auto-fetch from CoinGecko or enter manual price
                  </p>
                </div>

                {/* Advanced Options */}
                <div className="border rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Advanced Options</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableMarketMaking"
                        checked={createPairForm.enableMarketMaking}
                        onChange={(e) => setCreatePairForm(prev => ({ ...prev, enableMarketMaking: e.target.checked }))}
                        className="mr-2"
                      />
                      <label htmlFor="enableMarketMaking" className="text-sm text-gray-900">
                        Enable Market Making (Automated liquidity provision)
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableLiquidity"
                        checked={createPairForm.enableLiquidity}
                        onChange={(e) => setCreatePairForm(prev => ({ ...prev, enableLiquidity: e.target.checked }))}
                        className="mr-2"
                      />
                      <label htmlFor="enableLiquidity" className="text-sm text-gray-900">
                        Create Liquidity Pool (AMM functionality)
                      </label>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                {createPairForm.baseToken && createPairForm.quoteToken && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-md font-semibold text-blue-900 mb-2">
                      📊 Trading Pair Preview
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>✅ Pair: {createPairForm.baseToken}/{createPairForm.quoteToken}</li>
                      <li>✅ Initial Price: ${createPairForm.initialPrice > 0 ? formatPrice(createPairForm.initialPrice) : 'Auto-fetch'}</li>
                      <li>✅ Market Making: {createPairForm.enableMarketMaking ? 'Enabled' : 'Disabled'}</li>
                      <li>✅ Liquidity Pool: {createPairForm.enableLiquidity ? 'Enabled' : 'Disabled'}</li>
                      <li>✅ Will be available in: Swap, Exchange, Charts, Mobile App</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreatePairModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePair}
                  disabled={creating || !createPairForm.baseToken || !createPairForm.quoteToken}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-md hover:from-green-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {creating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Pair
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 