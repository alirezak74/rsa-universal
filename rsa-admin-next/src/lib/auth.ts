import { CONFIG } from '@/config/settings';
import { AdminUser, LoginRequest, LoginResponse } from '@/types';
import { apiClient } from './api';

export class AuthService {
  private static instance: AuthService;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async validateCredentials(username: string, password: string): Promise<boolean> {
    // For admin panel, we'll use the RSA DEX backend authentication
    // but also support local admin credentials as fallback
    const isValidUsername = username === CONFIG.ADMIN_USERNAME;
    const isValidPassword = password === CONFIG.ADMIN_PASSWORD;
    return isValidUsername && isValidPassword;
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      // First try to authenticate with RSA DEX backend
      const response = await apiClient.login(credentials.username, credentials.password, credentials.twoFactorCode);
      
      if (response.success) {
        // If DEX backend authentication succeeds, use that
        const data = response.data as { token: string; user: any; expiresIn?: number };
        return {
          token: data.token,
          user: data.user,
          expiresIn: data.expiresIn || 24 * 60 * 60,
        };
      } else {
        // Fallback to local admin authentication
        const isValid = await this.validateCredentials(credentials.username, credentials.password);
        
        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        const user: AdminUser = {
          id: '1',
          username: credentials.username,
          role: 'super_admin',
          createdAt: new Date().toISOString(),
          twoFactorEnabled: false,
        };

        // Generate a local token for admin access
        const token = this.generateLocalToken(user);
        
        return {
          token,
          user,
          expiresIn: 24 * 60 * 60, // 24 hours
        };
      }
    } catch (error: any) {
      throw new Error(error.message || 'Authentication failed');
    }
  }

  private generateLocalToken(user: AdminUser): string {
    // Simple token generation for local admin access
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    };

    // For local tokens, we'll use a simple base64 encoding
    // In production, you should use proper JWT signing
    return btoa(JSON.stringify(payload));
  }

  verifyToken(token: string): any {
    try {
      // Try to decode the token
      const payload = JSON.parse(atob(token));
      
      // Check if token is expired
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired');
      }
      
      return payload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async logout(token: string): Promise<void> {
    try {
      // Try to logout from DEX backend
      await apiClient.logout();
    } catch (error) {
      // Ignore errors for local tokens
      console.log('Local logout - clearing token');
    }
  }

  isAuthenticated(token: string): boolean {
    try {
      this.verifyToken(token);
      return true;
    } catch {
      return false;
    }
  }

  requireReAuth(action: string): boolean {
    const criticalActions = [
      'update_gas_settings',
      'freeze_wallet',
      'blacklist_wallet',
      'emergency_pause',
      'recall_transaction',
      'revoke_validator',
    ];
    
    return criticalActions.includes(action);
  }
}

export const authService = AuthService.getInstance(); 