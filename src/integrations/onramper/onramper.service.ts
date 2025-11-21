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

  async getQuote(params: {
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
      const resp = await onrampAxiosInstance.post('/onramp/api/v2/common/transaction/quotes', body);
      return resp.data;
    } catch (err: any) {
      const e = err?.response?.data || err?.message || err;
      throw new Error(`Onramper quote error: ${JSON.stringify(e)}`);
    }
  }

  async setWebhookUrl(webhookUrl: string): Promise<any> {
    const body = {
      webhookUrl
    };

    try {
      const resp = await onrampAxiosInstance.post('/onramp/api/v1/merchant/setWebhookUrl', body);
      return resp.data;
    } catch (err: any) {
      const e = err?.response?.data || err?.message || err;
      throw new Error(`Onramper webhook URL update error: ${JSON.stringify(e)}`);
    }
  }

  async sendDummyWebhook(webhookUrl?: string): Promise<any> {
    const body: any = {};
    
    // If webhookUrl is provided, send to that URL, otherwise use the currently configured one
    if (webhookUrl) {
      body.webhookUrl = webhookUrl;
    }

    try {
      const resp = await onrampAxiosInstance.post('/onramp/api/v1/merchant/sendDummyWebhook', body);
      return resp.data;
    } catch (err: any) {
      const e = err?.response?.data || err?.message || err;
      throw new Error(`Onramper send dummy webhook error: ${JSON.stringify(e)}`);
    }
  }
}

export const onramperService = new OnramperService();

