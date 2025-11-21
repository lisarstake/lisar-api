import { onramperService } from '../src/integrations/onramper/onramper.service';

async function main() {
  try {
    const res = await onramperService.getQuote({
      coinId: 54,
      coinCode: 'usdt',
      chainId: 3,
      network: 'bep20',
      fiatAmount: 200,
      fiatType: 6,
      type: 1,
    });
    console.log('Quote response:', JSON.stringify(res, null, 2));
  } catch (e:any) {
    console.error('Quote error:', e.message || e);
  }
}

main();
