import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service';

export class NotificationController {
  /**
   * Get all notifications for authenticated user
   * GET /notifications
   */
  async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({
          error: 'User not authenticated',
          success: false
        });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await notificationService.getUserNotifications(userId, limit, offset);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Error in getNotifications:', error);
      res.status(500).json({
        error: error.message || 'Failed to fetch notifications',
        success: false
      });
    }
  }

  /**
   * Get unread notification count
   * GET /notifications/unread-count
   */
  async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({
          error: 'User not authenticated',
          success: false
        });
        return;
      }

      const result = await notificationService.getUnreadCount(userId);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Error in getUnreadCount:', error);
      res.status(500).json({
        error: error.message || 'Failed to fetch unread count',
        success: false
      });
    }
  }

  /**
   * Mark a notification as read
   * PATCH /notifications/:id/read
   */
  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;
      
      if (!userId) {
        res.status(401).json({
          error: 'User not authenticated',
          success: false
        });
        return;
      }

      if (!id) {
        res.status(400).json({
          error: 'Notification ID is required',
          success: false
        });
        return;
      }

      const notification = await notificationService.markAsRead(id, userId);

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: notification
      });
    } catch (error: any) {
      console.error('Error in markAsRead:', error);
      res.status(500).json({
        error: error.message || 'Failed to mark notification as read',
        success: false
      });
    }
  }

  /**
   * Mark all notifications as read
   * PATCH /notifications/read-all
   */
  async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({
          error: 'User not authenticated',
          success: false
        });
        return;
      }

      const result = await notificationService.markAllAsRead(userId);

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
        data: result
      });
    } catch (error: any) {
      console.error('Error in markAllAsRead:', error);
      res.status(500).json({
        error: error.message || 'Failed to mark all notifications as read',
        success: false
      });
    }
  }

  /**
   * Create a notification (admin or system use)
   * POST /notifications
   */
  async createNotification(req: Request, res: Response): Promise<void> {
    try {
      const { user_id, title, message, type, metadata } = req.body;

      // Basic validation
      if (!user_id || !title || !message) {
        res.status(400).json({
          error: 'user_id, title, and message are required',
          success: false
        });
        return;
      }

      const notification = await notificationService.createNotification({
        user_id,
        title,
        message,
        type,
        metadata
      });

      res.status(201).json({
        success: true,
        message: 'Notification created successfully',
        data: notification
      });
    } catch (error: any) {
      console.error('Error in createNotification:', error);
      res.status(500).json({
        error: error.message || 'Failed to create notification',
        success: false
      });
    }
  }

  /**
   * Delete a notification
   * DELETE /notifications/:id
   */
  async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;
      
      if (!userId) {
        res.status(401).json({
          error: 'User not authenticated',
          success: false
        });
        return;
      }

      if (!id) {
        res.status(400).json({
          error: 'Notification ID is required',
          success: false
        });
        return;
      }

      await notificationService.deleteNotification(id, userId);

      res.status(200).json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error: any) {
      console.error('Error in deleteNotification:', error);
      res.status(500).json({
        error: error.message || 'Failed to delete notification',
        success: false
      });
    }
  }
}

export const notificationController = new NotificationController();
