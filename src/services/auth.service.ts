import { supabase } from '../config/supabase';
import { AuthResponse, SignUpData, SignInData } from '../types/auth.types';
import { AuthError, User, Session } from '@supabase/supabase-js';
import { privyService } from '../integrations/privy/privy.service';

export class AuthService {
  /**
   * Sign up a new user with email and password
   */
  async signUp(signUpData: SignUpData): Promise<AuthResponse> {
    if (!supabase) {
      return {
        user: null,
        session: null,
        error: new AuthError('Supabase client not initialized') as AuthError
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: signUpData.options
      });

      return {
        user: data.user,
        session: data.session,
        error: error as AuthError | null
      };
    } catch (err) {
      return {
        user: null,
        session: null,
        error: new AuthError(err instanceof Error ? err.message : 'Unknown error') as AuthError
      };
    }
  }

  /**
   * Sign in an existing user with email and password
   */
  async signIn(signInData: SignInData): Promise<AuthResponse> {
    if (!supabase) {
      return {
        user: null,
        session: null,
        error: new AuthError('Supabase client not initialized') as AuthError
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInData.email,
        password: signInData.password
      });

      return {
        user: data.user,
        session: data.session,
        error: error as AuthError | null
      };
    } catch (err) {
      return {
        user: null,
        session: null,
        error: new AuthError(err instanceof Error ? err.message : 'Unknown error') as AuthError
      };
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<{ error: AuthError | null }> {
    if (!supabase) {
      return {
        error: new AuthError('Supabase client not initialized') as AuthError
      };
    }

    try {
      const { error } = await supabase.auth.signOut();
      return { error: error as AuthError | null };
    } catch (err) {
      return {
        error: new AuthError(err instanceof Error ? err.message : 'Unknown error') as AuthError
      };
    }
  }

  /**
   * Get user from JWT token
   */
  async getUser(jwt: string): Promise<{ user: User | null; error: AuthError | null }> {
    if (!supabase) {
      return {
        user: null,
        error: new AuthError('Supabase client not initialized') as AuthError
      };
    }

    try {
      const { data, error } = await supabase.auth.getUser(jwt);
      return {
        user: data.user,
        error: error as AuthError | null
      };
    } catch (err) {
      return {
        user: null,
        error: new AuthError(err instanceof Error ? err.message : 'Unknown error') as AuthError
      };
    }
  }

  /**
   * Refresh the current session using a refresh token
   */
  async refreshSession(refreshToken: string): Promise<AuthResponse> {
    if (!supabase) {
      return {
        user: null,
        session: null,
        error: new AuthError('Supabase client not initialized') as AuthError
      };
    }

    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken
      });

      return {
        user: null,
        session: data.session,
        error: error as AuthError | null
      };
    } catch (err) {
      return {
        user: null,
        session: null,
        error: new AuthError(err instanceof Error ? err.message : 'Failed to refresh session') as AuthError
      };
    }
  }

  /**
   * Get Google OAuth URL
   */
  async getGoogleOAuthUrl(): Promise<{ url: string | null; error: AuthError | null }> {
    if (!supabase) {
      return {
        url: null,
        error: new AuthError('Supabase client not initialized') as AuthError
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: process.env.GOOGLE_REDIRECT_URI
        }
      });
        console.log('Google OAuth URL data:', data);
        console.log('Google OAuth URL error:', error);
      return {
        url: data.url || null,
        error: error as AuthError | null
      };
    } catch (err) {
      return {
        url: null,
        error: new AuthError(err instanceof Error ? err.message : 'Unknown error') as AuthError
      };
    }
  }

  /**
   * Handle Google OAuth callback
   */
  async handleGoogleCallback(code: string): Promise<AuthResponse> {
    if (!supabase) {
      return {
        user: null,
        session: null,
        error: new AuthError('Supabase client not initialized') as AuthError
      };
    }

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      console.log('Google OAuth callback data:', error);
      
      if (error || !data.user || !data.session) {
        return {
          user: data.user,
          session: data.session,
          error: error as AuthError | null
        };
      }

      // Check if this is a new user by looking for existing database record
      const { data: existingUser } = await supabase
        .from('users')
        .select('user_id, privy_user_id, wallet_id')
        .eq('user_id', data.user.id)
        .maybeSingle();

      // If user doesn't exist in our database, create Privy wallet
      if (!existingUser) {
        try {
          console.log('New Google OAuth user detected, creating Privy wallet...');
          
          // Create user and wallet in Privy
          const { user: privyUser, wallet } = await privyService.createUserWithWallet(data.user.id);
          
          // Insert user data into our database
          const { error: dbError } = await supabase.from('users').insert({
            user_id: data.user.id,
            email: data.user.email,
            privy_user_id: privyUser.id,
            wallet_id: wallet?.id,
            wallet_address: wallet?.address,
            chain_type: wallet?.chain_type,
            full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
            img: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture,
            DOB: null,
            country: null,
            state: null,
            fiat_type: null,
            fiat_balance: 0,
            lpt_balance: 0,
            created_date: new Date().toISOString()
          });

          if (dbError) {
            console.error('Failed to insert user into database:', dbError);
            // Don't fail the auth process, but log the error
          } else {
            console.log('Successfully created Privy wallet for Google OAuth user');
          }
        } catch (privyError) {
          console.error('Failed to create Privy wallet for Google OAuth user:', privyError);
          // Don't fail the auth process, but log the error
        }
      }

      return {
        user: data.user,
        session: data.session,
        error: error as AuthError | null
      };
    } catch (err) {
      return {
        user: null,
        session: null,
        error: new AuthError(err instanceof Error ? err.message : 'Unknown error') as AuthError
      };
    }
  }

  /**
   * Send a password reset email to a user (forgot password)
   */
  async sendPasswordResetEmail(email: string): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!supabase) {
      return { success: false, error: 'Supabase client not initialized' };
    }

    try {
      const redirectTo = process.env.PASSWORD_RESET_REDIRECT_URI || undefined;
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

      if (error) {
        console.error('Error sending password reset email:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (err: any) {
      console.error('Exception in sendPasswordResetEmail:', err);
      return { success: false, error: err?.message || 'Failed to send password reset email' };
    }
  }

  /**
   * Reset password using an access token (token from reset link)
   * The accessToken is typically provided in the password reset link query params.
   */
  async resetPassword(accessToken: string, newPassword: string): Promise<AuthResponse> {
    if (!supabase) {
      return {
        user: null,
        session: null,
        error: new AuthError('Supabase client not initialized') as AuthError
      };
    }
  
    try {
      // NOTE: some @supabase/supabase-js typings may not include accessToken in the options type here.
      // Cast to any to allow passing the reset access token obtained from the password reset link.
      const { data, error } = await supabase.auth.updateUser(
        { password: newPassword },
      );
       console.log('Reset password response data:', data);
       console.log('Reset password response error:', error);
      return {
        user: data.user ?? null,
        session: (data as any).session ?? null,
        error: error as AuthError | null
      };
    } catch (err: any) {
      return {
        user: null,
        session: null,
        error: new AuthError(err instanceof Error ? err.message : 'Unknown error') as AuthError
      };
    }
  }
}

export const authService = new AuthService();
