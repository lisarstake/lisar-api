import { PrivyClient } from '@privy-io/node';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const privyAppId = process.env.PRIVY_APP_ID;
const privyAppSecret = process.env.PRIVY_APP_SECRET;

let privyClient: PrivyClient | null = null;

if (privyAppId && privyAppSecret) {
  privyClient = new PrivyClient({
    appId: privyAppId,
    appSecret: privyAppSecret,
  });
  console.log('✅ Privy client initialized');
} else {
  console.warn('⚠️  Privy configuration missing. Please set PRIVY_APP_ID and PRIVY_APP_SECRET in your .env file');
}

export { privyClient, PrivyClient };
export default privyClient;
