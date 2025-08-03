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
  PlayIcon
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
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);
  const [emergencyActions, setEmergencyActions] = useState<EmergencyAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);

  // Initialize emergency actions
  useEffect(() => {
    setEmergencyActions([
      {
        id: 'stop-trading',
        name: 'Stop All Trading',
        description: 'Immediately halt all trading operations across the platform',
        type: 'stop',
        severity: 'critical',
        confirmed: false
      },
      {
        id: 'maintenance-mode',
        name: 'Enable Maintenance Mode',
        description: 'Put the entire platform into maintenance mode',
        type: 'maintenance',
        severity: 'high',
        confirmed: false
      },
      {
        id: 'restart-backend',
        name: 'Restart Backend Services',
        description: 'Restart all backend API services',
        type: 'restart',
        severity: 'medium',
        confirmed: false
      },
      {
        id: 'pause-deposits',
        name: 'Pause All Deposits',
        description: 'Temporarily pause all deposit operations',
        type: 'stop',
        severity: 'medium',
        confirmed: false
      },
      {
        id: 'alert-users',
        name: 'Send Emergency Alert',
        description: 'Send emergency notification to all users',
        type: 'alert',
        severity: 'high',
        confirmed: false
      }
    ]);
  }, []);

  // Fetch system status
  const fetchSystemStatus = async () => {
    try {
      // Simulate API calls to check system status
      const services = [
        { name: 'Backend API', endpoint: 'http://localhost:8001/health' },
        { name: 'Admin Panel', endpoint: 'http://localhost:3000/api/health' },
        { name: 'Frontend DEX', endpoint: 'http://localhost:3002/api/health' },
        { name: 'Database', endpoint: 'http://localhost:8001/api/system/database' },
        { name: 'Trading Engine', endpoint: 'http://localhost:8001/api/system/trading' },
        { name: 'Cross-Chain', endpoint: 'http://localhost:8001/api/networks/status' }
      ];

      const statusPromises = services.map(async (service) => {
        try {
          const response = await fetch(service.endpoint, { 
            signal: AbortSignal.timeout(5000) 
          });
          
          return {
            service: service.name,
            status: response.ok ? 'healthy' : 'warning',
            uptime: '2h 34m',
            lastCheck: new Date().toLocaleTimeString(),
            details: response.ok ? 'Operating normally' : `HTTP ${response.status}`
          } as SystemStatus;
        } catch (error) {
          return {
            service: service.name,
            status: 'offline',
            uptime: 'Unknown',
            lastCheck: new Date().toLocaleTimeString(),
            details: 'Connection failed'
          } as SystemStatus;
        }
      });

      const statuses = await Promise.all(statusPromises);
      setSystemStatus(statuses);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch system status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh system status
  useEffect(() => {
    fetchSystemStatus();
    const interval = setInterval(fetchSystemStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      case 'offline': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-blue-600 bg-blue-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const executeEmergencyAction = async (actionId: string) => {
    const action = emergencyActions.find(a => a.id === actionId);
    if (!action || !action.confirmed) return;

    try {
      // Simulate API call to execute emergency action
      const response = await fetch(`http://localhost:8001/api/emergency/${actionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionId, timestamp: new Date().toISOString() })
      });

      if (response.ok) {
        alert(`Emergency action "${action.name}" executed successfully`);
        
        // Update local state based on action
        if (actionId === 'maintenance-mode') {
          setMaintenanceMode(true);
        }
        if (actionId === 'stop-trading' || actionId.includes('stop')) {
          setEmergencyMode(true);
        }
        
        // Reset confirmation
        setEmergencyActions(prev => 
          prev.map(a => a.id === actionId ? {...a, confirmed: false} : a)
        );
        
        // Refresh status
        fetchSystemStatus();
      } else {
        alert(`Failed to execute emergency action: ${action.name}`);
      }
    } catch (error) {
      console.error('Emergency action failed:', error);
      alert(`Error executing emergency action: ${error}`);
    }
  };

  const confirmAction = (actionId: string) => {
    setEmergencyActions(prev => 
      prev.map(a => a.id === actionId ? {...a, confirmed: true} : a)
    );
  };

  const getServiceIcon = (serviceName: string) => {
    switch (serviceName.toLowerCase()) {
      case 'backend api': return <ServerIcon className="h-5 w-5" />;
      case 'admin panel': return <CpuChipIcon className="h-5 w-5" />;
      case 'frontend dex': return <GlobeAltIcon className="h-5 w-5" />;
      case 'database': return <ServerIcon className="h-5 w-5" />;
      case 'trading engine': return <BanknotesIcon className="h-5 w-5" />;
      case 'cross-chain': return <GlobeAltIcon className="h-5 w-5" />;
      default: return <ServerIcon className="h-5 w-5" />;
    }
  };

  const criticalIssues = systemStatus.filter(s => s.status === 'critical' || s.status === 'offline').length;
  const warningIssues = systemStatus.filter(s => s.status === 'warning').length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <ShieldExclamationIcon className="h-8 w-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">Emergency Control Center</h1>
          </div>
          
          {(emergencyMode || maintenanceMode) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                <span className="font-semibold">
                  {emergencyMode && 'EMERGENCY MODE ACTIVE'}
                  {maintenanceMode && 'MAINTENANCE MODE ACTIVE'}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
              <button
                onClick={fetchSystemStatus}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <ArrowPathIcon className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              {criticalIssues > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {criticalIssues} Critical Issues
                </span>
              )}
              {warningIssues > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {warningIssues} Warnings
                </span>
              )}
            </div>
          </div>
        </div>

        {/* System Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {systemStatus.map((service, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getServiceIcon(service.service)}
                  <h3 className="text-lg font-semibold text-gray-900">{service.service}</h3>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                  {service.status.toUpperCase()}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span className="font-medium">{service.uptime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Check:</span>
                  <span className="font-medium">{service.lastCheck}</span>
                </div>
                {service.details && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                    {service.details}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Emergency Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-600" />
              Emergency Actions
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Critical actions that can be taken to protect the platform. Use with extreme caution.
            </p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {emergencyActions.map((action) => (
                <div key={action.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        {action.type === 'stop' && <StopIcon className="h-4 w-4 mr-2 text-red-600" />}
                        {action.type === 'restart' && <ArrowPathIcon className="h-4 w-4 mr-2 text-blue-600" />}
                        {action.type === 'maintenance' && <CpuChipIcon className="h-4 w-4 mr-2 text-yellow-600" />}
                        {action.type === 'alert' && <ExclamationTriangleIcon className="h-4 w-4 mr-2 text-orange-600" />}
                        {action.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(action.severity)}`}>
                      {action.severity.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!action.confirmed ? (
                      <button
                        onClick={() => confirmAction(action.id)}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          action.severity === 'critical' 
                            ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100 focus:ring-red-500'
                            : action.severity === 'high'
                            ? 'border-orange-300 text-orange-700 bg-orange-50 hover:bg-orange-100 focus:ring-orange-500'
                            : 'border-yellow-300 text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:ring-yellow-500'
                        }`}
                      >
                        Confirm Action
                      </button>
                    ) : (
                      <button
                        onClick={() => executeEmergencyAction(action.id)}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Execute Now
                      </button>
                    )}
                    
                    {action.confirmed && (
                      <button
                        onClick={() => setEmergencyActions(prev => 
                          prev.map(a => a.id === action.id ? {...a, confirmed: false} : a)
                        )}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Metrics Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ServerIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Services</p>
                <p className="text-2xl font-semibold text-gray-900">{systemStatus.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Healthy</p>
                <p className="text-2xl font-semibold text-green-600">
                  {systemStatus.filter(s => s.status === 'healthy').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Warnings</p>
                <p className="text-2xl font-semibold text-yellow-600">{warningIssues}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-semibold text-red-600">{criticalIssues}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyPage; 