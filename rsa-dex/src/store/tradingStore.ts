import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Types
export interface Asset {
  id: string
  symbol: string
  name: string
  icon: string
  decimals: number
  type: 'crypto' | 'token' | 'fiat'
  price: number
  status: 'active' | 'inactive'
  contractAddress?: string
  issuer?: string
  syncWithDex: boolean
  visibilitySettings: {
    wallets: boolean
    contracts: boolean
    trading: boolean
    transactions: boolean
  }
  metadata?: {
    website?: string
    explorer?: string
    marketCap?: number
    volume24h?: number
    change24h?: number
  }
}

export interface TradingPair {
  symbol: string
  baseAsset: string
  quoteAsset: string
  price: number
  change24h: number
  volume24h: number
  high24h: number
  low24h: number
}

export interface Wallet {
  address: string
  publicKey: string
  balances: Record<string, number>
  network: string
}

export interface Order {
  id: string
  pair: string
  side: 'buy' | 'sell'
  type: 'market' | 'limit'
  amount: number
  price?: number
  filled: number
  status: 'pending' | 'filled' | 'partially_filled' | 'cancelled' | 'rejected'
  timestamp: string
  userId?: string
}

export interface Trade {
  id: string
  pair: string
  side: 'buy' | 'sell'
  amount: number
  price: number
  timestamp: string
  orderId?: string
}

export interface Transaction {
  id: string
  type: 'deposit' | 'withdrawal' | 'transfer' | 'trade'
  asset: string
  amount: number
  status: 'pending' | 'completed' | 'failed'
  hash?: string
  timestamp: string
  from?: string
  to?: string
}

interface TradingStore {
  // Assets and Markets
  assets: Asset[]
  tradingPairs: TradingPair[]
  currentPair: string
  
  // Wallet
  wallet: Wallet | null
  isConnected: boolean
  
  // Trading
  userOrders: Order[]
  recentTrades: Trade[]
  orderbook: {
    bids: Array<{ price: number; amount: number }>
    asks: Array<{ price: number; amount: number }>
  }
  
  // Transactions
  transactions: Transaction[]
  
  // UI State
  loading: boolean
  error: string | null
  
  // Actions
  setAssets: (assets: Asset[]) => void
  setTradingPairs: (pairs: TradingPair[]) => void
  setCurrentPair: (pair: string) => void
  setWallet: (wallet: Wallet | null) => void
  setIsConnected: (connected: boolean) => void
  updateBalance: (asset: string, balance: number) => void
  addOrder: (order: Omit<Order, 'id' | 'timestamp'>) => void
  updateOrder: (orderId: string, updates: Partial<Order>) => void
  cancelOrder: (orderId: string) => void
  addTrade: (trade: Trade) => void
  addTransaction: (transaction: Transaction) => void
  updateOrderbook: (pair: string, orderbook: any) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Sync functions
  syncAssetsFromAdmin: () => Promise<void>
  syncPrices: () => Promise<void>
  fetchOrderbook: (pair: string) => Promise<void>
  fetchRecentTrades: (pair: string) => Promise<void>
}

