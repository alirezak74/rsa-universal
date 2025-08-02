import { apiClient } from './api';
import toast from 'react-hot-toast';

export interface SyncStatus {
  assets: 'synced' | 'syncing' | 'error' | 'not_synced';
  tradingPairs: 'synced' | 'syncing' | 'error' | 'not_synced';
  wallets: 'synced' | 'syncing' | 'error' | 'not_synced';
  contracts: 'synced' | 'syncing' | 'error' | 'not_synced';
  transactions: 'synced' | 'syncing' | 'error' | 'not_synced';
  lastSync: string | null;
}

export interface SyncResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  syncedCount: number;
  totalCount: number;
}

class SyncService {
  private syncStatus: SyncStatus = {
    assets: 'not_synced',
    tradingPairs: 'not_synced',
    wallets: 'not_synced',
    contracts: 'not_synced',
    transactions: 'not_synced',
    lastSync: null,
  };

  private listeners: ((status: SyncStatus) => void)[] = [];

  // Subscribe to sync status changes
  subscribe(listener: (status: SyncStatus) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners of status changes
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.syncStatus));
  }

  // Get current sync status
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  // Update sync status for a specific module
  private updateSyncStatus(module: keyof Omit<SyncStatus, 'lastSync'>, status: SyncStatus[typeof module]) {
    this.syncStatus[module] = status;
    this.notifyListeners();
  }

  // Check overall sync health
  async checkSyncHealth(): Promise<SyncStatus> {
    try {
      // Check if RSA DEX backend is accessible
      const healthCheck = await apiClient.healthCheck();
      
      if (!healthCheck.success) {
        // If backend is not accessible, mark all as error
        Object.keys(this.syncStatus).forEach(key => {
          if (key !== 'lastSync') {
            this.syncStatus[key as keyof SyncStatus] = 'error';
          }
        });
        this.notifyListeners();
        return this.syncStatus;
      }

      // Check individual module sync status
      await Promise.all([
        this.checkAssetSync(),
        this.checkTradingPairSync(),
        this.checkWalletSync(),
        this.checkContractSync(),
        this.checkTransactionSync(),
      ]);

      this.syncStatus.lastSync = new Date().toISOString();
      this.notifyListeners();
      return this.syncStatus;
    } catch (error) {
      console.error('Sync health check failed:', error);
      return this.syncStatus;
    }
  }

  // Check asset synchronization
  private async checkAssetSync(): Promise<void> {
    try {
      this.updateSyncStatus('assets', 'syncing');
      
      const response = await apiClient.get('/api/admin/sync-status/assets');
      
      if (response.success) {
        this.updateSyncStatus('assets', (response.data as any)?.synced ? 'synced' : 'not_synced');
      } else {
        this.updateSyncStatus('assets', 'error');
      }
    } catch (error) {
      console.error('Asset sync check failed:', error);
      this.updateSyncStatus('assets', 'error');
    }
  }

  // Check trading pair synchronization
  private async checkTradingPairSync(): Promise<void> {
    try {
      this.updateSyncStatus('tradingPairs', 'syncing');
      
      const response = await apiClient.get('/api/admin/sync-status/trading-pairs');
      
      if (response.success) {
        this.updateSyncStatus('tradingPairs', (response.data as any)?.synced ? 'synced' : 'not_synced');
      } else {
        this.updateSyncStatus('tradingPairs', 'error');
      }
    } catch (error) {
      console.error('Trading pair sync check failed:', error);
      this.updateSyncStatus('tradingPairs', 'error');
    }
  }

  // Check wallet synchronization
  private async checkWalletSync(): Promise<void> {
    try {
      this.updateSyncStatus('wallets', 'syncing');
      
      const response = await apiClient.get('/api/admin/sync-status/wallets');
      
      if (response.success) {
        this.updateSyncStatus('wallets', (response.data as any)?.synced ? 'synced' : 'not_synced');
      } else {
        this.updateSyncStatus('wallets', 'error');
      }
    } catch (error) {
      console.error('Wallet sync check failed:', error);
      this.updateSyncStatus('wallets', 'error');
    }
  }

  // Check contract synchronization
  private async checkContractSync(): Promise<void> {
    try {
      this.updateSyncStatus('contracts', 'syncing');
      
      const response = await apiClient.get('/api/admin/sync-status/contracts');
      
      if (response.success) {
        this.updateSyncStatus('contracts', (response.data as any)?.synced ? 'synced' : 'not_synced');
      } else {
        this.updateSyncStatus('contracts', 'error');
      }
    } catch (error) {
      console.error('Contract sync check failed:', error);
      this.updateSyncStatus('contracts', 'error');
    }
  }

  // Check transaction synchronization
  private async checkTransactionSync(): Promise<void> {
    try {
      this.updateSyncStatus('transactions', 'syncing');
      
      const response = await apiClient.get('/api/admin/sync-status/transactions');
      
      if (response.success) {
        this.updateSyncStatus('transactions', (response.data as any)?.synced ? 'synced' : 'not_synced');
      } else {
        this.updateSyncStatus('transactions', 'error');
      }
    } catch (error) {
      console.error('Transaction sync check failed:', error);
      this.updateSyncStatus('transactions', 'error');
    }
  }

  // Sync all assets to RSA DEX
  async syncAllAssets(): Promise<SyncResult> {
    try {
      this.updateSyncStatus('assets', 'syncing');
      toast.loading('Syncing assets to RSA DEX...', { id: 'sync-assets' });

      const response = await apiClient.syncAllAssetsToDex();
      
      if (response.success) {
        this.updateSyncStatus('assets', 'synced');
        toast.success('Assets synced successfully!', { id: 'sync-assets' });
        
        return {
          success: true,
          errors: [],
          warnings: [],
          syncedCount: (response.data as any)?.syncedCount || 0,
          totalCount: (response.data as any)?.totalCount || 0,
        };
      } else {
        this.updateSyncStatus('assets', 'error');
        toast.error('Asset sync failed: ' + response.error, { id: 'sync-assets' });
        
        return {
          success: false,
          errors: [response.error || 'Unknown error'],
          warnings: [],
          syncedCount: 0,
          totalCount: 0,
        };
      }
    } catch (error: any) {
      console.error('Asset sync failed:', error);
      this.updateSyncStatus('assets', 'error');
      toast.error('Asset sync failed: ' + error.message, { id: 'sync-assets' });
      
      return {
        success: false,
        errors: [error.message || 'Unknown error'],
        warnings: [],
        syncedCount: 0,
        totalCount: 0,
      };
    }
  }

  // Sync specific asset to RSA DEX
  async syncAsset(assetId: string): Promise<SyncResult> {
    try {
      toast.loading('Syncing asset to RSA DEX...', { id: `sync-asset-${assetId}` });

      const response = await apiClient.syncAssetToDex(assetId);
      
      if (response.success) {
        toast.success('Asset synced successfully!', { id: `sync-asset-${assetId}` });
        
        return {
          success: true,
          errors: [],
          warnings: [],
          syncedCount: 1,
          totalCount: 1,
        };
      } else {
        toast.error('Asset sync failed: ' + response.error, { id: `sync-asset-${assetId}` });
        
        return {
          success: false,
          errors: [response.error || 'Unknown error'],
          warnings: [],
          syncedCount: 0,
          totalCount: 1,
        };
      }
    } catch (error: any) {
      console.error('Asset sync failed:', error);
      toast.error('Asset sync failed: ' + error.message, { id: `sync-asset-${assetId}` });
      
      return {
        success: false,
        errors: [error.message || 'Unknown error'],
        warnings: [],
        syncedCount: 0,
        totalCount: 1,
      };
    }
  }

  // Force full synchronization of all modules
  async forceFullSync(): Promise<{ [key: string]: SyncResult }> {
    const results: { [key: string]: SyncResult } = {};
    
    toast.loading('Starting full synchronization...', { id: 'full-sync' });

    try {
      // Sync assets
      results.assets = await this.syncAllAssets();
      
      // Add more sync operations here as needed
      // results.tradingPairs = await this.syncAllTradingPairs();
      // results.wallets = await this.syncAllWallets();
      // results.contracts = await this.syncAllContracts();
      // results.transactions = await this.syncAllTransactions();

      const allSuccess = Object.values(results).every(result => result.success);
      
      if (allSuccess) {
        toast.success('Full synchronization completed successfully!', { id: 'full-sync' });
        this.syncStatus.lastSync = new Date().toISOString();
      } else {
        toast.error('Some synchronization operations failed. Check the results.', { id: 'full-sync' });
      }

      this.notifyListeners();
      return results;
    } catch (error: any) {
      console.error('Full sync failed:', error);
      toast.error('Full synchronization failed: ' + error.message, { id: 'full-sync' });
      
      return {
        error: {
          success: false,
          errors: [error.message || 'Unknown error'],
          warnings: [],
          syncedCount: 0,
          totalCount: 0,
        }
      };
    }
  }

  // Get sync statistics
  getSyncStats(): { synced: number; total: number; errors: number } {
    const modules = ['assets', 'tradingPairs', 'wallets', 'contracts', 'transactions'] as const;
    const synced = modules.filter(module => this.syncStatus[module] === 'synced').length;
    const errors = modules.filter(module => this.syncStatus[module] === 'error').length;
    
    return {
      synced,
      total: modules.length,
      errors,
    };
  }
}

export const syncService = new SyncService();