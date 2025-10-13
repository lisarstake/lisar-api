import { Request, Response } from 'express';
import { webhookService } from '../services/webhook.service';
import { PrivyWebhookEvent } from '../types/webhook.types';
import crypto from 'crypto';

export class WebhookController {
  async handlePrivyWebhook(req: Request, res: Response): Promise<Response> {
    try {
      // Get Svix headers
      const svixId = req.headers['svix-id'] as string;
      const svixTimestamp = req.headers['svix-timestamp'] as string;
      const svixSignature = req.headers['svix-signature'] as string;
      
      console.log('Svix headers:', { svixId, svixTimestamp, svixSignature });

      // For now, let's skip signature verification and just process the webhook
      // You can add proper Svix verification later if needed
      if (!svixId || !svixTimestamp || !svixSignature) {
        console.warn('Missing required Svix headers');
        return res.status(401).json({ error: 'Missing required webhook headers' });
      }

      const event = req.body as PrivyWebhookEvent;
      console.log('Received webhook event:', event);
      
      await webhookService.handlePrivyWebhook(event,svixId);
      
      return res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Webhook handling error:', error);
      return res.status(500).json({ error: 'Failed to process webhook' });
    }
  }
}

export const webhookController = new WebhookController();
