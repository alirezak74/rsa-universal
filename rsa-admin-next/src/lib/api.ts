import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { CONFIG, API_ENDPOINTS } from '@/config/settings';
import { ApiResponse, PaginatedResponse } from '@/types';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: CONFIG.RSA_DEX_URL, // Use RSA DEX backend URL
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Initialize token from localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('admin_token');
    }

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          this.clearToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('admin_token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('admin_token');
    }
    return this.token;
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('admin_token');
  }

  async get<T>(endpoint: string, params?: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.get(endpoint, { params });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.post(endpoint, data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.put(endpoint, data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.delete(endpoint);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  }

  // Auth endpoints (RSA DEX backend)
  async login(username: string, password: string, twoFactorCode?: string) {
    return this.post(API_ENDPOINTS.LOGIN, { username, password, twoFactorCode });
  }

  async logout() {
    const result = await this.post(API_ENDPOINTS.LOGOUT);
    this.clearToken();
    return result;
  }

  async verifyToken() {
    return this.get(API_ENDPOINTS.VERIFY);
  }

  // Market data (RSA DEX backend)
  async getMarkets() {
    return this.get(API_ENDPOINTS.MARKETS);
  }

  async getTicker(pair: string) {
    const endpoint = API_ENDPOINTS.TICKER.replace(':pair', pair);
    return this.get(endpoint);
  }

  async getOrderBook(pair: string) {
    const endpoint = API_ENDPOINTS.ORDERBOOK.replace(':pair', pair);
    return this.get(endpoint);
  }

  async getTrades(pair: string) {
    // Convert pair format from 'RSA/USDT' to separate base and quote parameters
    const [base, quote] = pair.split('/');
    const endpoint = `/api/markets/${base}/${quote}/trades`;
    return this.get(endpoint);
  }

  // Orders (RSA DEX backend)
  async getOrders(page = 1, limit = 20, status?: string) {
    const params = { page, limit, ...(status && { status }) };
    return this.get<PaginatedResponse<any>>(API_ENDPOINTS.ORDERS, params);
  }

  async getOrder(orderId: string) {
    const endpoint = API_ENDPOINTS.ORDER_DETAIL.replace(':orderId', orderId);
    return this.get(endpoint);
  }

  async cancelOrder(orderId: string) {
    const endpoint = API_ENDPOINTS.ORDER_DETAIL.replace(':orderId', orderId);
    return this.delete(endpoint);
  }

  // Wallet (RSA DEX backend)
  async getWalletBalance() {
    return this.get(API_ENDPOINTS.WALLET_BALANCE);
  }

  async transferAssets(toAddress: string, amount: number, asset: string) {
    return this.post(API_ENDPOINTS.WALLET_TRANSFER, { toAddress, amount, asset });
  }

  // Admin-specific endpoints (to be implemented in RSA DEX backend)
  // For now, these will return mock data or error responses
  async getGasSettings() {
    return this.get(API_ENDPOINTS.GAS_SETTINGS);
  }

  async updateGasSettings(settings: any) {
    return this.put(API_ENDPOINTS.GAS_SETTINGS, settings);
  }

  async getWallets(page = 1, limit = 20, status?: string) {
    const params = { page, limit, ...(status && { status }) };
    return this.get<PaginatedResponse<any>>(API_ENDPOINTS.WALLETS, params);
  }

  async createWallet(metadata?: any) {
    return this.post(API_ENDPOINTS.WALLETS, { metadata });
  }

  async updateWalletStatus(walletId: string, status: string) {
    return this.put(`${API_ENDPOINTS.WALLETS}/${walletId}/status`, { status });
  }

  async fundWallet(walletId: string, amount: number) {
    return this.post(`${API_ENDPOINTS.WALLETS}/${walletId}/fund`, { amount });
  }

  async getTransactions(page = 1, limit = 20, status?: string) {
    const params = { page, limit, ...(status && { status }) };
    return this.get<PaginatedResponse<any>>(API_ENDPOINTS.TRANSACTIONS, params);
  }

  async approveTransaction(transactionId: string) {
    return this.post(`${API_ENDPOINTS.TRANSACTIONS}/${transactionId}/approve`);
  }

  async rejectTransaction(transactionId: string, reason?: string) {
    return this.post(`${API_ENDPOINTS.TRANSACTIONS}/${transactionId}/reject`, { reason });
  }

  async recallTransaction(transactionId: string, reason: string) {
    return this.post(`${API_ENDPOINTS.TX_RECALL}`, { transactionId, reason });
  }

  async freezeTransaction(transactionId: string) {
    return this.post(`${API_ENDPOINTS.TRANSACTIONS}/${transactionId}/freeze`);
  }

  async getDatabaseInfo() {
    return this.get(API_ENDPOINTS.DB_TOOLS);
  }

  async addContractBalance(contractId: string, amount: number, asset: string) {
    return this.post(`${API_ENDPOINTS.CONTRACTS}/${contractId}/balance/add`, { amount, asset });
  }

  async reduceContractBalance(contractId: string, amount: number, asset: string) {
    return this.post(`${API_ENDPOINTS.CONTRACTS}/${contractId}/balance/reduce`, { amount, asset });
  }

  async transferFromContract(contractId: string, toAddress: string, amount: number, asset: string) {
    return this.post(`${API_ENDPOINTS.CONTRACTS}/${contractId}/transfer`, { toAddress, amount, asset });
  }

  async getLogs(page = 1, limit = 50, level?: string, action?: string) {
    const params = { page, limit, ...(level && { level }), ...(action && { action }) };
    return this.get<PaginatedResponse<any>>(API_ENDPOINTS.LOGS, params);
  }

  async exportLogs(format: 'csv' | 'json' = 'csv') {
    return this.get(`${API_ENDPOINTS.LOGS}/export`, { format });
  }

  async getAnalytics() {
    return this.get(API_ENDPOINTS.ANALYTICS);
  }

  async getEmergencyStatus() {
    return this.get(API_ENDPOINTS.EMERGENCY);
  }

  async triggerEmergencyAction(type: string, level: string, description: string) {
    return this.post(API_ENDPOINTS.EMERGENCY, { type, level, description });
  }

  async executeEmergencyAction(actionId: string) {
    return this.post(`${API_ENDPOINTS.EMERGENCY}/action`, { actionId });
  }

  async resolveEmergency(emergencyId: string) {
    return this.put(`${API_ENDPOINTS.EMERGENCY}/${emergencyId}/resolve`);
  }

  async getUsers(page = 1, limit = 20) {
    return this.get<PaginatedResponse<any>>(API_ENDPOINTS.USERS, { page, limit });
  }

  async updateUserStatus(userId: string, status: string) {
    return this.put(`${API_ENDPOINTS.USERS}/${userId}/status`, { status });
  }

  async getNodes() {
    return this.get(API_ENDPOINTS.NODES);
  }

  async revokeValidator(nodeId: string, reason: string) {
    return this.post(`${API_ENDPOINTS.NODES}/${nodeId}/revoke`, { reason });
  }

  async getContracts(page = 1, limit = 20, status?: string) {
    const params = { page, limit, ...(status && { status }) };
    return this.get<PaginatedResponse<any>>(API_ENDPOINTS.CONTRACTS, params);
  }

  async approveContract(contractId: string) {
    return this.post(`${API_ENDPOINTS.CONTRACTS}/${contractId}/approve`);
  }

  async rejectContract(contractId: string, reason: string) {
    return this.post(`${API_ENDPOINTS.CONTRACTS}/${contractId}/reject`, { reason });
  }

  async getAssets(page = 1, limit = 20, status?: string) {
    const params = { page, limit, ...(status && { status }) };
    return this.get<PaginatedResponse<any>>('/api/admin/assets', params);
  }

  async createAsset(assetData: any) {
    return this.post('/api/admin/assets', assetData);
  }

  async updateAsset(assetId: string, assetData: any) {
    return this.put(`/api/admin/assets/${assetId}`, assetData);
  }

  async deleteAsset(assetId: string) {
    return this.delete(`/api/admin/assets/${assetId}`);
  }

  async toggleAssetStatus(assetId: string) {
    return this.post(`/api/admin/assets/${assetId}/toggle-status`);
  }

  async syncAssetToDex(assetId: string) {
    return this.post(`/api/admin/assets/${assetId}/sync`);
  }

  async syncAllAssetsToDex() {
    return this.post('/api/admin/assets/sync-all');
  }

  // Health check
  async healthCheck() {
    return this.get(API_ENDPOINTS.HEALTH);
  }
}

export const apiClient = new ApiClient(); 