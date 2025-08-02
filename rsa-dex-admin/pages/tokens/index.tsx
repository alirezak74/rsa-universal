// RSA DEX Admin - Dynamic Token Management Page
// Core feature allowing admins to add, edit, remove tokens without code redeployment

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import Head from 'next/head';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon, 
  EyeSlashIcon,
  CurrencyDollarIcon,
  LinkIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import { tokenApi } from '../../services/api';
import TokenModal from '../../components/tokens/TokenModal';
import TokenTable from '../../components/tokens/TokenTable';
import TokenStats from '../../components/tokens/TokenStats';
import NetworkStatus from '../../components/NetworkStatus';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import ConfirmDialog from '../../components/ConfirmDialog';

export interface Token {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  contract_address?: string;
  wrapped_token_of?: string;
  logo_url?: string;
  description?: string;
  is_visible: boolean;
  swap_enabled: boolean;
  trading_enabled: boolean;
  deposit_enabled: boolean;
  withdrawal_enabled: boolean;
  min_deposit: number;
  max_deposit: number;
  min_withdrawal: number;
  max_withdrawal: number;
  withdrawal_fee: number;
  network: string;
  is_native: boolean;
  price_source: string;
  coingecko_id?: string;
  manual_price?: number;
  current_price?: number;
  sort_order: number;
  status: string;
  tags: string[];
  default_trading_pairs: string[];
  smart_contract_abi?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export default function TokensPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [deleteToken, setDeleteToken] = useState<Token | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [networkFilter, setNetworkFilter] = useState('all');

  const queryClient = useQueryClient();

  // Fetch tokens
  const { 
    data: tokens = [], 
    isLoading, 
    error 
  } = useQuery<Token[]>('admin-tokens', tokenApi.getAllTokens, {
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Create token mutation
  const createTokenMutation = useMutation(tokenApi.createToken, {
    onSuccess: (data) => {
      queryClient.invalidateQueries('admin-tokens');
      setIsModalOpen(false);
      setSelectedToken(null);
      toast.success(`Token ${data.symbol} created successfully!`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create token');
    },
  });

  // Update token mutation
  const updateTokenMutation = useMutation(
    ({ id, data }: { id: string; data: Partial<Token> }) => 
      tokenApi.updateToken(id, data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('admin-tokens');
        setIsModalOpen(false);
        setSelectedToken(null);
        toast.success(`Token ${data.symbol} updated successfully!`);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to update token');
      },
    }
  );

  // Delete token mutation
  const deleteTokenMutation = useMutation(tokenApi.deleteToken, {
    onSuccess: () => {
      queryClient.invalidateQueries('admin-tokens');
      setDeleteToken(null);
      toast.success('Token deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete token');
    },
  });

  // Toggle token visibility
  const toggleVisibilityMutation = useMutation(
    ({ id, is_visible }: { id: string; is_visible: boolean }) =>
      tokenApi.updateToken(id, { is_visible }),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('admin-tokens');
        toast.success(
          `Token ${data.symbol} ${data.is_visible ? 'shown' : 'hidden'} successfully!`
        );
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to update token visibility');
      },
    }
  );

  // Filter tokens based on search and filters
  const filteredTokens = tokens.filter(token => {
    const matchesSearch = 
      token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || token.status === statusFilter;
    const matchesNetwork = networkFilter === 'all' || token.network === networkFilter;

    return matchesSearch && matchesStatus && matchesNetwork;
  });

  // Get unique networks for filter
  const networks = [...new Set(tokens.map(token => token.network))];

  // Handle token form submission
  const handleTokenSubmit = (tokenData: Partial<Token>) => {
    if (selectedToken) {
      updateTokenMutation.mutate({ id: selectedToken.id, data: tokenData });
    } else {
      createTokenMutation.mutate(tokenData as Token);
    }
  };

  // Handle edit token
  const handleEditToken = (token: Token) => {
    setSelectedToken(token);
    setIsModalOpen(true);
  };

  // Handle delete token
  const handleDeleteToken = (token: Token) => {
    setDeleteToken(token);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (deleteToken) {
      deleteTokenMutation.mutate(deleteToken.id);
    }
  };

  // Handle toggle visibility
  const handleToggleVisibility = (token: Token) => {
    toggleVisibilityMutation.mutate({
      id: token.id,
      is_visible: !token.is_visible
    });
  };

  if (error) {
    return <ErrorMessage message="Failed to load tokens" />;
  }

  return (
    <>
      <Head>
        <title>Token Management - RSA DEX Admin</title>
        <meta name="description" content="Manage tokens dynamically without code redeployment" />
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Token Management
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Add, edit, and manage tokens dynamically without redeployment
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <button
                  onClick={() => {
                    setSelectedToken(null);
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add New Token
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="px-6 py-4">
            <TokenStats tokens={tokens} />
          </div>
        </div>

        {/* Network Status */}
        <NetworkStatus />

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Search Tokens
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                placeholder="Search by name, symbol, or description..."
              />
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="deprecated">Deprecated</option>
              </select>
            </div>

            {/* Network Filter */}
            <div>
              <label htmlFor="network" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Network
              </label>
              <select
                id="network"
                value={networkFilter}
                onChange={(e) => setNetworkFilter(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              >
                <option value="all">All Networks</option>
                {networks.map(network => (
                  <option key={network} value={network}>
                    {network.charAt(0).toUpperCase() + network.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredTokens.length} of {tokens.length} tokens
              </div>
            </div>
          </div>
        </div>

        {/* Tokens Table */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-6">
              <LoadingSpinner />
            </div>
          ) : (
            <TokenTable
              tokens={filteredTokens}
              onEdit={handleEditToken}
              onDelete={handleDeleteToken}
              onToggleVisibility={handleToggleVisibility}
              isLoading={
                updateTokenMutation.isLoading || 
                deleteTokenMutation.isLoading || 
                toggleVisibilityMutation.isLoading
              }
            />
          )}
        </div>

        {/* Token Modal */}
        <TokenModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedToken(null);
          }}
          onSubmit={handleTokenSubmit}
          token={selectedToken}
          isLoading={createTokenMutation.isLoading || updateTokenMutation.isLoading}
        />

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={!!deleteToken}
          title="Delete Token"
          message={`Are you sure you want to delete ${deleteToken?.symbol}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteToken(null)}
          isLoading={deleteTokenMutation.isLoading}
          type="danger"
        />
      </div>
    </>
  );
}