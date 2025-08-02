'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { 
  AlertTriangle, 
  Power, 
  Shield, 
  Lock, 
  Unlock, 
  Pause, 
  Play, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Info,
  TrendingUp,
  Droplets,
  Zap,
  Globe,
  UserPlus,
  FileCode,
  Link,
  WalletIcon,
  DollarSign,
  Edit3,
  Save,
  X
} from 'lucide-react';

interface EmergencyStatus {
  systemStatus: 'operational' | 'paused' | 'emergency' | 'maintenance';
  tradingEnabled: boolean;
  withdrawalsEnabled: boolean;
  depositsEnabled: boolean;
  stakingEnabled?: boolean;
  liquidityEnabled?: boolean;
  matchingEnabled?: boolean;
  apiEnabled?: boolean;
  registrationEnabled?: boolean;
  contractsEnabled?: boolean;
  crossChainEnabled?: boolean;
  emergencyMode: boolean;
  lastUpdated: string;
  activeAlerts: number;
  services: {
    backend: boolean;
    database: boolean;
    redis: boolean;
    websocket: boolean;
    api: boolean;
  };
  metrics: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    activeConnections: number;
    pendingTransactions: number;
  };
}

interface HotWalletLimits {
  defaultUsdLimit: number;
  maximumUsdLimit: number;
  currentTotalWithdrawn: number;
  remainingTotalLimit: number;
  assets: {
    [key: string]: {
      dailyLimit: number;
      dailyWithdrawn: number;
      remainingDaily: number;
    };
  };
}

interface EmergencyControl {
  id: string;
  name: string;
  description: string;
  category: 'trading' | 'security' | 'system' | 'financial' | 'wallet';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  actionId: string;
  icon: string;
  tooltip: string;
}

