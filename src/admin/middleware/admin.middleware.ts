import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../config/supabase';
import jwt from 'jsonwebtoken';

export interface AdminRequest extends Request {
  admin?: {
    id: string;
    email: string;
    role: 'super_admin' | 'admin' | 'moderator';
    is_active?: boolean; // Allow optional is_active field
  };
}

/**
 * Admin authentication middleware
 * Verifies admin token and attaches admin info to request
 * @swagger
 * components:
 *   securitySchemes:
 *     adminAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Use the JWT token obtained from the admin login endpoint.
 */
export const adminAuth = async (req: AdminRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Admin token required. Use Bearer token format.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];


    // Verify the JWT token using Supabase's JWT_SECRET
    const secretKey = process.env.SUPABASE_JWT_SECRET || 'your-supabase-jwt-secret';
    let decodedToken: any;

    try {
      decodedToken = jwt.verify(token, secretKey);
    } catch (error) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired admin token.',
      });
      return;
    }
    
    // Extract user ID from the token payload
    const userId = decodedToken.id;


    if (!supabase) {
      res.status(500).json({
        success: false,
        error: 'Supabase instance is not initialized.',
      });
      return;
    }

    // Query the admins table to fetch admin details
    const { data: admin, error } = await supabase
      .from('admins')
      .select('id, email, role, is_active')
      .eq('id', userId)
      .single();
     console.log(admin, error);
    if (error || !admin || !admin.is_active) {
      res.status(403).json({
        success: false,
        error: 'Admin account is inactive or not authorized.',
      });
      return;
    }

    // Attach admin info to the request
    req.admin = admin;
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Admin authentication failed.',
    });
  }
};

/**
 * Middleware to require super admin role
 */
export const requireSuperAdmin = (req: AdminRequest, res: Response, next: NextFunction): void => {
  if (!req.admin) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
    return;
  }

  if (req.admin.role !== 'super_admin') {
    res.status(403).json({
      success: false,
      error: 'Super admin access required',
    });
    return;
  }

  next();
};

/**
 * Middleware to require admin or super admin role
 */
export const requireAdmin = (req: AdminRequest, res: Response, next: NextFunction): void => {
  if (!req.admin) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
    return;
  }

  if (!['admin', 'super_admin'].includes(req.admin.role)) {
    res.status(403).json({
      success: false,
      error: 'Admin access required',
    });
    return;
  }

  next();
};
