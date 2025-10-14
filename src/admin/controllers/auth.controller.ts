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

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.SUPABASE_JWT_SECRET || 'your-supabase-jwt-secret',
      { expiresIn: '1h' }
    );

    return res.json({ success: true, token });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ success: false, error: 'Unexpected error occurred.' });
  }
};


