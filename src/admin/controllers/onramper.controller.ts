import { Response } from 'express';
import { AdminRequest } from '../middleware/admin.middleware';
import { onramperService } from '../../integrations/onramper/onramper.service';

export class OnramperController {
  /**
   * Update Onramper webhook URL
   * PATCH /admin/onramper/webhook-url
   */
  async updateWebhookUrl(req: AdminRequest, res: Response): Promise<void> {
    try {
      const { webhookUrl } = req.body;

      if (!webhookUrl) {
        res.status(400).json({
          success: false,
          error: 'webhookUrl is required'
        });
        return;
      }

      // Validate URL format
      try {
        new URL(webhookUrl);
      } catch (error) {
        res.status(400).json({
          success: false,
          error: 'Invalid webhook URL format'
        });
        return;
      }

      // Ensure it's HTTPS
      if (!webhookUrl.startsWith('https://')) {
        res.status(400).json({
          success: false,
          error: 'Webhook URL must use HTTPS protocol'
        });
        return;
      }

      const result = await onramperService.setWebhookUrl(webhookUrl);

      res.status(200).json({
        success: true,
        message: 'Webhook URL updated successfully',
        data: result
      });
    } catch (error: any) {
      console.error('Error updating Onramper webhook URL:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update webhook URL'
      });
    }
  }

  /**
   * Send a dummy webhook for testing
   * POST /admin/onramper/test-webhook
   */
  async sendTestWebhook(req: AdminRequest, res: Response): Promise<void> {
    try {
      const { webhookUrl } = req.body;

      // If webhookUrl is provided, validate it
      if (webhookUrl) {
        try {
          new URL(webhookUrl);
        } catch (error) {
          res.status(400).json({
            success: false,
            error: 'Invalid webhook URL format'
          });
          return;
        }

        if (!webhookUrl.startsWith('https://') && !webhookUrl.startsWith('http://')) {
          res.status(400).json({
            success: false,
            error: 'Webhook URL must use HTTP or HTTPS protocol'
          });
          return;
        }
      }

      const result = await onramperService.sendDummyWebhook(webhookUrl);

      res.status(200).json({
        success: true,
        message: 'Test webhook sent successfully',
        data: result
      });
    } catch (error: any) {
      console.error('Error sending test webhook:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to send test webhook'
      });
    }
  }
}

export const onramperController = new OnramperController();
