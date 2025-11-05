import axios from 'axios';
import * as CryptoJS from 'crypto-js';

// Use host-only base URL; service will call the full path.
const baseURL = process.env.ONRAMP_API_URL || 'https://api.onramp.money';

export const axiosInstance = axios.create({
  baseURL,
  timeout: Number(process.env.AXIOS_TIMEOUT_MS || 10000),
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json;charset=UTF-8',
  },
});

const ONRAMP_API_KEY = process.env.ONRAMP_API_KEY || '';
const ONRAMP_API_SECRET = process.env.ONRAMP_API_SECRET || '';

// Automatically sign requests and attach onramp headers if credentials are available
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      if (!ONRAMP_API_KEY || !ONRAMP_API_SECRET) return config;

      // Determine body to sign - prefer config.data
      const body = config.data ?? {};
      const payloadObj = {
        timestamp: new Date().getTime(),
        body,
      };

      const payload = Buffer.from(JSON.stringify(payloadObj)).toString('base64');
      const signature = CryptoJS.HmacSHA512(payload, ONRAMP_API_SECRET).toString(CryptoJS.enc.Hex);

      // merge headers safely; cast to any to satisfy AxiosHeaders typing
      (config.headers as any) = {
        ...((config.headers as any) || {}),
        'X-ONRAMP-SIGNATURE': signature,
        'X-ONRAMP-APIKEY': ONRAMP_API_KEY,
        'X-ONRAMP-PAYLOAD': payload,
      };

      return config;
    } catch (e) {
      // if signing fails, allow request to proceed without custom headers
      console.warn('Onramp axios signing failed:', e);
      return config;
    }
  },
  (err) => Promise.reject(err)
);

// Optional: add request/response interceptors for centralized logging or error handling
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    // Let callers handle structured errors, but keep a console debug here
    console.debug('axiosInstance response error:', err?.response?.status);
    return Promise.reject(err);
  }
);
