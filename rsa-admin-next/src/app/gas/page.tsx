'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

interface GasSettings {
  baseGasPrice: number;
  maxGasPrice: number;
  gasLimit: number;
  priorityFee: number;
  maxPriorityFee: number;
  autoAdjust: boolean;
  networkCongestion: string;
}

export default function GasPage() {
  const [gasSettings, setGasSettings] = useState<GasSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<GasSettings>({
    baseGasPrice: 20,
    maxGasPrice: 100,
    gasLimit: 21000,
    priorityFee: 2,
    maxPriorityFee: 10,
    autoAdjust: true,
    networkCongestion: 'low'
  });

  useEffect(() => {
    fetchGasSettings();
  }, []);

  const fetchGasSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get('/api/admin/gas-settings');
      
      if (response.success && response.data) {
        // Transform network-specific settings to unified format
        const networkData = (response.data as any).ethereum || response.data;
        const gasSettings: GasSettings = {
          baseGasPrice: parseInt(networkData.gasPrice) / 1000000000 || 20, // Convert from wei to gwei
          maxGasPrice: parseInt(networkData.maxFeePerGas) / 1000000000 || 100,
          gasLimit: networkData.gasLimit || 21000,
          priorityFee: parseInt(networkData.maxPriorityFeePerGas) / 1000000000 || 2,
          maxPriorityFee: 10,
          autoAdjust: true,
          networkCongestion: 'low'
        };
        setGasSettings(gasSettings);
        setFormData(gasSettings);
      } else {
        // Mock gas settings if endpoint not available
        const mockSettings: GasSettings = {
          baseGasPrice: 20,
          maxGasPrice: 100,
          gasLimit: 21000,
          priorityFee: 2,
          maxPriorityFee: 10,
          autoAdjust: true,
          networkCongestion: 'low'
        };
        setGasSettings(mockSettings);
        setFormData(mockSettings);
      }
    } catch (error: any) {
      console.error('Gas settings fetch error:', error);
      setError('Failed to load gas settings. Using default values.');
      // Use default values as fallback
      const defaultSettings: GasSettings = {
        baseGasPrice: 20,
        maxGasPrice: 100,
        gasLimit: 21000,
        priorityFee: 2,
        maxPriorityFee: 10,
        autoAdjust: true,
        networkCongestion: 'low'
      };
      setGasSettings(defaultSettings);
      setFormData(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await apiClient.updateGasSettings(formData);
      
      if (response.success) {
        setGasSettings(formData);
        setIsEditing(false);
        toast.success('Gas settings updated successfully');
      } else {
        toast.error(response.error || 'Failed to update gas settings');
      }
    } catch (error: any) {
      toast.error('Failed to update gas settings');
    }
  };

  const handleCancel = () => {
    setFormData(gasSettings || formData);
    setIsEditing(false);
  };

  const getCongestionColor = (congestion: string) => {
    switch (congestion) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Gas Settings</h1>
          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Edit Settings
                </button>
                <button
                  onClick={fetchGasSettings}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Refresh
                </button>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading gas settings...</div>
          </div>
        ) : error ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <div className="text-yellow-800">{error}</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Gas Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Gas Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Base Gas Price (Gwei)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.baseGasPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, baseGasPrice: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      min="1"
                      max="1000"
                    />
                  ) : (
                    <div className="text-lg font-semibold text-gray-900">{gasSettings?.baseGasPrice} Gwei</div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Gas Price (Gwei)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.maxGasPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxGasPrice: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      min="1"
                      max="10000"
                    />
                  ) : (
                    <div className="text-lg font-semibold text-gray-900">{gasSettings?.maxGasPrice} Gwei</div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gas Limit</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.gasLimit}
                      onChange={(e) => setFormData(prev => ({ ...prev, gasLimit: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      min="21000"
                      max="1000000"
                    />
                  ) : (
                    <div className="text-lg font-semibold text-gray-900">{gasSettings?.gasLimit.toLocaleString()}</div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority Fee (Gwei)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.priorityFee}
                      onChange={(e) => setFormData(prev => ({ ...prev, priorityFee: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      min="0"
                      max="100"
                    />
                  ) : (
                    <div className="text-lg font-semibold text-gray-900">{gasSettings?.priorityFee} Gwei</div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Priority Fee (Gwei)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.maxPriorityFee}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxPriorityFee: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      min="0"
                      max="1000"
                    />
                  ) : (
                    <div className="text-lg font-semibold text-gray-900">{gasSettings?.maxPriorityFee} Gwei</div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Auto Adjust</label>
                  {isEditing ? (
                    <select
                      value={formData.autoAdjust ? 'true' : 'false'}
                      onChange={(e) => setFormData(prev => ({ ...prev, autoAdjust: e.target.value === 'true' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="true">Enabled</option>
                      <option value="false">Disabled</option>
                    </select>
                  ) : (
                    <div className="text-lg font-semibold text-gray-900">
                      {gasSettings?.autoAdjust ? 'Enabled' : 'Disabled'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Network Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Network Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Network Congestion</label>
                  <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getCongestionColor(gasSettings?.networkCongestion || 'low')}`}>
                    {gasSettings?.networkCongestion
                      ? gasSettings.networkCongestion.charAt(0).toUpperCase() + gasSettings.networkCongestion.slice(1)
                      : 'Low'}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Transaction Cost</label>
                  <div className="text-lg font-semibold text-gray-900">
                    {((gasSettings?.baseGasPrice || 0) * (gasSettings?.gasLimit || 0) / 1e9).toFixed(6)} ETH
                  </div>
                </div>
              </div>
            </div>

            {/* Gas Price History */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Gas Price History</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-2">Last 24 hours average gas price</div>
                <div className="text-2xl font-bold text-gray-900">24.5 Gwei</div>
                <div className="text-sm text-green-600 mt-1">↓ 2.3% from yesterday</div>
              </div>
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
                Gas Settings Management
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Configure gas settings for optimal transaction processing. Adjust base gas price, limits, and priority fees based on network conditions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 