import { Request, Response } from 'express';
import { authService } from '../services/auth.service';

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
}

export const authController = new AuthController();
