import 'dotenv/config';
import { onramperService } from '../src/integrations/onramper/onramper.service';

async function run() {
  try {
    console.log('ONRAMP_API_KEY present?', !!process.env.ONRAMP_API_KEY);
    console.log('ONRAMP_API_SECRET present?', !!process.env.ONRAMP_API_SECRET);

    const params = {
      // coinId: 54,   
      coinCode: "lpt",  // (if both coinId and coinCode are passed -> coinCode takes precedence)
      chainId: 3,    
      network: "arbitrumOne",  //(if both chainId and network are passed -> network takes precedence)
      fiatAmount: 200, 
      fiatType: 6,     // Fiat Type from config file 1 for INR || 2 for TRY || 3 for AED || 4 for MXN etc
      type: 1   // type: 1 // default is onramp
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
