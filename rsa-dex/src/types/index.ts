// Asset and Trading Types
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

export interface MarketData {
  asset: string
  name: string
  icon: string
  priceRSA: number
  priceUSD: number
  volume24h: number
  change24h: number
  issuer?: string
}

// Wallet Types
export interface WalletBalance {
  asset: string
  balance: number
  locked: number
  available: number
}

export interface WalletInfo {
  address: string
  publicKey: string
  network: string
  provider: string
  balances: WalletBalance[]
}

export interface Wallet {
  address: string
  publicKey: string
  balances: Record<string, number>
  network: string
}

// Trading Types
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

export interface OrderbookEntry {
  price: number
  amount: number
}

export interface Orderbook {
  bids: OrderbookEntry[]
  asks: OrderbookEntry[]
}

// Transaction Types
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

// Chart Types
export interface ChartData {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface PriceData {
  price: number
  change24h: number
  timestamp: number
}

// Network Types
export interface Network {
  name: string
  horizonUrl: string
  networkPassphrase: string
  icon: string
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = any> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// UI Types
export interface TabItem {
  id: string
  label: string
  content: React.ReactNode
}

export interface SelectOption {
  value: string
  label: string
  icon?: string
}

// Form Types
export interface SwapFormData {
  fromAsset: string
  toAsset: string
  fromAmount: number
  toAmount: number
  slippage: number
}

export interface BuyFormData {
  asset: string
  amount: number
  paymentMethod: string
  currency: string
}

export interface OrderFormData {
  pair: string
  side: 'buy' | 'sell'
  type: 'market' | 'limit'
  amount: number
  price?: number
}

// Error Types
export interface DexError {
  code: string
  message: string
  details?: any
}

// Event Types
export type DexEventType = 
  | 'wallet_connected'
  | 'wallet_disconnected'
  | 'order_placed'
  | 'order_filled'
  | 'order_cancelled'
  | 'trade_executed'
  | 'price_updated'
  | 'balance_updated'

export interface DexEvent {
  type: DexEventType
  data: any
  timestamp: number
} 