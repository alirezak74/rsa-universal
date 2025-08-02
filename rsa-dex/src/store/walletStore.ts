import { create } from 'zustand'

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

interface WalletStore {
  // State
  publicKey: string | null
  wallet: WalletInfo | null
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  
  // Actions
  setPublicKey: (publicKey: string | null) => void
  setWallet: (wallet: WalletInfo | null) => void
  setIsConnected: (connected: boolean) => void
  setIsConnecting: (connecting: boolean) => void
  setError: (error: string | null) => void
  disconnect: () => void
  
  // Wallet operations
  connectWallet: (provider: string) => Promise<boolean>
  refreshBalances: () => Promise<void>
  getBalance: (asset: string) => number
  updateBalance: (asset: string, balance: number) => void
  
  // Helper methods
  generateSeedPhrase: () => string
  generateAddressFromSeed: (seedPhrase: string, prefix: string) => string
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  // Initial state
  publicKey: null,
  wallet: null,
  isConnected: false,
  isConnecting: false,
  error: null,

  // Actions
  setPublicKey: (publicKey) => set({ publicKey }),
  setWallet: (wallet) => set({ wallet }),
  setIsConnected: (connected) => set({ isConnected: connected }),
  setIsConnecting: (connecting) => set({ isConnecting: connecting }),
  setError: (error) => set({ error }),
  
  disconnect: () => {
    set({
      publicKey: null,
      wallet: null,
      isConnected: false,
      isConnecting: false,
      error: null,
    })
  },

  // Helper methods
  generateSeedPhrase: () => {
    const words = [
      'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
      'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
      'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual'
    ]
    
    const seedPhrase = []
    for (let i = 0; i < 12; i++) {
      const randomIndex = Math.floor(Math.random() * words.length)
      seedPhrase.push(words[randomIndex])
    }
    
    return seedPhrase.join(' ')
  },

  generateAddressFromSeed: (seedPhrase: string, prefix: string) => {
    let hash = 0
    for (let i = 0; i < seedPhrase.length; i++) {
      const char = seedPhrase.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    
    const addressSuffix = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0')
    return `${prefix}${addressSuffix}${'x'.repeat(Math.max(0, 32 - prefix.length - 8))}`
  },

  // Wallet operations
  connectWallet: async (provider: string) => {
    try {
      set({ isConnecting: true, error: null })
      
      const generateSeedPhrase = get().generateSeedPhrase
      const generateAddressFromSeed = get().generateAddressFromSeed
      
      let walletInfo: WalletInfo | null = null
      
      switch (provider) {
        case 'RSA Chain':
          const rsaSeedPhrase = generateSeedPhrase()
          const rsaAddress = generateAddressFromSeed(rsaSeedPhrase, 'RSA')
          walletInfo = {
            address: rsaAddress,
            publicKey: `RSA${rsaAddress.slice(3)}PUB`,
            network: 'RSA_CHAIN',
            provider: 'RSA Chain',
            balances: [
              {
                asset: 'RSA',
                balance: 1000.50,
                locked: 50.25,
                available: 950.25,
              },
              {
                asset: 'rBTC',
                balance: 0.5,
                locked: 0.1,
                available: 0.4,
              },
              {
                asset: 'rETH',
                balance: 10.25,
                locked: 2.5,
                available: 7.75,
              },
            ],
          }
          break

        case 'Stronger Network':
          const strongerSeedPhrase = generateSeedPhrase()
          const strongerAddress = generateAddressFromSeed(strongerSeedPhrase, 'STR')
          walletInfo = {
            address: strongerAddress,
            publicKey: `STR${strongerAddress.slice(3)}PUB`,
            network: 'STRONGER_NETWORK',
            provider: 'Stronger Network',
            balances: [
              {
                asset: 'STR',
                balance: 2500.75,
                locked: 100.00,
                available: 2400.75,
              },
              {
                asset: 'rBTC',
                balance: 1.25,
                locked: 0.25,
                available: 1.00,
              },
              {
                asset: 'rETH',
                balance: 25.50,
                locked: 5.50,
                available: 20.00,
              },
            ],
          }
          break

        default:
          walletInfo = {
            address: 'DEMOADDR123...XYZ789',
            publicKey: 'DEMOPUB123...XYZ789',
            network: 'DEMO',
            provider: provider,
            balances: [
              { asset: 'RSA', balance: 1000, locked: 0, available: 1000 },
              { asset: 'ETH', balance: 5, locked: 0, available: 5 },
              { asset: 'BTC', balance: 0.25, locked: 0, available: 0.25 },
              { asset: 'USDT', balance: 2500, locked: 0, available: 2500 },
            ],
          }
      }
      
      if (walletInfo) {
        set({
          publicKey: walletInfo.publicKey,
          wallet: walletInfo,
          isConnected: true,
          isConnecting: false,
          error: null,
        })
        return true
      }
      
      return false
    } catch (error: any) {
      console.error('Failed to connect wallet:', error)
      set({
        error: error.message || 'Failed to connect wallet',
        isConnecting: false,
      })
      return false
    }
  },

  refreshBalances: async () => {
    // Mock refresh in demo mode
  },

  getBalance: (asset: string) => {
    const wallet = get().wallet
    if (!wallet) return 0
    
    const balance = wallet.balances.find(b => b.asset === asset)
    return balance ? balance.available : 0
  },

  updateBalance: (asset: string, balance: number) => {
    const wallet = get().wallet
    if (!wallet) return
    
    const updatedBalances = wallet.balances.map(b =>
      b.asset === asset
        ? { ...b, balance, available: balance - b.locked }
        : b
    )
    
    set({
      wallet: {
        ...wallet,
        balances: updatedBalances,
      }
    })
  },
}))