'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { TRADING_PAIRS } from '@/config/settings';

interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  asset: string;
  status: 'pending' | 'completed' | 'failed' | 'frozen' | 'rejected' | 'debt';
  type: string;
  createdAt: string;
  gasUsed?: number;
  gasPrice?: number;
}

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  onReject: (reason: string) => void;
}

const RejectModal: React.FC<RejectModalProps> = ({ isOpen, onClose, transactionId, onReject }) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onReject(reason);
      setReason('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Reject Transaction</h3>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID</label>
            <p className="text-sm text-gray-900 font-mono">{transactionId}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Rejection</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
              rows={3}
              placeholder="Enter reason for rejection..."
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
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Reject Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    status: '',
    asset: '',
  });
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState('');

  useEffect(() => {
    fetchTransactions();
    // Auto-refresh every 15 seconds for real-time transaction updates
    const interval = setInterval(fetchTransactions, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get('/api/admin/transactions', { page: 1, limit: 100 });
      
      if (response.success && response.data && typeof response.data === 'object' && 'data' in response.data) {
        setTransactions((response.data as any).data);
      } else if (response.success && Array.isArray(response.data)) {
        setTransactions(response.data);
      } else {
        // Create mock transactions if endpoint not available
        const mockTransactions: Transaction[] = [
          {
            id: '1',
            from: '0x1234567890abcdef1234567890abcdef12345678',
            to: '0xabcdef1234567890abcdef1234567890abcdef12',
            amount: 100,
            asset: 'RSA',
            status: 'pending',
            type: 'transfer',
            createdAt: new Date().toISOString(),
            gasUsed: 21000,
            gasPrice: 20000000000
          },
          {
            id: '2',
            from: '0xabcdef1234567890abcdef1234567890abcdef12',
            to: '0x1234567890abcdef1234567890abcdef12345678',
            amount: 0.5,
            asset: 'BTC',
            status: 'completed',
            type: 'withdrawal',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            gasUsed: 21000,
            gasPrice: 15000000000
          }
        ];
        setTransactions(mockTransactions);
      }
    } catch (error: any) {
      console.error('Transactions fetch error:', error);
      // Create mock transactions as fallback
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          from: '0x1234567890abcdef1234567890abcdef12345678',
          to: '0xabcdef1234567890abcdef1234567890abcdef12',
          amount: 100,
          asset: 'RSA',
          status: 'pending',
          type: 'transfer',
          createdAt: new Date().toISOString(),
          gasUsed: 21000,
          gasPrice: 20000000000
        }
      ];
      setTransactions(mockTransactions);
      setError('Using mock data - backend may not be available');
      toast.error('Failed to load transactions - using mock data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTransaction = async (transactionId: string) => {
    try {
      const response = await apiClient.post(`/api/admin/transactions/${transactionId}/approve`);
      
      if (response.success) {
        toast.success('Transaction approved successfully');
        
        // Update the transaction status locally for immediate feedback
        setTransactions(prevTransactions => 
          prevTransactions.map(tx => 
            tx.id === transactionId 
              ? { ...tx, status: 'completed' as const }
              : tx
          )
        );
        
        // Don't refresh from server to maintain local state
        // setTimeout(() => fetchTransactions(), 1000);
      } else {
        toast.error(response.error || 'Failed to approve transaction');
      }
    } catch (error: any) {
      console.error('Approve transaction error:', error);
      toast.error('Failed to approve transaction');
    }
  };

  const handleRejectTransaction = async (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setShowRejectModal(true);
  };

  const handleReject = async (reason: string) => {
    try {
      const response = await apiClient.post(`/api/admin/transactions/${selectedTransactionId}/reject`, { reason });
      
      if (response.success) {
        toast.success('Transaction rejected successfully');
        
        // Update the transaction status locally for immediate feedback
        setTransactions(prevTransactions => 
          prevTransactions.map(tx => 
            tx.id === selectedTransactionId 
              ? { ...tx, status: 'rejected' as const }
              : tx
          )
        );
        
        // Don't refresh from server to maintain local state
        // setTimeout(() => fetchTransactions(), 1000);
      } else {
        toast.error(response.error || 'Failed to reject transaction');
      }
    } catch (error: any) {
      console.error('Reject transaction error:', error);
      toast.error('Failed to reject transaction');
    }
  };

  const handleFreezeTransaction = async (transactionId: string) => {
    try {
      const response = await apiClient.post(`/api/admin/transactions/${transactionId}/freeze`);
      
      if (response.success) {
        toast.success('Transaction frozen successfully');
        
        // Update the transaction status locally for immediate feedback
        setTransactions(prevTransactions => 
          prevTransactions.map(tx => 
            tx.id === transactionId 
              ? { ...tx, status: 'frozen' as const }
              : tx
          )
        );
        
        // Don't refresh from server to maintain local state
        // setTimeout(() => fetchTransactions(), 1000);
      } else {
        toast.error(response.error || 'Failed to freeze transaction');
      }
    } catch (error: any) {
      console.error('Freeze transaction error:', error);
      toast.error('Failed to freeze transaction');
    }
  };

  const handleRecallTransaction = async (transactionId: string) => {
    try {
      const response = await apiClient.recallTransaction(transactionId, 'Admin recall');
      
      if (response.success) {
        toast.success('Transaction recalled successfully');
        fetchTransactions(); // Refresh the list
      } else {
        toast.error(response.error || 'Failed to recall transaction');
      }
    } catch (error: any) {
      toast.error('Failed to recall transaction');
    }
  };

  const handleDebtTransaction = async (transactionId: string) => {
    try {
      const response = await apiClient.post(`/api/admin/transactions/${transactionId}/debt`);
      
      if (response.success) {
        toast.success('Transaction marked as debt successfully');
        
        // Update the transaction status locally for immediate feedback
        setTransactions(prevTransactions =>
          prevTransactions.map(tx =>
            tx.id === transactionId
              ? { ...tx, status: 'debt' as any }
              : tx
          )
        );
      } else {
        toast.error(response.error || 'Failed to mark as debt');
      }
    } catch (error: any) {
      console.error('Mark as debt error:', error);
      toast.error('Failed to mark as debt');
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter.status && transaction.status !== filter.status) return false;
    if (filter.asset && transaction.asset !== filter.asset) return false;
    return true;
  });

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
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'frozen':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const SUPPORTED_ASSETS = Array.from(new Set(TRADING_PAIRS.flatMap(pair => pair.split('/'))));

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Transaction Management</h1>
          <button
            onClick={fetchTransactions}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filter.status}
                onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              >
                <option value="" className="text-gray-900">All Statuses</option>
                <option value="pending" className="text-gray-900">Pending</option>
                <option value="completed" className="text-gray-900">Completed</option>
                <option value="failed" className="text-gray-900">Failed</option>
                <option value="frozen" className="text-gray-900">Frozen</option>
                <option value="rejected" className="text-gray-900">Rejected</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Asset</label>
              <select
                value={filter.asset}
                onChange={(e) => setFilter(prev => ({ ...prev, asset: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              >
                <option value="" className="text-gray-900">All Assets</option>
                <option value="RSA" className="text-gray-900">RSA</option>
                <option value="USDT" className="text-gray-900">USDT</option>
                <option value="BTC" className="text-gray-900">BTC</option>
                <option value="ETH" className="text-gray-900">ETH</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading transactions...</div>
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
                Transactions ({filteredTransactions.length})
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.id.slice(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatAddress(transaction.from)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatAddress(transaction.to)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatAmount(transaction.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.asset}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-wrap gap-1">
                            {/* Show action buttons for all statuses except completed and failed */}
                            {transaction.status !== 'completed' && transaction.status !== 'failed' && (
                              <>
                                {/* Pending transactions - show approve, freeze, reject */}
                                {transaction.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleApproveTransaction(transaction.id)}
                                      className="text-green-600 hover:text-green-900 text-xs"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleFreezeTransaction(transaction.id)}
                                      className="text-blue-600 hover:text-blue-900 text-xs"
                                    >
                                      Freeze
                                    </button>
                                    <button
                                      onClick={() => handleRejectTransaction(transaction.id)}
                                      className="text-red-600 hover:text-red-900 text-xs"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                {/* Frozen transactions - show recall, approve, reject */}
                                {transaction.status === 'frozen' && (
                                  <>
                                    <button
                                      onClick={() => handleRecallTransaction(transaction.id)}
                                      className="text-orange-600 hover:text-orange-900 text-xs"
                                    >
                                      Recall
                                    </button>
                                    <button
                                      onClick={() => handleApproveTransaction(transaction.id)}
                                      className="text-green-600 hover:text-green-900 text-xs"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleRejectTransaction(transaction.id)}
                                      className="text-red-600 hover:text-red-900 text-xs"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                {/* Rejected transactions - show re-approve, freeze */}
                                {transaction.status === 'rejected' && (
                                  <>
                                    <button
                                      onClick={() => handleApproveTransaction(transaction.id)}
                                      className="text-green-600 hover:text-green-900 text-xs"
                                    >
                                      Re-approve
                                    </button>
                                    <button
                                      onClick={() => handleFreezeTransaction(transaction.id)}
                                      className="text-blue-600 hover:text-blue-900 text-xs"
                                    >
                                      Freeze
                                    </button>
                                  </>
                                )}
                                {/* Debt transactions - show approve, freeze, reject */}
                                {transaction.status === 'debt' && (
                                  <>
                                    <button
                                      onClick={() => handleApproveTransaction(transaction.id)}
                                      className="text-green-600 hover:text-green-900 text-xs"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleFreezeTransaction(transaction.id)}
                                      className="text-blue-600 hover:text-blue-900 text-xs"
                                    >
                                      Freeze
                                    </button>
                                    <button
                                      onClick={() => handleRejectTransaction(transaction.id)}
                                      className="text-red-600 hover:text-red-900 text-xs"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                              </>
                            )}
                            {/* Debt button for all transactions */}
                            <button
                              className="ml-2 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs"
                              onClick={() => handleDebtTransaction(transaction.id)}
                            >
                              Debt
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
                        No transactions found
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
                Transaction Management
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Monitor and manage all transactions. Approve pending transactions, freeze suspicious ones, reject invalid transactions, and recall frozen transactions when needed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reject Modal */}
        <RejectModal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          transactionId={selectedTransactionId}
          onReject={handleReject}
        />
      </div>
    </Layout>
  );
} 