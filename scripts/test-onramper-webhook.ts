import 'dotenv/config';
import { onramperService } from '../src/integrations/onramper/onramper.service';

async function sendDummyWebhook() {
  try {
    console.log('ONRAMP_API_KEY present?', !!process.env.ONRAMP_API_KEY);
    console.log('ONRAMP_API_SECRET present?', !!process.env.ONRAMP_API_SECRET);

    if (!process.env.ONRAMP_API_KEY || !process.env.ONRAMP_API_SECRET) {
      console.error('Missing ONRAMP_API_KEY or ONRAMP_API_SECRET in environment variables');
      process.exit(1);
    }

    // Get webhook URL from command line argument or use default/configured URL
    const webhookUrl = process.argv[2];
    console.log('Using webhook URL:', webhookUrl || 'currently configured URL');
    
    if (webhookUrl) {
      console.log(`\nSending dummy webhook to: ${webhookUrl}\n`);
    } else {
      console.log(`\nSending dummy webhook to currently configured URL\n`);
    }

    const response = await onramperService.sendDummyWebhook(webhookUrl);
    
    console.log('✅ Dummy webhook sent successfully!');
    console.log('\nResponse from Onramper:');
    console.log(JSON.stringify(response, null, 2));
    
    console.log('\n📝 Note: Check your webhook endpoint to see if it received the dummy transaction data.');
    console.log('The dummy webhook will contain sample transaction details with status 4 (withdrawal complete).\n');

  } catch (error: any) {
    console.error('❌ Error sending dummy webhook:', error?.message || error);
    process.exit(1);
  }
}

sendDummyWebhook();
