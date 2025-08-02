'use client';

import React, { useEffect, useState } from 'react';
import { syncService, SyncStatus } from '@/lib/sync';
import { CheckCircle, AlertCircle, Clock, RefreshCw, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SyncStatusComponent() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(syncService.getSyncStatus());
  const [isChecking, setIsChecking] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Subscribe to sync status changes
    const unsubscribe = syncService.subscribe(setSyncStatus);
    
    // Initial health check
    checkSyncHealth();
    
    // Periodic health check every 30 seconds
    const interval = setInterval(checkSyncHealth, 30000);
    
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const checkSyncHealth = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    try {
      await syncService.checkSyncHealth();
    } catch (error) {
      console.error('Sync health check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleForceSync = async () => {
    try {
      await syncService.forceFullSync();
    } catch (error) {
      console.error('Force sync failed:', error);
      toast.error('Synchronization failed');
    }
  };

  const getSyncIcon = (status: string) => {
    switch (status) {
      case 'synced':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'syncing':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSyncColor = (status: string) => {
    switch (status) {
      case 'synced':
        return 'text-green-600';
      case 'syncing':
        return 'text-blue-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const stats = syncService.getSyncStats();
  const overallStatus = stats.errors > 0 ? 'error' : stats.synced === stats.total ? 'synced' : 'not_synced';

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          overallStatus === 'synced' 
            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
            : overallStatus === 'error'
            ? 'bg-red-100 text-red-800 hover:bg-red-200'
            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
        }`}
        title="RSA DEX Sync Status"
      >
        {getSyncIcon(overallStatus)}
        <span>Sync: {stats.synced}/{stats.total}</span>
      </button>

      {showDetails && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">RSA DEX Synchronization</h3>
              <div className="flex space-x-2">
                <button
                  onClick={checkSyncHealth}
                  disabled={isChecking}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  title="Check sync status"
                >
                  <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={handleForceSync}
                  className="p-1 text-blue-600 hover:text-blue-800"
                  title="Force full synchronization"
                >
                  <Zap className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Assets</span>
                <div className="flex items-center space-x-2">
                  {getSyncIcon(syncStatus.assets)}
                  <span className={`text-xs font-medium ${getSyncColor(syncStatus.assets)}`}>
                    {syncStatus.assets.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Trading Pairs</span>
                <div className="flex items-center space-x-2">
                  {getSyncIcon(syncStatus.tradingPairs)}
                  <span className={`text-xs font-medium ${getSyncColor(syncStatus.tradingPairs)}`}>
                    {syncStatus.tradingPairs.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Wallets</span>
                <div className="flex items-center space-x-2">
                  {getSyncIcon(syncStatus.wallets)}
                  <span className={`text-xs font-medium ${getSyncColor(syncStatus.wallets)}`}>
                    {syncStatus.wallets.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Contracts</span>
                <div className="flex items-center space-x-2">
                  {getSyncIcon(syncStatus.contracts)}
                  <span className={`text-xs font-medium ${getSyncColor(syncStatus.contracts)}`}>
                    {syncStatus.contracts.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Transactions</span>
                <div className="flex items-center space-x-2">
                  {getSyncIcon(syncStatus.transactions)}
                  <span className={`text-xs font-medium ${getSyncColor(syncStatus.transactions)}`}>
                    {syncStatus.transactions.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {syncStatus.lastSync && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <span className="text-xs text-gray-500">
                  Last sync: {new Date(syncStatus.lastSync).toLocaleString()}
                </span>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                This shows the synchronization status between RSA DEX Admin and RSA DEX. 
                Green indicates synced, yellow indicates pending, and red indicates errors.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}