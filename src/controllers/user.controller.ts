import { Request, Response } from 'express';
import { userService } from '../services/user.service';

export class UserController {
  /**
   * Create a new user with wallet
   * POST /users/create-with-wallet
   */
  async createUserWithWallet(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, full_name } = req.body;

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

      const userWithWallet = await userService.createUserWithWallet(email, password, {
        full_name
      });

      res.status(201).json({
        success: true,
        message: 'User created with wallet successfully',
        data: {
          user: userWithWallet.supabaseUser,
          privy_user_id: userWithWallet.privyUser.id,
          wallet: userWithWallet.wallet,
          note: !userWithWallet.supabaseUser.email_confirmed_at 
            ? 'Please check your email to confirm your account' 
            : undefined
        }
      });
    } catch (error) {
      console.error('Create user with wallet error:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('User already registered')) {
          res.status(409).json({
            error: 'User already exists with this email',
            success: false
          });
          return;
        }
        
        if (error.message.includes('Supabase user')) {
          res.status(400).json({
            error: 'Failed to create user account',
            success: false
          });
          return;
        }
        
        if (error.message.includes('Privy')) {
          res.status(500).json({
            error: 'Failed to create wallet. User account created but wallet creation failed.',
            success: false
          });
          return;
        }
      }
      
      res.status(500).json({
        error: 'Internal server error',
        success: false
      });
    }
  }

  /**
   * Test Privy connection
   * GET /users/test-privy
   */
  async testPrivyConnection(req: Request, res: Response): Promise<void> {
    try {
      const result = await userService.testPrivyConnection();
      
      const statusCode = result.connected ? 200 : 503;
      res.status(statusCode).json({
        success: result.connected,
        message: result.message,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Test Privy connection error:', error);
      res.status(500).json({
        error: 'Internal server error',
        success: false
      });
    }
  }
}

export const userController = new UserController();
