import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        [key: string]: any;
      };
    }
  }
}

/**
 * Middleware to verify Supabase session access token
 */
export async function verifyAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    if (!supabase) {
      throw new Error('Supabase client is not initialized. Please check your configuration.');
    }

    const { data: userData, error } = await supabase.auth.getUser(token);

    if (error || !userData || !userData.user) {
      res.status(401).json({ success: false, error: 'Invalid or expired token' });
      return;
    }

    // Attach user info to the request object
    req.user = {
      id: userData.user.id,
      email: userData.user.email
    };
    next();
  } catch (err) {
    console.error('Authorization error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
