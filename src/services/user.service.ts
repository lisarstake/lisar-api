import { authService } from './auth.service';
import { privyService } from '../integrations/privy/privy.service';
import { Request, Response, NextFunction } from 'express';
import { verifySupabaseJWT } from '../middleware/verifySupabaseJWT';
import { supabase } from '../config/supabase';
import { UserWithWallet } from '../types/user.types';

export class UserService {
  /**
   * Create a complete user setup: Supabase auth + Privy user + Wallet
   */
  async createUserWithWallet(email: string, password: string, userData?: {
    full_name?: string;
  }): Promise<UserWithWallet> {
    try {
      // Ensure Supabase client is initialized
      if (!supabase) {
        throw new Error('Supabase client is not initialized. Please check your configuration.');
      }

      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();

      if (existingUser) {
        throw new Error('Email already exists. Please use a different email address or sign in.');
      }

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

      // Ensure Supabase client is initialized
      if (!supabase) {
        throw new Error('Supabase client is not initialized. Please check your configuration.');
      }

      // Step 2: Create corresponding user in Privy with wallet
      const { user: privyUser, wallet } = await privyService.createUserWithWallet(supabaseUser.id);

      // Step 3: Insert user data into Supabase database
      const { error: dbError } = await supabase.from('users').insert({
        user_id: supabaseUser.id,
        email: supabaseUser.email,
        privy_user_id: privyUser.id,
        wallet_id: wallet?.id,
        wallet_address: wallet?.address,
        chain_type: wallet?.chain_type,
        full_name: userData?.full_name,
        img: null, // Placeholder for image
        DOB: null, // Placeholder for DOB
        country: null, // Placeholder for country
        state: null, // Placeholder for state
        fiat_type: null, // Placeholder for fiat type
        fiat_balance: 0,
        lpt_balance: 0,
        created_date: new Date().toISOString() // Add created_date field
      });

      if (dbError) {
        throw new Error(`Failed to insert user into database: ${dbError.message}`);
      }

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

  /**
   * Get user profile from Supabase
   */
  async getUserProfile(userId: string): Promise<any> {
    try {
      // Ensure Supabase client is initialized
      if (!supabase) {
        throw new Error('Supabase client is not initialized. Please check your configuration.');
      }

      // Fetch user profile from the 'users' table
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch user profile: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  /**
   * Get all users with wallet addresses from Supabase
   */
  async getAllUsersWithWallets(): Promise<Array<{ user_id: string; wallet_address: string; email: string; full_name?: string }>> {
    try {
      // Ensure Supabase client is initialized
      if (!supabase) {
        throw new Error('Supabase client is not initialized. Please check your configuration.');
      }

      // Fetch all users with wallet addresses
      const { data, error } = await supabase
        .from('users')
        .select('user_id, wallet_address, email, full_name')
        .not('wallet_address', 'is', null)
        .not('wallet_address', 'eq', '');

      if (error) {
        throw new Error(`Failed to fetch users: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching all users with wallets:', error);
      throw error;
    }
  }

  /**
   * Update user profile in Supabase
   */
  async updateUserProfile(userId: string, updates: Partial<{
    full_name: string;
    img: string;
    DOB: string;
    country: string;
    state: string;
    fiat_type: string;
    fiat_balance: number;
    lpt_balance: number;
  }>): Promise<any> {
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized. Please check your configuration.');
      }

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to update user profile: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
