#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config();

import { onramperService } from '../src/integrations/onramper/onramper.service';

async function main() {
  const cliUrl = process.argv[2];
  const envUrl = process.env.WEBHOOK_URL;
  const webhookUrl = cliUrl || envUrl;

  if (!webhookUrl) {
    console.error('Usage: npx ts-node scripts/set-onramper-webhook.ts <webhookUrl>\nOr set WEBHOOK_URL in your environment.');
    process.exit(2);
  }

  try {
    console.log(`Setting Onramper webhook URL to: ${webhookUrl}`);
    const resp = await onramperService.setWebhookUrl(webhookUrl);
    console.log('Onramper response:', JSON.stringify(resp, null, 2));
    process.exit(0);
  } catch (err: any) {
    console.error('Error setting Onramper webhook URL:', err?.message || err);
    if (err?.response?.data) {
      console.error('Response data:', JSON.stringify(err.response.data, null, 2));
    }
    process.exit(1);
  }
}

main();