// Mock data for fallback
const mockAssets: Asset[] = [
  {
    id: '1',
    symbol: 'RSA',
    name: 'RSA Chain',
    icon: '🔗',
    decimals: 18,
    type: 'crypto',
    price: 0.85, // Updated to correct price of $0.85 USD
    status: 'active',
    contractAddress: undefined,
    issuer: 'native',
    syncWithDex: true,
    visibilitySettings: {
      wallets: true,
      contracts: true,
      trading: true,
      transactions: true,
    },
    metadata: {
      website: 'https://rsachain.com',
      explorer: 'https://explorer.rsachain.com',
      marketCap: 125000000,
      volume24h: 5200000,
      change24h: 2.5,
    },
  },
  {
    id: '2',
    symbol: 'ETH',
    name: 'Ethereum',
    icon: 'Ξ',
    decimals: 18,
    type: 'crypto',
    price: 3500.75,
    status: 'active',
    contractAddress: '0x0000000000000000000000000000000000000000',
    issuer: 'GARDNV3Q7YGT...MMXJTEDL5T55',
    syncWithDex: true,
    visibilitySettings: {
      wallets: true,
      contracts: true,
      trading: true,
      transactions: true,
    },
    metadata: {
      website: 'https://ethereum.org',
      explorer: 'https://etherscan.io',
      marketCap: 420000000000,
      volume24h: 15000000000,
      change24h: -1.2,
    },
  },
  {
    id: '3',
    symbol: 'BTC',
    name: 'Bitcoin',
    icon: '₿',
    decimals: 8,
    type: 'crypto',
    price: 65000.50,
    status: 'active',
    contractAddress: undefined,
    issuer: 'GARDNV3Q7YGT...MMXJTEDL5',
    syncWithDex: true,
    visibilitySettings: {
      wallets: true,
      contracts: true,
      trading: true,
      transactions: true,
    },
    metadata: {
      website: 'https://bitcoin.org',
      explorer: 'https://blockstream.info',
      marketCap: 1280000000000,
      volume24h: 28000000000,
      change24h: 3.7,
    },
  },
  {
    id: '4',
    symbol: 'USDT',
    name: 'Tether USD',
    icon: '💵',
    decimals: 6,
    type: 'token',
    price: 1.00,
    status: 'active',
    contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    issuer: 'GA5ZSEJYB37J...P5RE34KZVN',
    syncWithDex: true,
    visibilitySettings: {
      wallets: true,
      contracts: true,
      trading: true,
      transactions: true,
    },
    metadata: {
      website: 'https://tether.to',
      explorer: 'https://etherscan.io/token/0xdAC17F958D2ee523a2206206994597C13D831ec7',
      marketCap: 95000000000,
      volume24h: 45000000000,
      change24h: 0.1,
    },
  },
]

const mockTradingPairs: TradingPair[] = [
  {
    symbol: 'RSA/USDT',
    baseAsset: 'RSA',
    quoteAsset: 'USDT',
    price: 0.85, // Updated to correct RSA price of $0.85 USD
    change24h: 2.5,
    volume24h: 5200000,
    high24h: 0.92,
    low24h: 0.78,
  },
  {
    symbol: 'ETH/USDT',
    baseAsset: 'ETH',
    quoteAsset: 'USDT',
    price: 3500.75,
    change24h: -1.2,
    volume24h: 15000000000,
    high24h: 3620.00,
    low24h: 3480.50,
  },
  {
    symbol: 'BTC/USDT',
    baseAsset: 'BTC',
    quoteAsset: 'USDT',
    price: 65000.50,
    change24h: 3.7,
    volume24h: 28000000000,
    high24h: 67200.00,
    low24h: 63800.00,
  },
  {
    symbol: 'ETH/RSA',
    baseAsset: 'ETH',
    quoteAsset: 'RSA',
    price: 4118.24, // Updated based on ETH $3500.75 / RSA $0.85
    change24h: -3.5,
    volume24h: 2800000,
    high24h: 4353.00,
    low24h: 4000.00,
  },
  {
    symbol: 'BTC/RSA',
    baseAsset: 'BTC',
    quoteAsset: 'RSA',
    price: 76471.18, // Updated based on BTC $65000.50 / RSA $0.85
    change24h: 1.2,
    volume24h: 8900000,
    high24h: 79000.00,
    low24h: 74000.00,
  },
  {
    symbol: 'ETH/BTC',
    baseAsset: 'ETH',
    quoteAsset: 'BTC',
    price: 0.0538,
    change24h: -4.8,
    volume24h: 1200000,
    high24h: 0.0562,
    low24h: 0.0535,
  },
]

// Create a safe storage that won't trigger CSP violations
const safePersistConfig = (() => {
  try {
    return {
      name: 'rsa-dex-frontend-trading-store', // Changed from 'rsa-dex-trading-store'
      storage: createJSONStorage(() => localStorage),
      partialize: (state: TradingStore) => ({
        currentPair: state.currentPair,
        wallet: state.wallet,
        isConnected: state.isConnected,
      }),
    }
  } catch (error) {
    console.warn('Persistence disabled due to storage restrictions')
    return undefined
  }
})()

