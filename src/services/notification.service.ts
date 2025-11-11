import { supabase } from '../config/supabase';

export class NotificationService {
  /**
   * Get all notifications for a user
   */
  async getUserNotifications(userId: string, limit: number = 50, offset: number = 0) {
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized. Please check your configuration.');
      }

      const { data, error, count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Failed to fetch notifications: ${error.message}`);
      }

      return {
        notifications: data,
        total: count,
        limit,
        offset
      };
    } catch (error: any) {
      console.error('Error in getUserNotifications:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId: string) {
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized. Please check your configuration.');
      }

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        throw new Error(`Failed to fetch unread count: ${error.message}`);
      }

      return { unread_count: count || 0 };
    } catch (error: any) {
      console.error('Error in getUnreadCount:', error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized. Please check your configuration.');
      }

      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to mark notification as read: ${error.message}`);
      }

      return data;
    } catch (error: any) {
      console.error('Error in markAsRead:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized. Please check your configuration.');
      }

      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('is_read', false)
        .select();

      if (error) {
        throw new Error(`Failed to mark all notifications as read: ${error.message}`);
      }

      return { updated_count: data?.length || 0 };
    } catch (error: any) {
      console.error('Error in markAllAsRead:', error);
      throw error;
    }
  }

  /**
   * Create a new notification
   */
  async createNotification(notificationData: {
    user_id: string;
    title: string;
    message: string;
    type?: string;
    metadata?: any;
  }) {
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized. Please check your configuration.');
      }

      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          ...notificationData,
          is_read: false,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create notification: ${error.message}`);
      }

      return data;
    } catch (error: any) {
      console.error('Error in createNotification:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: string) {
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized. Please check your configuration.');
      }

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to delete notification: ${error.message}`);
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error in deleteNotification:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();
