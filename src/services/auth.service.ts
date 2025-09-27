import { supabase } from '../config/supabase';
import { AuthError, User, Session } from '@supabase/supabase-js';

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

export interface SignUpData {
  email: string;
  password: string;
  options?: {
    data?: {
      full_name?: string;
      wallet_address?: string;
    };
  };
}

export interface SignInData {
  email: string;
  password: string;
}

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
   * Refresh the current session
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
}

export const authService = new AuthService();
