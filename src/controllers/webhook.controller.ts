import { Request, Response } from 'express';
import { webhookService } from '../services/webhook.service';
import { PrivyWebhookEvent, OnramperWebhookEvent, SupabaseWebhookEvent } from '../types/webhook.types';
import crypto from 'crypto';
import CryptoJS from 'crypto-js';

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

  async handleOnramperWebhook(req: Request, res: Response): Promise<Response> {
    try {
      // Get Onramper headers
      const payload = req.headers['x-onramp-payload'] as string;
      const signature = req.headers['x-onramp-signature'] as string;
      console.log('Onramper headers:', { payload, signature });
      if (!payload || !signature) {
        console.warn('Missing required Onramper webhook headers');
        return res.status(401).json({ error: 'Missing required webhook headers' });
      }

      // Verify webhook signature
      const apiSecret = process.env.ONRAMP_API_SECRET;
      if (!apiSecret) {
        console.error('ONRAMP_API_SECRET not configured');
        return res.status(500).json({ error: 'Webhook verification not configured' });
      }

      const localSignature = CryptoJS.enc.Hex.stringify(
        CryptoJS.HmacSHA512(payload, apiSecret)
      );

      if (localSignature !== signature) {
        console.warn('Invalid Onramper webhook signature');
        return res.status(403).json({ error: 'Invalid signature' });
      }

      // Signature verified, process the webhook
      const event = req.body as OnramperWebhookEvent;
      
      await webhookService.handleOnramperWebhook(event);
      
      // Respond within 5 seconds as required by Onramper
      return res.status(200).send('Received data :)');
    } catch (error: any) {
      console.error('Onramper webhook handling error:', error);
      return res.status(500).json({ error: 'Failed to process webhook' });
    }
  }

  async handleSupabaseWebhook(req: Request, res: Response): Promise<Response> {
    try {
      // Validate webhook source with optional secret
      const webhookSecret = req.headers['x-supabase-webhook-secret'] as string;
      
      if (process.env.SUPABASE_WEBHOOK_SECRET && webhookSecret !== process.env.SUPABASE_WEBHOOK_SECRET) {
        console.warn('Invalid Supabase webhook secret');
        return res.status(403).json({ error: 'Invalid webhook secret' });
      }

      const event = req.body as SupabaseWebhookEvent;
      console.log('Received Supabase webhook:', { type: event.type, table: event.table });
      
      await webhookService.handleSupabaseWebhook(event);
      
      return res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Supabase webhook handling error:', error);
      return res.status(500).json({ error: 'Failed to process webhook' });
    }
  }

  // Deprecated: Use handleSupabaseWebhook instead
  async handleSupabaseUserCreated(req: Request, res: Response): Promise<Response> {
    return this.handleSupabaseWebhook(req, res);
  }
}

export const webhookController = new WebhookController();