export const useTradingStore = create<TradingStore>()(
  safePersistConfig 
    ? persist(
        (set, get) => ({
          // Initial state
          assets: mockAssets,
          tradingPairs: mockTradingPairs,
          currentPair: 'RSA/USDT',
          wallet: null,
          isConnected: false,
          userOrders: [],
          recentTrades: [],
          orderbook: { bids: [], asks: [] },
          transactions: [],
          loading: false,
          error: null,

          // Actions
          setAssets: (assets) => set({ assets }),
          
          setTradingPairs: (pairs) => set({ tradingPairs: pairs }),
          
          setCurrentPair: (pair) => set({ currentPair: pair }),
          
          setWallet: (wallet) => set({ wallet }),
          
          setIsConnected: (connected) => set({ isConnected: connected }),
          
          updateBalance: (asset, balance) => set((state) => ({
            wallet: state.wallet ? {
              ...state.wallet,
              balances: { ...state.wallet.balances, [asset]: balance }
            } : null
          })),
          
          addOrder: (orderData) => {
            const order: Order = {
              ...orderData,
              id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              timestamp: new Date().toISOString(),
              filled: 0,
              status: 'pending'
            }
            set((state) => ({ userOrders: [...state.userOrders, order] }))
          },
          
          updateOrder: (orderId, updates) => set((state) => ({
            userOrders: state.userOrders.map(order =>
              order.id === orderId ? { ...order, ...updates } : order
            )
          })),
          
          cancelOrder: (orderId) => set((state) => ({
            userOrders: state.userOrders.map(order =>
              order.id === orderId ? { ...order, status: 'cancelled' as const } : order
            )
          })),
          
          addTrade: (trade) => set((state) => ({
            recentTrades: [trade, ...state.recentTrades].slice(0, 100) // Keep last 100 trades
          })),
          
          addTransaction: (transaction) => set((state) => ({
            transactions: [transaction, ...state.transactions].slice(0, 500) // Keep last 500 transactions
          })),
          
          updateOrderbook: (pair, orderbook) => {
            const currentPair = get().currentPair
            if (pair === currentPair) {
              set({ orderbook })
            }
          },
          
          setLoading: (loading) => set({ loading }),
          
          setError: (error) => set({ error }),

          // Sync functions
          syncAssetsFromAdmin: async () => {
            try {
              set({ loading: true, error: null })
              
              // Try to fetch from admin API
              const adminUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:8001'
              const response = await fetch(`${adminUrl}/api/dev/admin/assets`)
              
              if (response.ok) {
                const data = await response.json()
                if (data.success && data.data) {
                  // Ensure all assets have required properties
                  const assetsWithDefaults = data.data.map((asset: any) => ({
                    ...asset,
                    syncStatus: asset.syncStatus || 'not_synced',
                    visibilitySettings: asset.visibilitySettings || {
                      wallets: true,
                      contracts: true,
                      trading: true,
                      transactions: true,
                    },
                    syncWithDex: asset.syncWithDex !== undefined ? asset.syncWithDex : true,
                  }))
                  
                  // Filter for assets visible in trading
                  const tradingAssets = assetsWithDefaults.filter((asset: Asset) => 
                    asset.status === 'active' && asset.visibilitySettings.trading
                  )
                  
                  set({ assets: tradingAssets })
                  
                  // Generate trading pairs from available assets
                  const pairs = generateTradingPairs(tradingAssets)
                  set({ tradingPairs: pairs })
                }
              } else {
                throw new Error('Failed to fetch assets from admin')
              }
            } catch (error) {
              console.error('Failed to sync assets from admin:', error)
              // Use fallback mock data
              set({ assets: mockAssets, tradingPairs: mockTradingPairs })
              set({ error: 'Using demo data - Admin API not available' })
            } finally {
              set({ loading: false })
            }
          },

          syncPrices: async () => {
            try {
              const assets = get().assets
              const updatedAssets = await Promise.all(
                assets.map(async (asset) => {
                  try {
                    // RSA token has fixed price of $0.85 USD
                    if (asset.symbol === 'RSA') {
                      return {
                        ...asset,
                        price: 0.85, // Fixed RSA price
                        metadata: {
                          ...asset.metadata,
                          change24h: asset.metadata?.change24h || 2.5,
                        }
                      }
                    }
                    
                    // Try backend price API for other real prices
                    try {
                      const response = await fetch('http://localhost:8001/api/prices')
                      if (response.ok) {
                        const data = await response.json()
                        if (data.success && data.data && data.data.prices) {
                          const prices = data.data.prices
                          
                          // Map asset symbols to backend price data
                          let priceData = null
                          if (asset.symbol === 'BTC' && prices['rBTC']) {
                            priceData = { usd: prices['rBTC'].usd, change_24h: prices['rBTC'].change_24h }
                          } else if (asset.symbol === 'ETH' && prices['rETH']) {
                            priceData = { usd: prices['rETH'].usd, change_24h: prices['rETH'].change_24h }
                          } else if (asset.symbol === 'USDT') {
                            priceData = { usd: 1.0, change_24h: 0.1 }
                          }
                          
                          if (priceData) {
                            return {
                              ...asset,
                              price: priceData.usd,
                              metadata: {
                                ...asset.metadata,
                                change24h: priceData.change_24h || 0,
                              }
                            }
                          }
                        }
                      }
                    } catch (error) {
                      console.error(`Backend price fetch failed for ${asset.symbol}:`, error)
                    }
                    return asset
                  } catch (error) {
                    console.error(`Failed to fetch price for ${asset.symbol}:`, error)
                    return asset
                  }
                })
              )
              
              set({ assets: updatedAssets })
              
              // Update trading pairs with new prices
              const pairs = get().tradingPairs
              const updatedPairs = pairs.map(pair => {
                const baseAsset = updatedAssets.find(a => a.symbol === pair.baseAsset)
                const quoteAsset = updatedAssets.find(a => a.symbol === pair.quoteAsset)
                
                if (baseAsset && quoteAsset) {
                  const price = baseAsset.price / quoteAsset.price
                  return {
                    ...pair,
                    price,
                    change24h: (baseAsset.metadata?.change24h || 0) - (quoteAsset.metadata?.change24h || 0)
                  }
                }
                return pair
              })
              
              set({ tradingPairs: updatedPairs })
            } catch (error) {
              console.error('Failed to sync prices:', error)
            }
          },

          fetchOrderbook: async (pair) => {
            try {
              // Mock orderbook data for demo
              const [baseAsset, quoteAsset] = pair.split('/')
              const currentPrice = get().tradingPairs.find(p => p.symbol === pair)?.price || 100
              
              const mockOrderbook = {
                bids: Array.from({ length: 10 }, (_, i) => ({
                  price: currentPrice * (1 - (i + 1) * 0.001),
                  amount: Math.random() * 100 + 10
                })),
                asks: Array.from({ length: 10 }, (_, i) => ({
                  price: currentPrice * (1 + (i + 1) * 0.001),
                  amount: Math.random() * 100 + 10
                }))
              }
              
              set({ orderbook: mockOrderbook })
            } catch (error) {
              console.error('Failed to fetch orderbook:', error)
            }
          },

          fetchRecentTrades: async (pair) => {
            try {
              // Mock recent trades for demo
              const currentPrice = get().tradingPairs.find(p => p.symbol === pair)?.price || 100
              const mockTrades: Trade[] = Array.from({ length: 20 }, (_, i) => ({
                id: `trade_${Date.now()}_${i}`,
                pair,
                side: Math.random() > 0.5 ? 'buy' : 'sell',
                amount: Math.random() * 10 + 0.1,
                price: currentPrice * (1 + (Math.random() - 0.5) * 0.02),
                timestamp: new Date(Date.now() - i * 60000).toISOString(),
              }))
              
              set({ recentTrades: mockTrades })
            } catch (error) {
              console.error('Failed to fetch recent trades:', error)
            }
          },
        }),
        safePersistConfig
      )
    : (set, get) => ({
        // Same implementation but without persistence
        assets: mockAssets,
        tradingPairs: mockTradingPairs,
        currentPair: 'RSA/USDT',
        wallet: null,
        isConnected: false,
        userOrders: [],
        recentTrades: [],
        orderbook: { bids: [], asks: [] },
        transactions: [],
        loading: false,
        error: null,
        
        setAssets: (assets) => set({ assets }),
        setTradingPairs: (pairs) => set({ tradingPairs: pairs }),
        setCurrentPair: (pair) => set({ currentPair: pair }),
        setWallet: (wallet) => set({ wallet }),
        setIsConnected: (connected) => set({ isConnected: connected }),
        updateBalance: (asset, balance) => set((state) => ({
          wallet: state.wallet ? {
            ...state.wallet,
            balances: { ...state.wallet.balances, [asset]: balance }
          } : null
        })),
        addOrder: (orderData) => {
          const order: Order = {
            ...orderData,
            id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            filled: 0,
            status: 'pending'
          }
          set((state) => ({ userOrders: [...state.userOrders, order] }))
        },
        updateOrder: (orderId, updates) => set((state) => ({
          userOrders: state.userOrders.map(order =>
            order.id === orderId ? { ...order, ...updates } : order
          )
        })),
        cancelOrder: (orderId) => set((state) => ({
          userOrders: state.userOrders.map(order =>
            order.id === orderId ? { ...order, status: 'cancelled' as const } : order
          )
        })),
        addTrade: (trade) => set((state) => ({
          recentTrades: [trade, ...state.recentTrades].slice(0, 100)
        })),
        addTransaction: (transaction) => set((state) => ({
          transactions: [transaction, ...state.transactions].slice(0, 500)
        })),
        updateOrderbook: (pair, orderbook) => {
          const currentPair = get().currentPair
          if (pair === currentPair) {
            set({ orderbook })
          }
        },
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        
        // Same sync functions as above
        syncAssetsFromAdmin: async () => {
          try {
            set({ loading: true, error: null })
            set({ assets: mockAssets, tradingPairs: mockTradingPairs })
            set({ error: 'Demo mode - Admin API sync disabled' })
          } finally {
            set({ loading: false })
          }
        },
        syncPrices: async () => {
          // Mock price updates
        },
        fetchOrderbook: async (pair) => {
          const currentPrice = get().tradingPairs.find(p => p.symbol === pair)?.price || 100
          const mockOrderbook = {
            bids: Array.from({ length: 10 }, (_, i) => ({
              price: currentPrice * (1 - (i + 1) * 0.001),
              amount: Math.random() * 100 + 10
            })),
            asks: Array.from({ length: 10 }, (_, i) => ({
              price: currentPrice * (1 + (i + 1) * 0.001),
              amount: Math.random() * 100 + 10
            }))
          }
          set({ orderbook: mockOrderbook })
        },
        fetchRecentTrades: async (pair) => {
          const currentPrice = get().tradingPairs.find(p => p.symbol === pair)?.price || 100
          const mockTrades: Trade[] = Array.from({ length: 20 }, (_, i) => ({
            id: `trade_${Date.now()}_${i}`,
            pair,
            side: Math.random() > 0.5 ? 'buy' : 'sell',
            amount: Math.random() * 10 + 0.1,
            price: currentPrice * (1 + (Math.random() - 0.5) * 0.02),
            timestamp: new Date(Date.now() - i * 60000).toISOString(),
          }))
          set({ recentTrades: mockTrades })
        },
      })
)

