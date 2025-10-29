import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { supabase } from '../config/supabase';

export class AuthController {
  /**
   * Sign up a new user
   * POST /auth/signup
   */
  async signUp(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, full_name, wallet_address } = req.body;

      // Basic validation
      if (!email || !password) {
        res.status(400).json({
          error: 'Email and password are required',
          success: false
        });
        return;
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          error: 'Invalid email format',
          success: false
        });
        return;
      }

      // Password strength validation
      if (password.length < 6) {
        res.status(400).json({
          error: 'Password must be at least 6 characters long',
          success: false
        });
        return;
      }

      const { user, session, error } = await authService.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
            wallet_address
          }
        }
      });

      if (error) {
        res.status(400).json({
          error: error.message,
          success: false
        });
        return;
      }

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        user: {
          id: user?.id,
          email: user?.email,
          email_confirmed_at: user?.email_confirmed_at,
          user_metadata: user?.user_metadata
        },
        session: session ? {
          access_token: session.access_token,
          expires_in: session.expires_in,
          expires_at: session.expires_at,
          token_type: session.token_type
        } : null,
        note: !user?.email_confirmed_at ? 'Please check your email to confirm your account' : undefined
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        error: 'Internal server error',
        success: false
      });
    }
  }

  /**
   * Sign in an existing user
   * POST /auth/signin
   */
  async signIn(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Basic validation
      if (!email || !password) {
        res.status(400).json({
          error: 'Email and password are required',
          success: false
        });
        return;
      }

      const { user, session, error } = await authService.signIn({
        email,
        password
      });

      if (error) {
        res.status(401).json({
          error: error.message,
          success: false
        });
        return;
      }

      if (!user || !session) {
        res.status(401).json({
          error: 'Invalid credentials',
          success: false
        });
        return;
      }

      res.json({
        success: true,
        message: 'Signed in successfully',
        user: {
          id: user.id,
          email: user.email,
          email_confirmed_at: user.email_confirmed_at,
          user_metadata: user.user_metadata,
          last_sign_in_at: user.last_sign_in_at
        },
        session: {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_in: session.expires_in,
          expires_at: session.expires_at,
          token_type: session.token_type
        }
      });
    } catch (error) {
      console.error('Signin error:', error);
      res.status(500).json({
        error: 'Internal server error',
        success: false
      });
    }
  }

  /**
   * Sign out the current user
   * POST /auth/signout
   */
  async signOut(req: Request, res: Response): Promise<void> {
    try {
      const { error } = await authService.signOut();

      if (error) {
        res.status(400).json({
          error: error.message,
          success: false
        });
        return;
      }

      res.json({
        success: true,
        message: 'Signed out successfully'
      });
    } catch (error) {
      console.error('Signout error:', error);
      res.status(500).json({
        error: 'Internal server error',
        success: false
      });
    }
  }

  /**
   * Get current user info
   * GET /auth/me
   */
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      // Extract JWT from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          error: 'Authorization token required',
          success: false
        });
        return;
      }

      const jwt = authHeader.substring(7); // Remove 'Bearer ' prefix

      const { user, error } = await authService.getUser(jwt);

      if (error || !user) {
        res.status(401).json({
          error: error?.message || 'Invalid token',
          success: false
        });
        return;
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          email_confirmed_at: user.email_confirmed_at,
          user_metadata: user.user_metadata,
          created_at: user.created_at,
          updated_at: user.updated_at,
          last_sign_in_at: user.last_sign_in_at
        }
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        error: 'Internal server error',
        success: false
      });
    }
  }

  /**
   * Redirect to Google OAuth for authentication
   * GET /auth/google
   */
  async googleAuth(req: Request, res: Response): Promise<void> {
    try {
      const { url, error } = await authService.getGoogleOAuthUrl();
      console.log('Google OAuth URL:', url);
      if (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
        return;
      }
   
       res.json({
        success: true,
        url
      });
    } catch (error) {
      console.error('Google Auth error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Handle Google OAuth callback
   * GET /auth/google/callback
   */
  async googleAuthCallback(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.query;
       console.log('Received Google OAuth callback with code:', code);
      if (!code) {
        res.status(400).json({
          success: false,
          error: 'Authorization code is required'
        });
        return;
      }

      const { user, session, error } = await authService.handleGoogleCallback(code as string);

      if (error) {
        res.status(400).json({
          success: false,
          error: error.message
        });
        return;
      }

      // Get wallet information for the user
      let walletInfo = null;
      if (user && supabase) {
        try {
          const { data: userData } = await supabase
            .from('users')
            .select('wallet_id, wallet_address, privy_user_id')
            .eq('user_id', user.id)
            .single();
          
          if (userData) {
            walletInfo = {
              wallet_id: userData.wallet_id,
              wallet_address: userData.wallet_address,
              privy_user_id: userData.privy_user_id
            };
          }
        } catch (walletError) {
          console.error('Error fetching wallet info:', walletError);
        }
      }

      res.json({
        success: true,
        message: 'Google OAuth successful',
        user,
        session,
        wallet: walletInfo
      });
    } catch (error) {
      console.error('Google Auth Callback error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Send password reset email (forgot password)
   * POST /auth/forgot-password
   */
  async sendPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ success: false, error: 'Email is required' });
        return;
      }

      const result = await authService.sendPasswordResetEmail(email);
      if (!result.success) {
        res.status(500).json({ success: false, error: result.error || 'Failed to send reset email' });
        return;
      }

      res.json({ success: true, message: 'Password reset email sent' });
    } catch (error) {
      console.error('Send password reset error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * Reset password using reset token
   * POST /auth/reset-password
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      // Allow token in body or in header (x-reset-token) or Authorization: Bearer <token>
       const accessToken = req.headers.authorization?.split(' ')[1];
       const { newPassword } = req.body;

      if (!accessToken || !newPassword) {
        res.status(400).json({ success: false, error: 'accessToken (body or x-reset-token header or Authorization header) and newPassword are required' });
        return;
      }

      const { user, session, error } = await authService.resetPassword(accessToken, newPassword);
      if (error) {
        res.status(400).json({ success: false, error: error.message });
        return;
      }

      res.json({ success: true, message: 'Password reset successful', user, session });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * Refresh session using a refresh token
   * POST /auth/refresh
   */
  async refreshSession(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ success: false, error: 'refreshToken is required' });
        return;
      }

      const { user, session, error } = await authService.refreshSession(refreshToken);

      if (error) {
        res.status(400).json({ success: false, error: error.message });
        return;
      }

      res.json({ success: true, user, session });
    } catch (error) {
      console.error('Refresh session error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}

export const authController = new AuthController();
