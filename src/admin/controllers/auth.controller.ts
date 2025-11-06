import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../../config/supabase';



export const createAdmin = async (req: Request, res: Response): Promise<Response> => {
  const { email, password, role } = req.body;

  try {
    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: 'Supabase instance is not initialized.',
      });
    }

    // Check if the email already exists
    const { data: existingAdmin, error: fetchError } = await supabase
      .from('admins')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (fetchError) {
      return res.status(500).json({ success: false, error: 'Error checking existing admin.' });
    }

    if (existingAdmin) {
      return res.status(400).json({ success: false, error: 'Admin with this email already exists.' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    

    // Insert the new admin into the database
    const { data: newAdmin, error: insertError } = await supabase
      .from('admins')
      .insert([
        {
          email,
          password_hash: hashedPassword,
          role,
          is_active: true, // Default to active
          created_at: new Date().toISOString()
        },
      ])
      .select()
      .maybeSingle();
    if (insertError) {
      return res.status(500).json({ success: false, error: 'Error creating admin.' });
    }

    // Remove sensitive fields like password_hash before returning the response
    const { password_hash, ...safeAdminData } = newAdmin;

    return res.status(201).json({ success: true, data: safeAdminData });
  } catch (error) {
    console.error('Error creating admin:', error);
    return res.status(500).json({ success: false, error: 'Unexpected error occurred.' });
  }
};

export const adminLogin = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;

  try {
    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: 'Supabase instance is not initialized.',
      });
    }

    // Fetch admin from the database
    const { data: admin, error } = await supabase
      .from('admins')
      .select('id, email, password_hash, role, is_active')
      .eq('email', email)
      .maybeSingle();

    if (error || !admin) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    if (!admin.is_active) {
      return res.status(403).json({ success: false, error: 'Admin account is inactive' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // Generate access token (short-lived)
    const accessToken = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.SUPABASE_JWT_SECRET || 'your-supabase-jwt-secret',
      { expiresIn: '15m' } // 15 minutes
    );

    // Generate refresh token (long-lived)
    const refreshToken = jwt.sign(
      { id: admin.id, email: admin.email, type: 'refresh' },
      process.env.SUPABASE_JWT_SECRET || 'your-supabase-jwt-secret',
      { expiresIn: '7d' } // 7 days
    );

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const { error: tokenError } = await supabase
      .from('admin_refresh_tokens')
      .insert([
        {
          admin_id: admin.id,
          token: refreshToken,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString()
        }
      ]);

    if (tokenError) {
      console.error('Error storing refresh token:', tokenError);
      // Continue anyway - user can still use access token
    }

    return res.json({ 
      success: true, 
      accessToken,
      refreshToken,
      expiresIn: 900 // 15 minutes in seconds
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ success: false, error: 'Unexpected error occurred.' });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<Response> => {
  const { refreshToken } = req.body;

  try {
    if (!refreshToken) {
      return res.status(400).json({ success: false, error: 'Refresh token is required' });
    }

    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: 'Supabase instance is not initialized.',
      });
    }

    // Verify refresh token
    let decoded: any;
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.SUPABASE_JWT_SECRET || 'your-supabase-jwt-secret'
      );
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Invalid or expired refresh token' });
    }

    // Check if it's a refresh token
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ success: false, error: 'Invalid token type' });
    }

    // Check if refresh token exists in database and is not expired
    const { data: storedToken, error: fetchError } = await supabase
      .from('admin_refresh_tokens')
      .select('*')
      .eq('admin_id', decoded.id)
      .eq('token', refreshToken)
      .gt('expires_at', new Date().toISOString())
      .eq('revoked', false)
      .maybeSingle();

    if (fetchError || !storedToken) {
      return res.status(401).json({ success: false, error: 'Refresh token not found or expired' });
    }

    // Fetch admin details
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('id, email, role, is_active')
      .eq('id', decoded.id)
      .maybeSingle();

    if (adminError || !admin) {
      return res.status(401).json({ success: false, error: 'Admin not found' });
    }

    if (!admin.is_active) {
      return res.status(403).json({ success: false, error: 'Admin account is inactive' });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.SUPABASE_JWT_SECRET || 'your-supabase-jwt-secret',
      { expiresIn: '15m' }
    );

    return res.json({
      success: true,
      accessToken,
      expiresIn: 900 // 15 minutes in seconds
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({ success: false, error: 'Unexpected error occurred.' });
  }
};

export const revokeRefreshToken = async (req: Request, res: Response): Promise<Response> => {
  const { refreshToken } = req.body;

  try {
    if (!refreshToken) {
      return res.status(400).json({ success: false, error: 'Refresh token is required' });
    }

    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: 'Supabase instance is not initialized.',
      });
    }

    // Update the token to mark it as revoked
    const { error: revokeError } = await supabase
      .from('admin_refresh_tokens')
      .update({ revoked: true, revoked_at: new Date().toISOString() })
      .eq('token', refreshToken);

    if (revokeError) {
      return res.status(500).json({ success: false, error: 'Error revoking refresh token' });
    }

    return res.json({ success: true, message: 'Refresh token revoked successfully' });
  } catch (error) {
    console.error('Revoke refresh token error:', error);
    return res.status(500).json({ success: false, error: 'Unexpected error occurred.' });
  }
};


