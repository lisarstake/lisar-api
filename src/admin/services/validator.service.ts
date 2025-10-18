import { supabase } from '../../config/supabase';

export interface Validator {
  id: string;
  address: string;
  name?: string | null;
  protocol?: string | null;
  fee_pct?: number | null;
  apy?: number | null;
  total_delegated_lisar?: string | null;
  is_active: boolean;
  created_date?: string;
  updated_date?: string;
}

export class AdminValidatorService {
  async getAllValidators(filters: { search?: string; status?: 'active' | 'hidden'; page?: number; limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' } = {}) {
    try {
      if (!supabase) return { success: false, error: 'Database connection not available' };

      const { search, status, page = 1, limit = 20, sortBy = 'created_date', sortOrder = 'desc' } = filters;
      const offset = (page - 1) * limit;

      let query = supabase.from('validators').select('*', { count: 'exact' });

      if (search) {
        const s = String(search).trim();
        query = query.or(`address.ilike.%${s}%,name.ilike.%${s}%`);
      }

      if (status === 'active') query = query.eq('is_active', true);
      else if (status === 'hidden') query = query.eq('is_active', false);

      const { data, error, count } = await query.order(sortBy, { ascending: sortOrder === 'asc' }).range(offset, offset + limit - 1);
      if (error) {
        console.error('Error fetching validators:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: {
          validators: data || [],
          total: count || 0,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit)
        }
      };
    } catch (error: any) {
      console.error('Error in AdminValidatorService.getAllValidators:', error);
      return { success: false, error: 'Failed to fetch validators' };
    }
  }

  async getValidatorById(id: string) {
    try {
      if (!supabase) return { success: false, error: 'Database connection not available' };
      const { data, error } = await supabase.from('validators').select('*').eq('id', id).maybeSingle();
      if (error) {
        console.error('Error fetching validator by id:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } catch (error: any) {
      console.error('Error in AdminValidatorService.getValidatorById:', error);
      return { success: false, error: 'Failed to fetch validator' };
    }
  }

  async createValidator(payload: Partial<Validator>) {
    try {
      if (!supabase) return { success: false, error: 'Database connection not available' };
      const now = new Date().toISOString();
      const { data, error } = await supabase.from('validators').insert([{ ...payload, created_date: now, updated_date: now }]).select().maybeSingle();
      if (error) {
        console.error('Error creating validator:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } catch (error: any) {
      console.error('Error in AdminValidatorService.createValidator:', error);
      return { success: false, error: 'Failed to create validator' };
    }
  }

  async updateValidator(id: string, updates: Partial<Validator>) {
    try {
      if (!supabase) return { success: false, error: 'Database connection not available' };
      const { data, error } = await supabase.from('validators').update({ ...updates, updated_date: new Date().toISOString() }).eq('id', id).select().maybeSingle();
      if (error) {
        console.error('Error updating validator:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } catch (error: any) {
      console.error('Error in AdminValidatorService.updateValidator:', error);
      return { success: false, error: 'Failed to update validator' };
    }
  }

  async setValidatorStatus(id: string, isActive: boolean) {
    return this.updateValidator(id, { is_active: isActive });
  }
}

export const adminValidatorService = new AdminValidatorService();
