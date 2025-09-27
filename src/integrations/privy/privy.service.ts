import { privyClient } from '../../config/privy';



type PrivyUser = {
  id: string;
  created_at: number; 
  linked_accounts: any[];
};

type PrivyWallet = {
  id: string;
  address: string;
  chain_type: string;
  chain_id?: string;
  owner: {
    user_id: string;
  };
};

export interface CreateUserRequest {
  linked_accounts: Array<{
    type: 'custom_auth';
    custom_user_id: string;
  }>;
}

export interface CreateWalletRequest {
  chain_type: 'ethereum';
  chain_id?: string;
  policy_ids?: string[];
}

export class PrivyService {

  /**
   * Create a user with an Ethereum wallet in one step
   */
  async createUserWithWallet(customUserId: string): Promise<{ user: PrivyUser; wallet: PrivyWallet }> {
    try {
      if (!privyClient) {
        throw new Error('Privy client not initialized');
      }

      // Create user in Privy
      const user = await privyClient.users().create({
        linked_accounts: [{
          type: 'custom_auth',
          custom_user_id: customUserId,
        }],
      });

      // Create an Ethereum wallet for the user
      const wallet = await privyClient.wallets().create({
        chain_type: 'ethereum',
        owner: { user_id: user.id },
      });

      // Attach the user ID to the wallet manually
      const walletWithOwner = {
        ...wallet,
        owner: {
          user_id: user.id,
        },
      };
  
      return { user, wallet: walletWithOwner };
    } catch (error) {
      console.error('Error creating user with wallet in Privy:', error);
      throw error;
    }
  }



  /**
   * Test connection to Privy API
   */
  async testConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      if (!privyClient) {
        return {
          connected: false,
          message: 'Privy client not initialized',
        };
      }

      return {
        connected: true,
        message: 'Privy client initialized successfully',
      };
    } catch (error) {
      return {
        connected: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const privyService = new PrivyService();