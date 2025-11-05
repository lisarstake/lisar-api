import { axiosInstance as onrampAxiosInstance } from '../../config/onramp.axios';

export class OnramperService {
  baseUrl: string;

  constructor() {
    this.baseUrl = process.env.ONRAMP_API_URL || '';
  }

  async generateOrderUrl(params: {
    coinId?: number;
    coinCode?: string;
    chainId?: number;
    network?: string;
    fiatAmount: number;
    fiatType: number;
    type?: number;
  }): Promise<any> {
    const body = {
      coinId: params.coinId,
      coinCode: params.coinCode,
      chainId: params.chainId,
      network: params.network,
      fiatAmount: params.fiatAmount,
      fiatType: params.fiatType,
      type: params.type ?? 1,
    };

    try {
      // onrampAxiosInstance request interceptor will attach API key/payload/signature
      const resp = await onrampAxiosInstance.post('/onramp/api/v2/common/transaction/generateLink', body);
      return resp.data;
    } catch (err: any) {
      const e = err?.response?.data || err?.message || err;
      throw new Error(`Onramper error: ${JSON.stringify(e)}`);
    }
  }
}

export const onramperService = new OnramperService();

/*
Usage example:

import { onramperService } from '../integrations/onramper/onramper.service';

const res = await onramperService.generateOrderUrl({
  coinCode: 'usdt',
  network: 'bep20',
  fiatAmount: 200,
  fiatType: 1,
});
console.log(res);

Note: install dependencies: npm install axios crypto-js
Set env: ONRAMP_API_KEY, ONRAMP_API_SECRET, optional ONRAMP_API_URL
*/
