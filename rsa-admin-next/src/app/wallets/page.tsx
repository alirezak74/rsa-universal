'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { TRADING_PAIRS } from '@/config/settings';

const SUPPORTED_ASSETS = Array.from(new Set(TRADING_PAIRS.flatMap(pair => pair.split('/'))));

interface Wallet {
  id: string;
  address: string;
  userId: string;
  status: string;
  balance: {
    RSA?: number;
    USDT?: number;
    BTC?: number;
    ETH?: number;
  };
  totalValue?: number;
  createdAt: string;
}

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: Wallet | null;
}

interface FundModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: Wallet | null;
  onFund: (amount: number, asset: string) => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, wallet }) => {
  if (!isOpen || !wallet) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Wallet Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <p className="text-sm text-gray-900 font-mono">{wallet.address}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">User ID</label>
            <p className="text-sm text-gray-900">{wallet.userId}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              wallet.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {wallet.status.charAt(0).toUpperCase() + wallet.status.slice(1)}
            </span>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Balances</label>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">RSA:</span>
                <span className="text-sm font-medium text-gray-900">{wallet.balance?.RSA || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">USDT:</span>
                <span className="text-sm font-medium text-gray-900">${wallet.balance?.USDT || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">BTC:</span>
                <span className="text-sm font-medium text-gray-900">{wallet.balance?.BTC || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">ETH:</span>
                <span className="text-sm font-medium text-gray-900">{wallet.balance?.ETH || 0}</span>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Total Value</label>
            <p className="text-sm font-medium text-gray-900">${wallet.totalValue || 0}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Created</label>
            <p className="text-sm text-gray-900">{new Date(wallet.createdAt).toLocaleString()}</p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const FundModal: React.FC<FundModalProps> = ({ isOpen, onClose, wallet, onFund }) => {
  const [amount, setAmount] = useState('');
  const [asset, setAsset] = useState(SUPPORTED_ASSETS[0] || 'RSA');

  if (!isOpen || !wallet) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      onFund(numAmount, asset);
      setAmount('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Fund Wallet</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
            <p className="text-sm text-gray-900 font-mono">{wallet.address}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Asset</label>
            <select
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              {SUPPORTED_ASSETS.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.000001"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Enter amount"
              required
            />
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Fund Wallet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);
  const [livePrices, setLivePrices] = useState({
    RSA: 0.85,
    USDT: 1.00,
    BTC: 45000,
    ETH: 2800
  });

  useEffect(() => {
    fetchWallets();
    fetchLivePrices();
    
    // Set up interval to fetch live prices every 30 seconds
    const priceInterval = setInterval(fetchLivePrices, 30000);
    
    return () => clearInterval(priceInterval);
  }, []);

  const fetchWallets = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get('/api/admin/wallets', { page: 1, limit: 100 });
      
      if (response.success && response.data && typeof response.data === 'object' && 'data' in response.data) {
        setWallets((response.data as any).data);
      } else if (response.success && Array.isArray(response.data)) {
        setWallets(response.data);
      } else {
        // Create mock wallets if endpoint not available
        const mockWallets: Wallet[] = [
          {
            id: '1',
            address: '0x1234567890abcdef1234567890abcdef12345678',
            userId: 'admin',
            status: 'active',
            balance: {
              RSA: 1000.0,
              USDT: 5000.0,
              BTC: 0.5,
              ETH: 2.5,
            },
            totalValue: 7500.0,
            createdAt: new Date().toISOString(),
          }
        ];
        setWallets(mockWallets);
      }
    } catch (error: any) {
      console.error('Wallets fetch error:', error);
      // Create mock wallets as fallback
      const mockWallets: Wallet[] = [
        {
          id: '1',
          address: '0x1234567890abcdef1234567890abcdef12345678',
          userId: 'admin',
          status: 'active',
          balance: {
            RSA: 1000.0,
            USDT: 5000.0,
            BTC: 0.5,
            ETH: 2.5,
          },
          totalValue: 7500.0,
          createdAt: new Date().toISOString(),
        }
      ];
      setWallets(mockWallets);
      setError('Using mock data - backend may not be available');
      toast.error('Failed to load wallets - using mock data');
    } finally {
      setLoading(false);
    }
  };

  const fetchLivePrices = async () => {
    try {
      const response = await apiClient.getMarkets();
      if (response.success && Array.isArray(response.data)) {
        const prices: any = { RSA: 0.85, USDT: 1.00, BTC: 45000, ETH: 2800 };
        
        response.data.forEach((market: any) => {
          if (market.pair === 'RSA/USDT') {
            prices.RSA = market.price;
          } else if (market.pair === 'BTC/USDT') {
            prices.BTC = market.price;
          } else if (market.pair === 'ETH/USDT') {
            prices.ETH = market.price;
          }
        });
        
        setLivePrices(prices);
        console.log('Live prices updated:', prices);
      }
    } catch (error) {
      console.error('Failed to fetch live prices:', error);
      // Use fallback prices if API fails
      setLivePrices({ RSA: 0.85, USDT: 1.00, BTC: 45000, ETH: 2800 });
    }
  };

  const handleViewWallet = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setShowWalletModal(true);
  };

  const handleFundWallet = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setShowFundModal(true);
  };

  const handleFund = async (amount: number, asset: string) => {
    if (!selectedWallet) return;
    
    try {
      const response = await apiClient.post(`/api/admin/wallets/${selectedWallet.id}/fund`, {
        amount,
        asset
      });
      
      if (response.success) {
        toast.success(`Successfully funded wallet with ${amount} ${asset}`);
        
        // Update the wallet balance locally for immediate feedback
        setWallets(prevWallets => 
          prevWallets.map(wallet => 
            wallet.id === selectedWallet.id 
              ? {
                  ...wallet,
                  balance: {
                    ...wallet.balance,
                    [asset]: (wallet.balance[asset as keyof typeof wallet.balance] || 0) + amount
                  },
                  totalValue: (wallet.totalValue || 0) + (amount * (asset === 'USDT' ? 1 : asset === 'BTC' ? 45000 : asset === 'ETH' ? 2800 : 0.85))
                }
              : wallet
          )
        );
        
        // Don't refresh from server to maintain local state
        // setTimeout(() => fetchWallets(), 1000);
      } else {
        toast.error(response.error || 'Failed to fund wallet');
      }
    } catch (error: any) {
      console.error('Fund wallet error:', error);
      toast.error('Failed to fund wallet');
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(amount);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Wallet Management</h1>
          <div className="flex items-center space-x-4">
            {/* Live Price Display */}
            <div className="flex items-center space-x-3 text-sm">
              <span className="text-gray-600">Live Prices:</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                RSA: ${livePrices.RSA}
              </span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                BTC: ${livePrices.BTC.toLocaleString()}
              </span>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                USDT: ${livePrices.USDT}
              </span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                ETH: ${livePrices.ETH.toLocaleString()}
              </span>
            </div>
            <button
              onClick={fetchWallets}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading wallets...</div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="text-red-800">{error}</div>
            <div className="text-red-600 text-sm mt-2">
              Make sure the RSA DEX backend is running on http://localhost:8000
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                System Wallets ({wallets.length})
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RSA Balance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">USDT Balance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BTC Balance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ETH Balance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {wallets.length > 0 ? (
                    wallets.map((wallet) => (
                      <tr key={wallet.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatAddress(wallet.address)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {wallet.userId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            wallet.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {wallet.status?.charAt(0)?.toUpperCase() + (wallet.status?.slice(1) || '')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatAmount(wallet.balance?.RSA || 0)} RSA
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                      ${formatAmount(wallet.balance?.USDT || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                      {formatAmount(wallet.balance?.BTC || 0)} BTC
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                      {formatAmount(wallet.balance?.ETH || 0)} ETH
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                      ${formatAmount(
                              (wallet.balance?.RSA || 0) * livePrices.RSA +
                              (wallet.balance?.USDT || 0) * livePrices.USDT +
                              (wallet.balance?.BTC || 0) * livePrices.BTC +
                              (wallet.balance?.ETH || 0) * livePrices.ETH
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => handleViewWallet(wallet)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => handleFundWallet(wallet)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Fund
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
                        No wallets found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Wallet Management
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  View wallet details and fund wallets with different assets. All wallet operations are logged for security purposes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <WalletModal
          isOpen={showWalletModal}
          onClose={() => setShowWalletModal(false)}
          wallet={selectedWallet}
        />
        
        <FundModal
          isOpen={showFundModal}
          onClose={() => setShowFundModal(false)}
          wallet={selectedWallet}
          onFund={handleFund}
        />
      </div>
    </Layout>
  );
} 