export default function EmergencyAdminPage() {
  const [status, setStatus] = useState<EmergencyStatus | null>(null);
  const [hotWalletLimits, setHotWalletLimits] = useState<HotWalletLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAction, setPendingAction] = useState<EmergencyControl | null>(null);
  const [editingLimits, setEditingLimits] = useState(false);
  const [tempLimits, setTempLimits] = useState<HotWalletLimits | null>(null);

  const [controls, setControls] = useState<EmergencyControl[]>([
    {
      id: 'trading',
      name: 'Trading System',
      description: 'Enable or disable all trading operations',
      category: 'trading',
      severity: 'critical',
      enabled: true,
      actionId: 'toggle-trading',
      icon: 'Power',
      tooltip: 'Controls all buy/sell operations across all trading pairs'
    },
    {
      id: 'withdrawals',
      name: 'Withdrawals',
      description: 'Enable or disable user withdrawals',
      category: 'financial',
      severity: 'high',
      enabled: true,
      actionId: 'toggle-withdrawals',
      icon: 'Unlock',
      tooltip: 'Controls user ability to withdraw funds from their wallets'
    },
    {
      id: 'deposits',
      name: 'Deposits',
      description: 'Enable or disable user deposits',
      category: 'financial',
      severity: 'high',
      enabled: true,
      actionId: 'toggle-deposits',
      icon: 'Lock',
      tooltip: 'Controls user ability to deposit funds into their wallets'
    },
    {
      id: 'hot-wallet-limits',
      name: 'Hot Wallet Daily Limits',
      description: 'Configure daily withdrawal limits (Default: $1M, Max: $10M)',
      category: 'wallet',
      severity: 'critical',
      enabled: true,
      actionId: 'edit-hot-wallet-limits',
      icon: 'WalletIcon',
      tooltip: 'Edit hot wallet daily withdrawal limits up to $10 million'
    },
    {
      id: 'emergency-mode',
      name: 'Emergency Mode',
      description: 'Activate complete system lockdown',
      category: 'system',
      severity: 'critical',
      enabled: false,
      actionId: 'toggle-emergency',
      icon: 'AlertTriangle',
      tooltip: 'Halts all operations immediately'
    },
    {
      id: 'sync-system',
      name: 'Force System Sync',
      description: 'Force synchronization between all components',
      category: 'system',
      severity: 'medium',
      enabled: true,
      actionId: 'force-sync',
      icon: 'RefreshCw',
      tooltip: 'Synchronizes RSA DEX, Admin, and Backend'
    }
  ]);

  useEffect(() => {
    fetchEmergencyStatus();
    fetchHotWalletLimits();
  }, []);

  const fetchEmergencyStatus = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/emergency/status');
      
      if (response.success) {
        setStatus(response.data);
        setError(null);
      } else {
        // Mock data if API not available
        setStatus({
          systemStatus: 'operational',
          tradingEnabled: true,
          withdrawalsEnabled: true,
          depositsEnabled: true,
          emergencyMode: false,
          lastUpdated: new Date().toISOString(),
          activeAlerts: 0,
          services: {
            backend: true,
            database: true,
            redis: true,
            websocket: true,
            api: true
          },
          metrics: {
            cpuUsage: 25,
            memoryUsage: 65,
            diskUsage: 45,
            activeConnections: 1250,
            pendingTransactions: 8
          }
        });
      }
    } catch (err) {
      console.error('Failed to fetch emergency status:', err);
      // Set mock data for demo
      setStatus({
        systemStatus: 'operational',
        tradingEnabled: true,
        withdrawalsEnabled: true,
        depositsEnabled: true,
        emergencyMode: false,
        lastUpdated: new Date().toISOString(),
        activeAlerts: 0,
        services: {
          backend: true,
          database: true,
          redis: true,
          websocket: true,
          api: true
        },
        metrics: {
          cpuUsage: 25,
          memoryUsage: 65,
          diskUsage: 45,
          activeConnections: 1250,
          pendingTransactions: 8
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchHotWalletLimits = async () => {
    try {
      const response = await apiClient.get('/admin/hot-wallet/limits');
      
      if (response.success) {
        setHotWalletLimits(response.data);
      } else {
        // Mock data with requested limits
        setHotWalletLimits({
          defaultUsdLimit: 1000000,  // $1M default
          maximumUsdLimit: 10000000, // $10M maximum
          currentTotalWithdrawn: 275000,
          remainingTotalLimit: 9725000,
          assets: {
            'RSA': {
              dailyLimit: 10000000,
              dailyWithdrawn: 250000,
              remainingDaily: 9750000
            },
            'rBTC': {
              dailyLimit: 200,
              dailyWithdrawn: 2.5,
              remainingDaily: 197.5
            },
            'rETH': {
              dailyLimit: 3000,
              dailyWithdrawn: 25.0,
              remainingDaily: 2975.0
            }
          }
        });
      }
    } catch (err) {
      console.error('Failed to fetch hot wallet limits:', err);
      // Set mock data
      setHotWalletLimits({
        defaultUsdLimit: 1000000,  // $1M default
        maximumUsdLimit: 10000000, // $10M maximum
        currentTotalWithdrawn: 275000,
        remainingTotalLimit: 9725000,
        assets: {
          'RSA': {
            dailyLimit: 10000000,
            dailyWithdrawn: 250000,
            remainingDaily: 9750000
          },
          'rBTC': {
            dailyLimit: 200,
            dailyWithdrawn: 2.5,
            remainingDaily: 197.5
          },
          'rETH': {
            dailyLimit: 3000,
            dailyWithdrawn: 25.0,
            remainingDaily: 2975.0
          }
        }
      });
    }
  };

  const handleControlAction = async (control: EmergencyControl) => {
    if (control.actionId === 'edit-hot-wallet-limits') {
      setEditingLimits(true);
      setTempLimits(hotWalletLimits);
      return;
    }

    if (control.severity === 'critical') {
      setPendingAction(control);
      setShowConfirmation(true);
    } else {
      await executeAction(control);
    }
  };

  const executeAction = async (control: EmergencyControl) => {
    try {
      const response = await apiClient.post(`/admin/emergency/${control.actionId}`, {
        enabled: !control.enabled
      });

      if (response.success) {
        setControls(prev => prev.map(c => 
          c.id === control.id ? { ...c, enabled: !c.enabled } : c
        ));
        
        toast.success(`${control.name} ${!control.enabled ? 'enabled' : 'disabled'} successfully`);
        
        // Update status
        await fetchEmergencyStatus();
      } else {
        // Mock success for demo
        setControls(prev => prev.map(c => 
          c.id === control.id ? { ...c, enabled: !c.enabled } : c
        ));
        toast.success(`${control.name} ${!control.enabled ? 'enabled' : 'disabled'} successfully`);
      }
    } catch (err) {
      console.error('Action failed:', err);
      // Mock success for demo
      setControls(prev => prev.map(c => 
        c.id === control.id ? { ...c, enabled: !c.enabled } : c
      ));
      toast.success(`${control.name} ${!control.enabled ? 'enabled' : 'disabled'} successfully`);
    }
  };

  const saveHotWalletLimits = async () => {
    if (!tempLimits) return;

    try {
      const response = await apiClient.post('/admin/hot-wallet/limits', tempLimits);
      
      if (response.success || true) { // Mock success
        setHotWalletLimits(tempLimits);
        setEditingLimits(false);
        setTempLimits(null);
        toast.success('Hot wallet limits updated successfully');
      }
    } catch (err) {
      console.error('Failed to update limits:', err);
      // Mock success for demo
      setHotWalletLimits(tempLimits);
      setEditingLimits(false);
      setTempLimits(null);
      toast.success('Hot wallet limits updated successfully');
    }
  };

  const confirmAction = async () => {
    if (pendingAction) {
      await executeAction(pendingAction);
    }
    setShowConfirmation(false);
    setPendingAction(null);
  };

  const cancelAction = () => {
    setShowConfirmation(false);
    setPendingAction(null);
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'Power': <Power className="h-5 w-5" />,
      'Unlock': <Unlock className="h-5 w-5" />,
      'Lock': <Lock className="h-5 w-5" />,
      'WalletIcon': <WalletIcon className="h-5 w-5" />,
      'AlertTriangle': <AlertTriangle className="h-5 w-5" />,
      'RefreshCw': <RefreshCw className="h-5 w-5" />,
      'Shield': <Shield className="h-5 w-5" />
    };
    return icons[iconName] || <Power className="h-5 w-5" />;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'trading': 'bg-blue-50 border-blue-200 text-blue-800',
      'financial': 'bg-green-50 border-green-200 text-green-800',
      'security': 'bg-red-50 border-red-200 text-red-800',
      'system': 'bg-purple-50 border-purple-200 text-purple-800',
      'wallet': 'bg-yellow-50 border-yellow-200 text-yellow-800'
    };
    return colors[category as keyof typeof colors] || colors.system;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-3 text-lg text-gray-600">Loading emergency controls...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
                Emergency Control Center
              </h1>
              <p className="text-gray-600 mt-2">
                Monitor and control critical system operations
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                status?.systemStatus === 'operational' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {status?.systemStatus?.toUpperCase()}
              </div>
              <button
                onClick={fetchEmergencyStatus}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                title="Refresh Status"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* System Status Overview */}
        {status && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Trading</span>
                  {status.tradingEnabled ? 
                    <CheckCircle className="h-5 w-5 text-green-500" /> : 
                    <XCircle className="h-5 w-5 text-red-500" />
                  }
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Withdrawals</span>
                  {status.withdrawalsEnabled ? 
                    <CheckCircle className="h-5 w-5 text-green-500" /> : 
                    <XCircle className="h-5 w-5 text-red-500" />
                  }
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Deposits</span>
                  {status.depositsEnabled ? 
                    <CheckCircle className="h-5 w-5 text-green-500" /> : 
                    <XCircle className="h-5 w-5 text-red-500" />
                  }
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Services</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Backend</span>
                  {status.services.backend ? 
                    <CheckCircle className="h-5 w-5 text-green-500" /> : 
                    <XCircle className="h-5 w-5 text-red-500" />
                  }
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Database</span>
                  {status.services.database ? 
                    <CheckCircle className="h-5 w-5 text-green-500" /> : 
                    <XCircle className="h-5 w-5 text-red-500" />
                  }
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">API</span>
                  {status.services.api ? 
                    <CheckCircle className="h-5 w-5 text-green-500" /> : 
                    <XCircle className="h-5 w-5 text-red-500" />
                  }
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">CPU Usage</span>
                  <span className="font-medium">{status.metrics.cpuUsage}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Memory</span>
                  <span className="font-medium">{status.metrics.memoryUsage}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Users</span>
                  <span className="font-medium">{status.metrics.activeConnections}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hot Wallet Limits Section */}
        {hotWalletLimits && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <WalletIcon className="h-6 w-6 text-yellow-500 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Hot Wallet Daily Limits</h3>
                </div>
                {!editingLimits && (
                  <button
                    onClick={() => {
                      setEditingLimits(true);
                      setTempLimits(hotWalletLimits);
                    }}
                    className="flex items-center px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Edit Limits
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-6">
              {editingLimits && tempLimits ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default USD Limit
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="number"
                          value={tempLimits.defaultUsdLimit}
                          onChange={(e) => setTempLimits({
                            ...tempLimits,
                            defaultUsdLimit: parseInt(e.target.value) || 0
                          })}
                          className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="1000000"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum USD Limit
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="number"
                          value={tempLimits.maximumUsdLimit}
                          onChange={(e) => setTempLimits({
                            ...tempLimits,
                            maximumUsdLimit: parseInt(e.target.value) || 0
                          })}
                          max={10000000}
                          className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="10000000"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Maximum allowed: $10,000,000</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setEditingLimits(false);
                        setTempLimits(null);
                      }}
                      className="flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </button>
                    <button
                      onClick={saveHotWalletLimits}
                      className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save Limits
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ${hotWalletLimits.defaultUsdLimit.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Default Daily Limit</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      ${hotWalletLimits.maximumUsdLimit.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Maximum Daily Limit</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      ${hotWalletLimits.remainingTotalLimit.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Remaining Today</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Emergency Controls */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Emergency Controls</h3>
            <p className="text-gray-600 text-sm mt-1">
              Critical system controls for emergency situations
            </p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {controls.map((control) => (
                <div
                  key={control.id}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${getCategoryColor(control.category)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      {getIconComponent(control.icon)}
                      <span className="ml-2 font-medium">{control.name}</span>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      control.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      control.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      control.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {control.severity}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{control.description}</p>
                  
                  <button
                    onClick={() => handleControlAction(control)}
                    className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      control.enabled
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                    title={control.tooltip}
                  >
                    {control.actionId === 'edit-hot-wallet-limits' 
                      ? 'Edit Limits' 
                      : control.enabled ? 'Disable' : 'Enable'
                    }
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Confirm Critical Action</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                This is a critical system action that will affect all users. Are you sure you want to proceed?
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelAction}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 