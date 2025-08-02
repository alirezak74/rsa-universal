'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

interface Contract {
  id: string;
  name: string;
  address: string;
  type: string;
  status: string;
  balance: {
    RSA?: number;
    USDT?: number;
    BTC?: number;
    ETH?: number;
  };
  createdAt: string;
}

interface BalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract | null;
  action: 'add' | 'reduce';
  onAction: (amount: number, asset: string) => void;
}

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract | null;
  onTransfer: (toAddress: string, amount: number, asset: string) => void;
}

const BalanceModal: React.FC<BalanceModalProps> = ({ isOpen, onClose, contract, action, onAction }) => {
  const [amount, setAmount] = useState('');
  const [asset, setAsset] = useState('RSA');

  if (!isOpen || !contract) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      onAction(numAmount, asset);
      setAmount('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {action === 'add' ? 'Add' : 'Reduce'} Token Balance
          </h3>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Contract</label>
            <p className="text-sm text-gray-900">{contract.name}</p>
            <p className="text-sm text-gray-500 font-mono">{contract.address}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Asset</label>
            <select
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="RSA">RSA</option>
              <option value="USDT">USDT</option>
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
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
              placeholder={`Enter amount to ${action}`}
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
              className={`px-4 py-2 text-white rounded-md transition-colors ${
                action === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {action === 'add' ? 'Add' : 'Reduce'} Balance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, contract, onTransfer }) => {
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [asset, setAsset] = useState('RSA');

  if (!isOpen || !contract) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (numAmount > 0 && toAddress.trim()) {
      onTransfer(toAddress, numAmount, asset);
      setToAddress('');
      setAmount('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Transfer Tokens</h3>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">From Contract</label>
            <p className="text-sm text-gray-900">{contract.name}</p>
            <p className="text-sm text-gray-500 font-mono">{contract.address}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Address</label>
            <input
              type="text"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="0x..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Asset</label>
            <select
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="RSA">RSA</option>
              <option value="USDT">USDT</option>
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
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
              placeholder="Enter amount to transfer"
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Transfer Tokens
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [balanceAction, setBalanceAction] = useState<'add' | 'reduce'>('add');

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get<{ data: any[] } | any[]>('/api/admin/contracts', { page: 1, limit: 100 });
      
      if (response.success && response.data && typeof response.data === 'object' && 'data' in response.data) {
        setContracts(response.data.data);
      } else if (response.success && Array.isArray(response.data)) {
        setContracts(response.data);
      } else {
        // Create mock contracts if endpoint not available
        const mockContracts: Contract[] = [
          {
            id: '1',
            name: 'RSA Token Contract',
            address: '0x1234567890abcdef1234567890abcdef12345678',
            type: 'ERC20',
            status: 'active',
            balance: {
              RSA: 1000000,
              USDT: 50000,
              BTC: 10,
              ETH: 100
            },
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            name: 'DEX Trading Contract',
            address: '0xabcdef1234567890abcdef1234567890abcdef12',
            type: 'DEX',
            status: 'active',
            balance: {
              RSA: 500000,
              USDT: 25000,
              BTC: 5,
              ETH: 50
            },
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ];
        setContracts(mockContracts);
      }
    } catch (error: any) {
      console.error('Contracts fetch error:', error);
      // Create mock contracts as fallback
      const mockContracts: Contract[] = [
        {
          id: '1',
          name: 'RSA Token Contract',
          address: '0x1234567890abcdef1234567890abcdef12345678',
          type: 'ERC20',
          status: 'active',
          balance: {
            RSA: 1000000,
            USDT: 50000,
            BTC: 10,
            ETH: 100
          },
          createdAt: new Date().toISOString()
        }
      ];
      setContracts(mockContracts);
      setError('Using mock data - backend may not be available');
      toast.error('Failed to load contracts - using mock data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBalance = (contract: Contract) => {
    setSelectedContract(contract);
    setBalanceAction('add');
    setShowBalanceModal(true);
  };

  const handleReduceBalance = (contract: Contract) => {
    setSelectedContract(contract);
    setBalanceAction('reduce');
    setShowBalanceModal(true);
  };

  const handleTransfer = (contract: Contract) => {
    setSelectedContract(contract);
    setShowTransferModal(true);
  };

  const handleBalanceAction = async (amount: number, asset: string) => {
    if (!selectedContract) return;
    
    try {
      const endpoint = balanceAction === 'add' ? 'add' : 'reduce';
      const response = await apiClient.post(`/api/admin/contracts/${selectedContract.id}/balance/${endpoint}`, {
        amount,
        asset
      });
      
      if (response.success) {
        toast.success(`Successfully ${balanceAction}ed ${amount} ${asset} to contract`);
        
        // Update the contract balance locally for immediate feedback
        setContracts(prevContracts => 
          prevContracts.map(contract => 
            contract.id === selectedContract.id 
              ? {
                  ...contract,
                  balance: {
                    ...contract.balance,
                    [asset]: balanceAction === 'add' 
                      ? (contract.balance[asset as keyof typeof contract.balance] || 0) + amount
                      : Math.max(0, (contract.balance[asset as keyof typeof contract.balance] || 0) - amount)
                  }
                }
              : contract
          )
        );
        
        // Don't refresh from server to maintain local state
        // setTimeout(() => fetchContracts(), 1000);
      } else {
        toast.error(response.error || `Failed to ${balanceAction} balance`);
      }
    } catch (error: any) {
      console.error(`${balanceAction} balance error:`, error);
      toast.error(`Failed to ${balanceAction} balance`);
    }
  };

  const handleTransferTokens = async (toAddress: string, amount: number, asset: string) => {
    if (!selectedContract) return;
    
    try {
      const response = await apiClient.post(`/api/admin/contracts/${selectedContract.id}/transfer`, {
        toAddress,
        amount,
        asset
      });
      
      if (response.success) {
        toast.success(`Successfully transferred ${amount} ${asset} to ${toAddress}`);
        
        // Update the contract balance locally for immediate feedback
        setContracts(prevContracts => 
          prevContracts.map(contract => 
            contract.id === selectedContract.id 
              ? {
                  ...contract,
                  balance: {
                    ...contract.balance,
                    [asset]: Math.max(0, (contract.balance[asset as keyof typeof contract.balance] || 0) - amount)
                  }
                }
              : contract
          )
        );
        
        // Don't refresh from server to maintain local state
        // setTimeout(() => fetchContracts(), 1000);
      } else {
        toast.error(response.error || 'Failed to transfer tokens');
      }
    } catch (error: any) {
      console.error('Transfer tokens error:', error);
      toast.error('Failed to transfer tokens');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Contract Management</h1>
          <button
            onClick={fetchContracts}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading contracts...</div>
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
                Smart Contracts ({contracts.length})
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RSA Balance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">USDT Balance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BTC Balance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ETH Balance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contracts.length > 0 ? (
                    contracts.map((contract) => (
                      <tr key={contract.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {contract.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatAddress(contract.address)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {contract.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contract.status)}`}>
                            {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="text-sm font-medium text-gray-900">{contract.balance.RSA || 0}</span> RSA
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="text-sm font-medium text-gray-900">${contract.balance.USDT || 0}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="text-sm font-medium text-gray-900">{contract.balance.BTC || 0}</span> BTC
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="text-sm font-medium text-gray-900">{contract.balance.ETH || 0}</span> ETH
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-wrap gap-1">
                            <button
                              onClick={() => handleAddBalance(contract)}
                              className="text-green-600 hover:text-green-900 text-xs"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => handleReduceBalance(contract)}
                              className="text-red-600 hover:text-red-900 text-xs"
                            >
                              Reduce
                            </button>
                            <button
                              onClick={() => handleTransfer(contract)}
                              className="text-blue-600 hover:text-blue-900 text-xs"
                            >
                              Transfer
                            </button>
                            {contract.status === 'paused' ? (
                              <button
                                className="ml-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                onClick={async () => {
                                  try {
                                    const response = await apiClient.post(`/api/admin/contracts/${contract.id}/unpause`);
                                    
                                    if (response.success) {
                                      toast.success('Contract unpaused successfully');
                                      
                                      // Update the contract status locally for immediate feedback
                                      setContracts(prevContracts =>
                                        prevContracts.map(c =>
                                          c.id === contract.id
                                            ? { ...c, status: 'active' }
                                            : c
                                        )
                                      );
                                    } else {
                                      toast.error(response.error || 'Failed to unpause contract');
                                    }
                                  } catch (error: any) {
                                    console.error('Unpause contract error:', error);
                                    toast.error('Failed to unpause contract');
                                  }
                                }}
                              >
                                Unpause
                              </button>
                            ) : (
                              <button
                                className="ml-2 px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                                onClick={async () => {
                                  try {
                                    const response = await apiClient.post(`/api/admin/contracts/${contract.id}/pause`);
                                    
                                    if (response.success) {
                                      toast.success('Contract paused successfully');
                                      
                                      // Update the contract status locally for immediate feedback
                                      setContracts(prevContracts =>
                                        prevContracts.map(c =>
                                          c.id === contract.id
                                            ? { ...c, status: 'paused' }
                                            : c
                                        )
                                      );
                                    } else {
                                      toast.error(response.error || 'Failed to pause contract');
                                    }
                                  } catch (error: any) {
                                    console.error('Pause contract error:', error);
                                    toast.error('Failed to pause contract');
                                  }
                                }}
                              >
                                Pause
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
                        No contracts found
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
                Contract Management
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Manage smart contract balances and token transfers. Add or reduce token balances and transfer tokens between contracts and addresses.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <BalanceModal
          isOpen={showBalanceModal}
          onClose={() => setShowBalanceModal(false)}
          contract={selectedContract}
          action={balanceAction}
          onAction={handleBalanceAction}
        />
        
        <TransferModal
          isOpen={showTransferModal}
          onClose={() => setShowTransferModal(false)}
          contract={selectedContract}
          onTransfer={handleTransferTokens}
        />
      </div>
    </Layout>
  );
} 