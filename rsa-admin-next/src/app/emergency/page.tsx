'use client';

import { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function EmergencyPage() {
  const [systemStatus, setSystemStatus] = useState({
    overall: 'operational',
    services: {
      backend: { status: 'operational', uptime: '99.9%', lastCheck: new Date().toISOString() },
      frontend: { status: 'operational', uptime: '99.8%', lastCheck: new Date().toISOString() },
      database: { status: 'operational', uptime: '99.95%', lastCheck: new Date().toISOString() },
      blockchain: { status: 'operational', uptime: '99.7%', lastCheck: new Date().toISOString() },
      hotWallet: { status: 'warning', uptime: '99.1%', lastCheck: new Date().toISOString() },
      trading: { status: 'operational', uptime: '99.6%', lastCheck: new Date().toISOString() }
    }
  });

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'warning',
      title: 'Hot Wallet Balance Low',
      message: 'RSA hot wallet balance below 1000 RSA threshold',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      severity: 'medium'
    },
    {
      id: 2,
      type: 'info',
      title: 'Scheduled Maintenance',
      message: 'Ethereum bridge maintenance scheduled for tonight 2:00 AM UTC',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      severity: 'low'
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'critical':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const emergencyActions = [
    {
      id: 1,
      title: 'Emergency Shutdown',
      description: 'Immediately halt all trading activities',
      action: () => alert('Emergency shutdown initiated'),
      severity: 'critical'
    },
    {
      id: 2,
      title: 'Pause Withdrawals',
      description: 'Temporarily suspend all withdrawal requests',
      action: () => alert('Withdrawals paused'),
      severity: 'warning'
    },
    {
      id: 3,
      title: 'Force Sync',
      description: 'Force synchronization across all services',
      action: () => alert('Force sync initiated'),
      severity: 'info'
    },
    {
      id: 4,
      title: 'Backup Hot Wallets',
      description: 'Create emergency backup of hot wallet data',
      action: () => alert('Backup initiated'),
      severity: 'info'
    }
  ];

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        services: {
          ...prev.services,
          backend: { ...prev.services.backend, lastCheck: new Date().toISOString() },
          frontend: { ...prev.services.frontend, lastCheck: new Date().toISOString() },
          database: { ...prev.services.database, lastCheck: new Date().toISOString() },
          blockchain: { ...prev.services.blockchain, lastCheck: new Date().toISOString() },
          hotWallet: { ...prev.services.hotWallet, lastCheck: new Date().toISOString() },
          trading: { ...prev.services.trading, lastCheck: new Date().toISOString() }
        }
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🚨 Emergency Control Center</h1>
          <p className="text-gray-600">Monitor system status and execute emergency procedures</p>
        </div>

        {/* Overall Status Banner */}
        <div className={`mb-8 p-4 rounded-lg border-l-4 ${
          systemStatus.overall === 'operational' 
            ? 'bg-green-50 border-green-500' 
            : 'bg-red-50 border-red-500'
        }`}>
          <div className="flex items-center">
            {getStatusIcon(systemStatus.overall)}
            <h2 className="ml-2 text-lg font-semibold">
              System Status: {systemStatus.overall.toUpperCase()}
            </h2>
            <span className="ml-auto text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Service Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Service Status</h3>
            <div className="space-y-4">
              {Object.entries(systemStatus.services).map(([service, data]) => (
                <div key={service} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center">
                    {getStatusIcon(data.status)}
                    <div className="ml-3">
                      <p className="font-medium capitalize">{service}</p>
                      <p className="text-sm text-gray-500">Uptime: {data.uptime}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(data.status)}`}>
                    {data.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Emergency Actions</h3>
            <div className="space-y-3">
              {emergencyActions.map((action) => (
                <button
                  key={action.id}
                  onClick={action.action}
                  className={`w-full p-4 text-left border rounded hover:shadow-md transition-shadow ${
                    action.severity === 'critical' 
                      ? 'border-red-300 hover:border-red-400' 
                      : action.severity === 'warning'
                      ? 'border-yellow-300 hover:border-yellow-400'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <h4 className="font-medium">{action.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h3 className="text-xl font-semibold mb-4">Recent Alerts</h3>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className={`p-4 border-l-4 rounded ${
                  alert.type === 'warning' 
                    ? 'border-yellow-500 bg-yellow-50' 
                    : 'border-blue-500 bg-blue-50'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{alert.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 