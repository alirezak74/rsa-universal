'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, TrendingUp, Wallet, Settings, UserPlus, LogIn } from 'lucide-react'
import WalletModal from './WalletModal'
import { useWalletStore } from '../store/walletStore'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const { publicKey, disconnect } = useWalletStore()
  const pathname = usePathname()

  // Get page title based on current route
  const getPageTitle = () => {
    switch (pathname) {
      case '/login':
        return 'Login'
      case '/new-account':
        return 'Create Wallet'
      case '/buy':
        return 'Buy Crypto'
      case '/swap':
        return 'Swap Tokens'
      case '/exchange':
        return 'Exchange'
      case '/wallet':
        return 'Wallet'
      case '/deposits':
        return 'Deposits'
      case '/markets':
        return 'Markets'
      case '/orders':
        return 'Orders'
      case '/history':
        return 'History'
      default:
        return null
    }
  }

  const pageTitle = getPageTitle()

  return (
    <>
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  RSA DEX
                </span>
              </Link>
              
              {/* Page Title - More Prominent */}
              {pageTitle && (
                <div className="hidden sm:flex items-center">
                  <span className="text-gray-400 dark:text-gray-500 mx-2">|</span>
                  <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {pageTitle}
                  </h1>
                </div>
              )}
              
              {pathname === '/' && (
                <span className="hidden sm:block text-sm text-gray-500 dark:text-gray-400">
                  Decentralized Exchange
                </span>
              )}
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/markets" 
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Markets
              </Link>
              <Link 
                href="/exchange" 
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Exchange
              </Link>
              <Link 
                href="/buy" 
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Buy Crypto
              </Link>
              <Link 
                href="/swap" 
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Swap
              </Link>
              <Link 
                href="/wallet" 
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Wallet
              </Link>
              <Link 
                href="/deposits" 
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Deposits
              </Link>
              
              {/* Account Links */}
              <div className="flex items-center space-x-4 border-l border-gray-300 dark:border-gray-600 pl-6">
                <Link 
                  href="/new-account" 
                  className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  New Account
                </Link>
                <Link 
                  href="/login" 
                  className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <LogIn className="w-4 h-4 mr-1" />
                  Login
                </Link>
              </div>
            </nav>

            <div className="flex items-center space-x-4">
              {publicKey ? (
                <div className="flex items-center space-x-2">
                  <div className="hidden sm:flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-mono text-gray-600 dark:text-gray-300">
                      {publicKey.slice(0, 8)}...{publicKey.slice(-8)}
                    </span>
                  </div>
                  <button
                    onClick={disconnect}
                    className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsWalletModalOpen(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </button>
              )}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Page Title */}
          {pageTitle && (
            <div className="sm:hidden pb-2">
              <h1 className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {pageTitle}
              </h1>
            </div>
          )}

          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
              <nav className="flex flex-col space-y-2">
                <Link 
                  href="/markets" 
                  className="py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Markets
                </Link>
                <Link 
                  href="/exchange" 
                  className="py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Exchange
                </Link>
                <Link 
                  href="/buy" 
                  className="py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Buy Crypto
                </Link>
                <Link 
                  href="/swap" 
                  className="py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Swap
                </Link>
                <Link 
                  href="/wallet" 
                  className="py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Wallet
                </Link>
                <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                  <Link 
                    href="/new-account" 
                    className="py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    New Account
                  </Link>
                  <Link 
                    href="/login" 
                    className="py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {isWalletModalOpen && (
        <WalletModal onClose={() => setIsWalletModalOpen(false)} />
      )}
    </>
  )
} 