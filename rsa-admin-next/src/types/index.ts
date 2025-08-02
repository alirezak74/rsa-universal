export interface AdminUser {
  id: string;
  username: string;
  role: 'admin' | 'super_admin';
  createdAt: string;
  lastLogin?: string;
  twoFactorEnabled: boolean;
}

export interface Wallet {
  id: string;
  address: string;
  publicKey: string;
  secretKey?: string; // Only shown once during creation
  status: 'active' | 'frozen' | 'blacklisted' | 'pending';
  balance: number;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    email?: string;
    phone?: string;
    kycTier?: '1' | '2' | '3';
    notes?: string;
  };
}

export interface Transaction {
  id: string;
  hash: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  fee: number;
  gasPrice: number;
  gasLimit: number;
  status: 'pending' | 'approved' | 'rejected' | 'recalled';
  blockNumber?: number;
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
  notes?: string;
  tags?: string[];
  isSpam?: boolean;
}

export interface GasSettings {
  baseGasPrice: number;
  gasLimitMultiplier: number;
  minTransactionFee: number;
  maxTransactionFee: number;
  blockTime: number;
  maxTransactionsPerBlock: number;
  updatedAt: string;
  updatedBy: string;
}

export interface AdminLog {
  id: string;
  action: string;
  userId: string;
  username: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  level: 'info' | 'warn' | 'error' | 'debug';
}

export interface NetworkStats {
  totalWallets: number;
  totalTransactions: number;
  transactionsPerSecond: number;
  averageBlockTime: number;
  activeValidators: number;
  totalValidators: number;
  networkStatus: 'active' | 'maintenance' | 'emergency' | 'critical';
  lastBlockNumber: number;
  lastBlockTime: string;
}

export interface ValidatorNode {
  id: string;
  address: string;
  publicKey: string;
  status: 'active' | 'inactive' | 'slashed';
  uptime: number;
  lastSeen: string;
  totalStake: number;
  commission: number;
  createdAt: string;
}

export interface SmartContract {
  id: string;
  address: string;
  name: string;
  type: 'token' | 'governance' | 'defi' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  creator: string;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  description?: string;
  sourceCode?: string;
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  kycTier: '1' | '2' | '3';
  status: 'active' | 'suspended' | 'banned';
  wallets: string[];
  createdAt: string;
  lastLogin?: string;
  metadata?: Record<string, any>;
}

export interface EmergencyAction {
  id: string;
  type: 'network_pause' | 'validator_revoke' | 'ledger_corruption' | 'maintenance';
  level: 'maintenance' | 'emergency' | 'critical';
  description: string;
  initiatedBy: string;
  initiatedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  status: 'active' | 'resolved';
}

export interface AnalyticsData {
  transactionsPerHour: Array<{ hour: string; count: number }>;
  gasUsagePerDay: Array<{ date: string; average: number }>;
  walletGrowth: Array<{ date: string; count: number }>;
  topWallets: Array<{ address: string; balance: number }>;
  apiUsage: Array<{ endpoint: string; calls: number }>;
}

export interface LoginRequest {
  username: string;
  password: string;
  twoFactorCode?: string;
}

export interface LoginResponse {
  token: string;
  user: AdminUser;
  expiresIn: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const WALLET_STATUS = {
  ACTIVE: 'active',
  FROZEN: 'frozen',
  BLACKLISTED: 'blacklisted',
  PENDING: 'pending',
} as const;

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  RECALLED: 'recalled',
} as const; 