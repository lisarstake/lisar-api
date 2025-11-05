import 'dotenv/config';
import { onramperService } from '../src/integrations/onramper/onramper.service';

async function run() {
  try {
    console.log('ONRAMP_API_KEY present?', !!process.env.ONRAMP_API_KEY);
    console.log('ONRAMP_API_SECRET present?', !!process.env.ONRAMP_API_SECRET);

    const params = {
      coinCode: 'usdt',
      network: 'bep20',
      fiatAmount: 200,
      fiatType: 1,
      // type: 1 // default is onramp
    } as any;

    const res = await onramperService.generateOrderUrl(params);
    console.log('Onramper response:', JSON.stringify(res, null, 2));
  } catch (err: any) {
    console.error('Onramper test failed:', err?.message || err);
    if (err?.response) console.error('Response data:', err.response.data);
    process.exit(1);
  }
}

run();
