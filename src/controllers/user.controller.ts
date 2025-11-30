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
          session: userWithWallet.session, // Include session in the response
          note: !userWithWallet.supabaseUser.email_confirmed_at 
            ? 'Please check your email to confirm your account' 
            : undefined
        }
      });
    } catch (error) {
      console.error('Create user with wallet error:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('Email already exists')) {
          res.status(409).json({
            success: false,
            error: error.message
          });
          return;
        }

        if (error.message.includes('User already registered')) {
          res.status(409).json({
            success: false,
            error: 'User already exists with this email'
          });
          return;
        }
        
        if (error.message.includes('Supabase user')) {
          res.status(400).json({
            success: false,
            error: 'Failed to create user account'
          });
          return;
        }
        
        if (error.message.includes('Privy')) {
          res.status(500).json({
            success: false,
            error: 'Failed to create wallet. User account created but wallet creation failed.'
          });
          return;
        }
      }
      
      res.status(500).json({
        success: false,
        error: 'Internal server error'
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

  /**
   * Get user profile
   * GET /users/profile/:userId
   */
  async getUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
        return;
      }

      const userProfile = await userService.getUserProfile(userId);

      res.status(200).json({
        success: true,
        data: userProfile
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Update user profile
   * PATCH /users/profile/:userId
   */
  async updateUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const updates = req.body;
      console.log('Updating user profile for userId:', userId, 'with updates:', updates);
      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
        return;
      }

      const updatedProfile = await userService.updateUserProfile(userId, updates);

      res.status(200).json({
        success: true,
        message: 'User profile updated successfully',
        data: updatedProfile
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Update user onboarding status
   * PATCH /users/profile/:userId/onboard
   */
  async updateUserOnboardStatus(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { is_onboarded } = req.body;

      if (!userId) {
        res.status(400).json({ success: false, error: 'User ID is required' });
        return;
      }

      if (typeof is_onboarded !== 'boolean') {
        res.status(400).json({ success: false, error: 'is_onboarded must be a boolean' });
        return;
      }

      const updated = await userService.updateUserProfile(userId, { is_onboarded });

      res.status(200).json({ success: true, message: 'Onboard status updated', data: updated });
    } catch (error) {
      console.error('Error updating onboard status:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}

export const userController = new UserController();
