import { authService } from './auth.service';
import { privyService } from '../integrations/privy/privy.service';
import { Request, Response, NextFunction } from 'express';
import { verifySupabaseJWT } from '../middleware/verifySupabaseJWT';

export interface UserWithWallet {
  supabaseUser: {
    id: string;
    email: string;
    email_confirmed_at: string | null;
    user_metadata: any;
  };
  privyUser: {
    id: string;
    custom_user_id: string;
  };
  wallet?: {
    id: string;
    address: string;
    chain_type: string;
  };
  session?: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    expires_at: number;
    token_type: string;
  } | null;
}

export class UserService {
  /**
   * Create a complete user setup: Supabase auth + Privy user + Wallet
   */
  async createUserWithWallet(email: string, password: string, userData?: {
    full_name?: string;
  }): Promise<UserWithWallet> {
    try {
      // Step 1: Create user in Supabase
      const { user: supabaseUser, session, error } = await authService.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      console.log( 'Session:', session, 'Error:', error);

      if (error || !supabaseUser) {
        throw new Error(`Failed to create Supabase user: ${error?.message}`);
      }

      // Step 2: Create corresponding user in Privy with wallet
      const { user: privyUser, wallet } = await privyService.createUserWithWallet(supabaseUser.id);

      return {
        supabaseUser: {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          email_confirmed_at: supabaseUser.email_confirmed_at || null,
          user_metadata: supabaseUser.user_metadata
        },
        privyUser: {
          id: privyUser.id,
          custom_user_id: supabaseUser.id
        },
        wallet: wallet ? {
          id: wallet.id,
          address: wallet.address,
          chain_type: wallet.chain_type
        } : undefined,
        session: session ? {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_in: session.expires_in,
          expires_at: session.expires_at || 0, // Default to 0 if undefined
          token_type: session.token_type
        } : null
      };
    } catch (error) {
      console.error('Error creating user with wallet:', error);
      throw error;
    }
  }

  /**
   * Get user's wallet information
   */
  async getUserWallet(supabaseUserId: string): Promise<{
    privyUserId: string;
    wallets: Array<{
      id: string;
      address: string;
      chain_type: string;
    }>;
  } | null> {
    try {
      
      
      throw new Error('getUserWallet needs database integration to map Supabase user to Privy user');
    } catch (error) {
      console.error('Error getting user wallet:', error);
      throw error;
    }
  }

  /**
   * Create additional wallet for existing user
   */
  async createAdditionalWallet(supabaseUserId: string, chainType: 'ethereum' | 'solana' | 'bitcoin'): Promise<{
    id: string;
    address: string;
    chain_type: string;
  }> {
    try {
      // This would also require database lookup to get Privy user ID
      throw new Error('createAdditionalWallet needs database integration to map Supabase user to Privy user');
    } catch (error) {
      console.error('Error creating additional wallet:', error);
      throw error;
    }
  }

  /**
   * Test Privy integration
   */
  async testPrivyConnection(): Promise<{ connected: boolean; message: string }> {
    return await privyService.testConnection();
  }
}

export const userService = new UserService();
