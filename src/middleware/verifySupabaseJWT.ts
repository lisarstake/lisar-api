import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string; // Adjusted to optional to match Supabase User type
        [key: string]: any;
      };
    }
  }
}

/**
 * Middleware to verify Supabase JWT from client
 */
export async function verifySupabaseJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Use Supabase’s auth.getUser method to verify the token
    const { user, error } = await authService.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Attach user info to the request object
    req.user = user;
    return next();
  } catch (err) {
    console.error('Error verifying Supabase JWT:', err);
    return res.status(500).json({ error: 'Failed to verify token' });
  }
}