// Helper functions
function generateTradingPairs(assets: Asset[]): TradingPair[] {
  const pairs: TradingPair[] = []
  const baseAssets = ['RSA', 'USDT', 'BTC']
  
  for (const baseSymbol of baseAssets) {
    const baseAsset = assets.find(a => a.symbol === baseSymbol)
    if (!baseAsset) continue
    
    for (const quoteAsset of assets) {
      if (quoteAsset.symbol === baseSymbol) continue
      
      const symbol = `${quoteAsset.symbol}/${baseSymbol}`
      const price = quoteAsset.price / baseAsset.price
      
      pairs.push({
        symbol,
        baseAsset: quoteAsset.symbol,
        quoteAsset: baseSymbol,
        price,
        change24h: (quoteAsset.metadata?.change24h || 0) - (baseAsset.metadata?.change24h || 0),
        volume24h: (quoteAsset.metadata?.volume24h || 0) + (baseAsset.metadata?.volume24h || 0),
        high24h: price * 1.05,
        low24h: price * 0.95,
      })
    }
  }
  
  return pairs
}

function getCoinGeckoId(symbol: string): string | null {
  const mapping: Record<string, string> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'USDT': 'tether',
    'RSA': 'rsa', // RSA not on CoinGecko - will use manual price of $0.85
  }
  
  return mapping[symbol] || null
}