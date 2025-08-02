'use client';

import React, { useState } from 'react';
import Layout from '@/components/Layout';

interface HelpSection {
  id: string;
  title: string;
  content: string;
  icon: string;
}

export default function AdminHelpPage() {
  const [activeSection, setActiveSection] = useState('getting-started');

  const helpSections: HelpSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: '🚀',
      content: `
        <h3 className="text-lg font-semibold mb-3">Welcome to RSA DEX Admin Panel</h3>
        <p className="mb-4">This admin panel provides comprehensive management tools for the RSA DEX platform.</p>
        
        <h4 className="font-semibold mb-2">Quick Start Guide:</h4>
        <ol className="list-decimal list-inside space-y-2 mb-4">
          <li>Ensure the RSA DEX backend is running on port 8000</li>
          <li>Log in with your admin credentials</li>
          <li>Navigate through the different sections using the sidebar</li>
          <li>Monitor system status and manage operations</li>
        </ol>
        
        <h4 className="font-semibold mb-2">System Requirements:</h4>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>Modern web browser (Chrome, Firefox, Safari, Edge)</li>
          <li>RSA DEX backend running on localhost:8000</li>
          <li>Admin credentials with appropriate permissions</li>
        </ul>
      `
    },
    {
      id: 'orders',
      title: 'Orders Management',
      icon: '📊',
      content: `
        <h3 className="text-lg font-semibold mb-3">Managing Orders</h3>
        <p className="mb-4">The Orders page allows you to view and manage all trading orders on the platform.</p>
        
        <h4 className="font-semibold mb-2">Features:</h4>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li><strong>View Orders:</strong> See all orders with details like pair, amount, price, and status</li>
          <li><strong>Filter Orders:</strong> Filter by status, side (buy/sell), and type (market/limit)</li>
          <li><strong>Cancel Orders:</strong> Cancel pending orders when necessary</li>
          <li><strong>Real-time Updates:</strong> Orders are updated in real-time</li>
        </ul>
        
        <h4 className="font-semibold mb-2">Order Statuses:</h4>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li><span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Pending</span> - Order is waiting to be filled</li>
          <li><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Filled</span> - Order has been completely filled</li>
          <li><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Partially Filled</span> - Order has been partially filled</li>
          <li><span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Cancelled</span> - Order has been cancelled</li>
        </ul>
      `
    },
    {
      id: 'trades',
      title: 'Trade History',
      icon: '💱',
      content: `
        <h3 className="text-lg font-semibold mb-3">Trade History</h3>
        <p className="mb-4">Monitor all completed trades and trading activity on the platform.</p>
        
        <h4 className="font-semibold mb-2">Features:</h4>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li><strong>Trade Overview:</strong> View all completed trades with details</li>
          <li><strong>Filter by Pair:</strong> Filter trades by specific trading pairs</li>
          <li><strong>Time Range:</strong> Filter trades by time periods (1h, 24h, 7d, 30d, all)</li>
          <li><strong>Statistics:</strong> View total volume, trade count, and average prices</li>
        </ul>
        
        <h4 className="font-semibold mb-2">Trade Information:</h4>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li><strong>Pair:</strong> Trading pair (e.g., RSA/USDT)</li>
          <li><strong>Side:</strong> Buy or sell transaction</li>
          <li><strong>Amount:</strong> Quantity traded</li>
          <li><strong>Price:</strong> Execution price</li>
          <li><strong>Total:</strong> Total value of the trade</li>
        </ul>
      `
    },
    {
      id: 'wallets',
      title: 'Wallet Management',
      icon: '💰',
      content: `
        <h3 className="text-lg font-semibold mb-3">Wallet Management</h3>
        <p className="mb-4">Manage system wallets and monitor balances across different assets.</p>
        
        <h4 className="font-semibold mb-2">Features:</h4>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li><strong>View Wallets:</strong> See all system wallets with balances</li>
          <li><strong>Balance Monitoring:</strong> Monitor RSA, USDT, and BTC balances</li>
          <li><strong>Fund Wallets:</strong> Add funds to system wallets</li>
          <li><strong>Total Value:</strong> View total USD value of wallet holdings</li>
        </ul>
        
        <h4 className="font-semibold mb-2">Wallet Actions:</h4>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li><strong>View:</strong> See detailed wallet information and transaction history</li>
          <li><strong>Fund:</strong> Add specific amounts of any supported asset</li>
        </ul>
        
        <h4 className="font-semibold mb-2">Supported Assets:</h4>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>RSA - Native token</li>
          <li>USDT - Tether stablecoin</li>
          <li>BTC - Bitcoin</li>
        </ul>
      `
    },
    {
      id: 'users',
      title: 'User Management',
      icon: '👥',
      content: `
        <h3 className="text-lg font-semibold mb-3">User Management</h3>
        <p className="mb-4">Manage user accounts, monitor activity, and control access to the platform.</p>
        
        <h4 className="font-semibold mb-2">Features:</h4>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li><strong>User Overview:</strong> View all registered users and their details</li>
          <li><strong>Activity Monitoring:</strong> Track user login times and activity</li>
          <li><strong>Status Management:</strong> Activate, suspend, or manage user accounts</li>
          <li><strong>Performance Metrics:</strong> View user trading statistics</li>
        </ul>
        
        <h4 className="font-semibold mb-2">User Actions:</h4>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li><strong>View:</strong> See detailed user information and activity</li>
          <li><strong>Suspend:</strong> Temporarily disable user account</li>
          <li><strong>Activate:</strong> Re-enable suspended user account</li>
        </ul>
        
        <h4 className="font-semibold mb-2">User Statuses:</h4>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Active</span> - User can trade normally</li>
          <li><span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Suspended</span> - User account is temporarily disabled</li>
          <li><span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">Inactive</span> - User has not logged in recently</li>
        </ul>
      `
    },
    {
      id: 'transactions',
      title: 'Transaction Management',
      icon: '🔗',
      content: `
        <h3 className="text-lg font-semibold mb-3">Transaction Management</h3>
        <p className="mb-4">Monitor and manage blockchain transactions on the platform.</p>
        
        <h4 className="font-semibold mb-2">Features:</h4>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li><strong>Transaction Overview:</strong> View all blockchain transactions</li>
          <li><strong>Status Management:</strong> Approve, reject, or freeze transactions</li>
          <li><strong>Filter Options:</strong> Filter by status, asset, and other criteria</li>
          <li><strong>Transaction Details:</strong> View gas usage, addresses, and amounts</li>
        </ul>
        
        <h4 className="font-semibold mb-2">Transaction Actions:</h4>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li><strong>Approve:</strong> Allow pending transaction to proceed</li>
          <li><strong>Reject:</strong> Deny transaction with reason</li>
          <li><strong>Freeze:</strong> Temporarily halt transaction processing</li>
          <li><strong>Recall:</strong> Recover frozen transactions</li>
        </ul>
        
        <h4 className="font-semibold mb-2">Transaction Statuses:</h4>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li><span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Pending</span> - Waiting for approval</li>
          <li><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Completed</span> - Successfully processed</li>
          <li><span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Failed</span> - Transaction failed</li>
          <li><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Frozen</span> - Temporarily halted</li>
        </ul>
      `
    },
    {
      id: 'contracts',
      title: 'Contract Management',
      icon: '📜',
      content: `
        <h3 className="text-lg font-semibold mb-3">Smart Contract Management</h3>
        <p className="mb-4">Manage smart contracts and their token balances on the platform.</p>
        
        <h4 className="font-semibold mb-2">Features:</h4>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li><strong>Contract Overview:</strong> View all smart contracts and their status</li>
          <li><strong>Balance Management:</strong> Add or reduce token balances</li>
          <li><strong>Token Transfers:</strong> Transfer tokens from contracts</li>
          <li><strong>Status Monitoring:</strong> Monitor contract health and status</li>
        </ul>
        
        <h4 className="font-semibold mb-2">Contract Actions:</h4>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li><strong>Add Balance:</strong> Increase contract token balance</li>
          <li><strong>Reduce Balance:</strong> Decrease contract token balance</li>
          <li><strong>Transfer:</strong> Send tokens from contract to address</li>
        </ul>
        
        <h4 className="font-semibold mb-2">Contract Types:</h4>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li><strong>ERC20:</strong> Token contracts</li>
          <li><strong>DEX:</strong> Decentralized exchange contracts</li>
          <li><strong>Staking:</strong> Staking and reward contracts</li>
        </ul>
      `
    },
    {
      id: 'settings',
      title: 'Settings & Configuration',
      icon: '⚙️',
      content: `
        <h3 className="text-lg font-semibold mb-3">System Settings</h3>
        <p className="mb-4">Configure system settings, feature flags, and network parameters.</p>
        
        <h4 className="font-semibold mb-2">General Settings:</h4>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li><strong>Environment:</strong> View current deployment environment</li>
          <li><strong>Admin Credentials:</strong> Manage admin account settings</li>
          <li><strong>JWT Configuration:</strong> Security token settings</li>
        </ul>
        
        <h4 className="font-semibold mb-2">Feature Flags:</h4>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li><strong>Transaction Recall:</strong> Enable transaction recovery features</li>
          <li><strong>Emergency Controls:</strong> Enable emergency shutdown procedures</li>
          <li><strong>Contract Governance:</strong> Enable contract upgrade features</li>
          <li><strong>Two-Factor Authentication:</strong> Require 2FA for admin operations</li>
          <li><strong>Analytics Dashboard:</strong> Enable advanced reporting</li>
          <li><strong>User Management:</strong> Enable user registration features</li>
          <li><strong>Node Management:</strong> Enable validator node controls</li>
        </ul>
        
        <h4 className="font-semibold mb-2">Network Configuration:</h4>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li><strong>RSA DEX Backend:</strong> Backend API endpoint</li>
          <li><strong>RSA Network URL:</strong> Blockchain network endpoint</li>
          <li><strong>RSA Horizon URL:</strong> Horizon API endpoint</li>
          <li><strong>RSA Faucet URL:</strong> Testnet faucet endpoint</li>
        </ul>
      `
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: '🔧',
      content: `
        <h3 className="text-lg font-semibold mb-3">Common Issues & Solutions</h3>
        <p className="mb-4">Solutions for common problems you might encounter.</p>
        
        <h4 className="font-semibold mb-2">Connection Issues:</h4>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li><strong>Backend Not Responding:</strong> Ensure RSA DEX backend is running on port 8000</li>
          <li><strong>CORS Errors:</strong> Check backend CORS configuration</li>
          <li><strong>Authentication Errors:</strong> Verify admin credentials and token validity</li>
        </ul>
        
        <h4 className="font-semibold mb-2">Data Loading Issues:</h4>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li><strong>Empty Tables:</strong> Check if backend has data or is using mock data</li>
          <li><strong>Loading Errors:</strong> Refresh the page or check network connectivity</li>
          <li><strong>Filter Issues:</strong> Clear filters and try again</li>
        </ul>
        
        <h4 className="font-semibold mb-2">Action Failures:</h4>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li><strong>Permission Denied:</strong> Ensure you have admin privileges</li>
          <li><strong>Invalid Data:</strong> Check input formats and required fields</li>
          <li><strong>Network Timeout:</strong> Try again or check backend status</li>
        </ul>
        
        <h4 className="font-semibold mb-2">Getting Support:</h4>
        <ul className="list-disc list-inside space-y-1 mb-4">
          <li>Check the browser console for error messages</li>
          <li>Verify backend logs for server-side issues</li>
          <li>Contact system administrator for persistent issues</li>
        </ul>
      `
    }
  ];

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Help & Documentation</h1>
          <p className="text-gray-600 mt-2">Comprehensive guide to using the RSA DEX Admin Panel</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Topics</h2>
              <nav className="space-y-2">
                {helpSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">{section.icon}</span>
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              {helpSections.map((section) => (
                <div
                  key={section.id}
                  className={activeSection === section.id ? 'block' : 'hidden'}
                >
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-3">{section.icon}</span>
                    <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                  </div>
                  <div 
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Need More Help?
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  If you need additional assistance, please contact your system administrator or check the backend logs for technical issues.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 