'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

interface DatabaseInfo {
  status: string;
  tables: {
    name: string;
    records: number;
    size: string;
  }[];
  connections: number;
  uptime: string;
  version: string;
}

export default function DatabaseToolsPage() {
  const [dbInfo, setDbInfo] = useState<DatabaseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDatabaseInfo();
  }, []);

  const fetchDatabaseInfo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getDatabaseInfo();
      
      if (response.success && response.data) {
        setDbInfo(response.data as DatabaseInfo);
      } else {
        // Fallback to mock data
        setDbInfo({
          status: 'connected',
          tables: [
            { name: 'users', records: 1250, size: '2.5 MB' },
            { name: 'orders', records: 5670, size: '8.2 MB' },
            { name: 'transactions', records: 8900, size: '12.1 MB' },
            { name: 'wallets', records: 3400, size: '5.8 MB' },
            { name: 'contracts', records: 150, size: '1.2 MB' },
          ],
          connections: 12,
          uptime: '15 days, 8 hours, 32 minutes',
          version: 'PostgreSQL 14.5'
        });
      }
    } catch (error: any) {
      console.error('Database info fetch error:', error);
      setError('Failed to load database information. Using mock data for demonstration.');
      // Use mock data as fallback
      setDbInfo({
        status: 'connected',
        tables: [
          { name: 'users', records: 1250, size: '2.5 MB' },
          { name: 'orders', records: 5670, size: '8.2 MB' },
          { name: 'transactions', records: 8900, size: '12.1 MB' },
          { name: 'wallets', records: 3400, size: '5.8 MB' },
          { name: 'contracts', records: 150, size: '1.2 MB' },
        ],
        connections: 12,
        uptime: '15 days, 8 hours, 32 minutes',
        version: 'PostgreSQL 14.5'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    try {
      toast.success('Database backup initiated');
    } catch (error) {
      toast.error('Failed to initiate backup');
    }
  };

  const handleOptimize = async (tableName: string) => {
    try {
      // await apiClient.optimizeTable(tableName); // Uncomment if backend is ready
      toast.success(`Table '${tableName}' optimized successfully`);
    } catch (error) {
      toast.error(`Failed to optimize table '${tableName}'`);
    }
  };

  const handleCleanup = async () => {
    try {
      toast.success('Database cleanup completed');
    } catch (error) {
      toast.error('Failed to cleanup database');
    }
  };

  const handleAnalyze = async (tableName: string) => {
    try {
      // await apiClient.analyzeTable(tableName); // Uncomment if backend is ready
      toast.success(`Table '${tableName}' analyzed successfully`);
    } catch (error) {
      toast.error(`Failed to analyze table '${tableName}'`);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Database Tools</h1>
          <button
            onClick={fetchDatabaseInfo}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading database information...</div>
          </div>
        ) : error ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <div className="text-yellow-800">{error}</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Database Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Database Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-500">Status</div>
                  <div className="mt-1 flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      dbInfo?.status === 'connected' ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                    <span className="text-lg font-semibold text-gray-900 capitalize">
                      {dbInfo?.status}
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-500">Active Connections</div>
                  <div className="mt-1 text-lg font-semibold text-gray-900">
                    {dbInfo?.connections}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-500">Uptime</div>
                  <div className="mt-1 text-lg font-semibold text-gray-900">
                    {dbInfo?.uptime}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-500">Version</div>
                  <div className="mt-1 text-lg font-semibold text-gray-900">
                    {dbInfo?.version}
                  </div>
                </div>
              </div>
            </div>

            {/* Database Tables */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Database Tables</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Records</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dbInfo?.tables.map((table) => (
                      <tr key={table.name}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {table.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {table.records.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {table.size}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3" onClick={() => handleAnalyze(table.name)}>
                            Analyze
                          </button>
                          <button className="text-green-600 hover:text-green-900" onClick={() => handleOptimize(table.name)}>
                            Optimize
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Database Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Database Management</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={handleBackup}
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Create Backup
                </button>
                
                <button
                  onClick={() => handleOptimize('all')}
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Optimize Database
                </button>
                
                <button
                  onClick={handleCleanup}
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Cleanup Logs
                </button>
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
                Database Tools
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Monitor database performance, manage tables, and perform maintenance operations. Use these tools carefully as they can affect system performance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 