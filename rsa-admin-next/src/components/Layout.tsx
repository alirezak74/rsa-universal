'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  Settings, 
  Wallet, 
  FileText, 
  Activity, 
  AlertTriangle, 
  Users, 
  Server, 
  FileCode,
  RotateCcw,
  LogOut,
  Menu,
  X,
  Shield,
  BarChart3,
  Coins,
  Link as LinkIcon,
  DollarSign,
  TrendingUp,
  WalletIcon
} from 'lucide-react';
import { FEATURES } from '@/config/settings';
import { apiClient } from '@/lib/api';
import SyncStatusComponent from './SyncStatus';

interface LayoutProps {
  children: ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  enabled: boolean;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = apiClient.getToken();
    if (!token && pathname !== '/login') {
      router.push('/login');
      return;
    }

    // Load user data if authenticated
    if (token) {
      loadUserData();
    }
  }, [pathname, router]);

  const loadUserData = async () => {
    try {
      const response = await apiClient.verifyToken();
      if (response.success) {
        setUser(response.data);
      } else {
        apiClient.clearToken();
        router.push('/login');
      }
    } catch (error) {
      apiClient.clearToken();
      router.push('/login');
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
    }
  };

  const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/', icon: Home, enabled: true },
    { name: 'Orders', href: '/orders', icon: FileText, enabled: true },
    { name: 'Trades', href: '/trades', icon: Activity, enabled: true },
    { name: 'Cross-Chain', href: '/cross-chain', icon: LinkIcon, enabled: true },
    { name: 'Hot Wallet Management', href: '/hot-wallet', icon: WalletIcon, enabled: true },
    { name: 'Wrapped Tokens', href: '/wrapped-tokens', icon: TrendingUp, enabled: true },
    { name: 'Wallets', href: '/wallets', icon: Wallet, enabled: true },
    { name: 'Users', href: '/users', icon: Users, enabled: true },
    { name: 'Transactions', href: '/transactions', icon: FileText, enabled: true },
    { name: 'Contracts', href: '/contracts', icon: FileCode, enabled: true },
    { name: 'Assets', href: '/assets', icon: Coins, enabled: true },
    { name: 'Asset Management', href: '/assets', icon: Coins, enabled: true },
    { name: 'Logs', href: '/logs', icon: Activity, enabled: true },
    { name: 'Settings', href: '/settings', icon: Settings, enabled: true },
    { name: 'Database Tools', href: '/dbtools', icon: Server, enabled: true },
    { name: 'Gas Settings', href: '/gas', icon: Settings, enabled: true },
    { name: 'Emergency', href: '/emergency', icon: AlertTriangle, enabled: true },
    { name: 'Help', href: '/help', icon: FileText, enabled: true },
  ];

  const filteredNavigation = navigation.filter(item => item.enabled);

  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">RSA Admin</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                  {item.badge && (
                    <span className="ml-auto bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">RSA Admin</span>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                  {item.badge && (
                    <span className="ml-auto bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <SyncStatusComponent />
              {user && (
                <div className="flex items-center gap-x-2">
                  <span className="text-sm text-gray-700">{user.username}</span>
                  <span className="text-xs text-gray-500">({user.role})</span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-x-2 text-sm text-gray-700 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 