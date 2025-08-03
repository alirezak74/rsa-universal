'use client';

import React, { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon, 
  ShieldExclamationIcon,
  CpuChipIcon,
  ServerIcon,
  GlobeAltIcon,
  BanknotesIcon,
  UsersIcon,
  ArrowPathIcon,
  StopIcon,
  PlayIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface SystemStatus {
  service: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  uptime: string;
  lastCheck: string;
  details?: string;
}

interface EmergencyAction {
  id: string;
  name: string;
  description: string;
  type: 'stop' | 'restart' | 'maintenance' | 'alert';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confirmed: boolean;
}

const EmergencyPage: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([
    {
      service: 'Backend API',
      status: 'healthy',
      uptime: '99.9%',
      lastCheck: new Date().toISOString(),
      details: 'All endpoints responding'
    },
    {
      service: 'Database',
      status: 'healthy', 
      uptime: '100%',
      lastCheck: new Date().toISOString(),
      details: 'Connection stable'
    },
    {
      service: 'Trading Engine',
      status: 'healthy',
      uptime: '99.8%',
      lastCheck: new Date().toISOString(),
      details: 'Processing orders normally'
    },
    {
      service: 'Cross-Chain Bridge',
      status: 'warning',
      uptime: '98.5%',
      lastCheck: new Date().toISOString(),
      details: 'Minor delays on Ethereum network'
    }
  ]);

  const [emergencyActions, setEmergencyActions] = useState<EmergencyAction[]>([
    {
      id: 'maintenance_mode',
      name: 'Enable Maintenance Mode',
      description: 'Put the entire system into maintenance mode',
      type: 'maintenance',
      severity: 'high',
      confirmed: false
    },
    {
      id: 'stop_trading',
      name: 'Stop All Trading',
      description: 'Immediately halt all trading operations',
      type: 'stop',
      severity: 'critical',
      confirmed: false
    },
    {
      id: 'restart_services',
      name: 'Restart All Services',
      description: 'Restart backend, database, and trading engine',
      type: 'restart',
      severity: 'medium',
      confirmed: false
    }
  ]);

  const [alertHistory, setAlertHistory] = useState([
    {
      id: 1,
      timestamp: new Date().toISOString(),
      type: 'info',
      message: 'System health check completed successfully'
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: 'warning',
      message: 'High CPU usage detected on trading server'
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      type: 'info',
      message: 'Scheduled maintenance completed'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      case 'offline': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircleIcon className="h-5 w-5" />;
      case 'warning': return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'critical': return <ShieldExclamationIcon className="h-5 w-5" />;
      case 'offline': return <StopIcon className="h-5 w-5" />;
      default: return <CpuChipIcon className="h-5 w-5" />;
    }
  };

  const handleEmergencyAction = (actionId: string) => {
    setEmergencyActions(prev => 
      prev.map(action => 
        action.id === actionId 
          ? { ...action, confirmed: !action.confirmed }
          : action
      )
    );
  };

  const executeEmergencyAction = (action: EmergencyAction) => {
    if (!action.confirmed) {
      alert('Please confirm the action first by checking the checkbox.');
      return;
    }

    // Simulate action execution
    setAlertHistory(prev => [{
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type: 'info',
      message: `Emergency action executed: ${action.name}`
    }, ...prev]);

    // Reset confirmation
    setEmergencyActions(prev => 
      prev.map(a => 
        a.id === action.id ? { ...a, confirmed: false } : a
      )
    );
  };

  // Auto-refresh system status
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStatus(prev => prev.map(service => ({
        ...service,
        lastCheck: new Date().toISOString()
      })));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <ShieldExclamationIcon className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold">Emergency Management</h1>
          </div>
          <p className="text-gray-400">
            Monitor system health and execute emergency procedures for RSA DEX ecosystem
          </p>
        </div>

        {/* System Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {systemStatus.map((service, index) => (
            <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className={getStatusColor(service.status)}>
                    {getStatusIcon(service.status)}
                  </div>
                  <h3 className="font-semibold">{service.service}</h3>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  service.status === 'healthy' ? 'bg-green-900 text-green-300' :
                  service.status === 'warning' ? 'bg-yellow-900 text-yellow-300' :
                  service.status === 'critical' ? 'bg-red-900 text-red-300' :
                  'bg-gray-700 text-gray-300'
                }`}>
                  {service.status}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Uptime:</span>
                  <span>{service.uptime}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Last check: {new Date(service.lastCheck).toLocaleTimeString()}
                </div>
                <div className="text-xs text-gray-400">
                  {service.details}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Emergency Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-6 w-6 text-orange-500" />
              <span>Emergency Actions</span>
            </h2>
            <div className="space-y-4">
              {emergencyActions.map((action) => (
                <div key={action.id} className="border border-gray-600 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{action.name}</h3>
                      <p className="text-sm text-gray-400 mt-1">{action.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      action.severity === 'critical' ? 'bg-red-900 text-red-300' :
                      action.severity === 'high' ? 'bg-orange-900 text-orange-300' :
                      action.severity === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                      'bg-blue-900 text-blue-300'
                    }`}>
                      {action.severity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={action.confirmed}
                        onChange={() => handleEmergencyAction(action.id)}
                        className="rounded border-gray-600 bg-gray-700"
                      />
                      <span className="text-sm">I confirm this action</span>
                    </label>
                    <button
                      onClick={() => executeEmergencyAction(action)}
                      disabled={!action.confirmed}
                      className={`px-4 py-2 rounded font-medium ${
                        action.confirmed
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Execute
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alert History */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <ServerIcon className="h-6 w-6 text-blue-500" />
              <span>Alert History</span>
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alertHistory.map((alert) => (
                <div key={alert.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      alert.type === 'error' ? 'bg-red-900 text-red-300' :
                      alert.type === 'warning' ? 'bg-yellow-900 text-yellow-300' :
                      'bg-blue-900 text-blue-300'
                    }`}>
                      {alert.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>RSA DEX Emergency Management System - Last updated: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default EmergencyPage; 