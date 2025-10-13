import { privyClient } from '../../config/privy';
import { PrivyUser, PrivyWallet, CreateUserRequest, CreateWalletRequest } from '../../types/privy.types';
import { createViemAccount } from '@privy-io/node/viem';
import { createWalletClient, Hex, http, parseEther } from 'viem';
import { base } from 'viem/chains';
import { arbitrumOne } from '../../protocols/config/livepeer.config';



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

  /**
   * Fetch a user's wallet by wallet ID
   */
  async fetchWalletById(walletId: string): Promise<any> {
    try {
      if (!privyClient) {
        throw new Error('Privy client not initialized');
      }

      const wallet = await privyClient.wallets().get(walletId);
      
      // Attach the owner property manually if missing
      // const walletWithOwner: PrivyWallet = {
      //   ...wallet,
      //   owner: { user_id: wallet.owner?.user_id || '' }, // Ensure owner.user_id exists
      // };

      return wallet;
    } catch (error) {
      console.error('Error fetching wallet by ID:', error);
      throw error;
    }
  }

  /**
   * Export a wallet's private key by wallet ID with authorization context
   */
  async exportWalletPrivateKey(walletId: string,userJwt: string): Promise<string> {
    try {
      if (!privyClient) {
        throw new Error('Privy client not initialized');
      }

      const authorizationContext = {
        user_jwts: [userJwt],
      };

      const { private_key } = await privyClient.wallets().export(walletId, {
        authorization_context: authorizationContext,
      });

      return private_key;
    } catch (error) {
      console.error('Error exporting wallet private key with authorization:', error);
      throw error;
    }
  }

  /**
   * Send a transaction using a Privy wallet
   */
  async sendTransactionWithPrivyWallet(
    walletId: string,
    address: Hex,
    to: Hex,
    value: string
  ): Promise<string> {
    try {
      if (!privyClient) {
        throw new Error('Privy client not initialized');
      }

      // Create a viem account instance for the wallet
      const account = await createViemAccount(privyClient, {
        walletId,
        address,
      });

      // Initialize the viem WalletClient
      const client = createWalletClient({
        account,
        chain: arbitrumOne, // Replace with your desired network
        transport: http(),
      });

      client.writeContract
      // Send the transaction
      const hash = await client.sendTransaction({
        to,
        value: parseEther(value),
      });

      return hash;
    } catch (error) {
      console.error('Error sending transaction with Privy wallet:', error);
      throw error;
    }
  }

  /**
   * Write to a contract using a Privy wallet on Arbitrum
   */
  async writeToContractWithPrivyWallet(
    walletId: string,
    address: `0x${string}`,
    contractAddress: `0x${string}`,
    abi: any,
    functionName: string,
    args: any[],
    userJwt: string
  ): Promise<string> {
    try {
      if (!privyClient) {
        throw new Error('Privy client not initialized');
      }

      // Create a viem account instance for the wallet with authorization context
      const account = await createViemAccount(privyClient, {
        walletId,
        address,
        authorizationContext: {
           user_jwts: [userJwt],
        },
      });
        
      // Initialize the viem WalletClient
      const client = createWalletClient({
        account,
        chain: arbitrumOne, // Use Arbitrum network
        transport: http(),
      });

      // Write to the contract
      const hash = await client.writeContract({
        address: contractAddress,
        abi,
        functionName,
        args,
      });

      return hash;
    } catch (error) {
      console.error('Error writing to contract with Privy wallet:', error);
      throw error;
    }
  }
}

export const privyService = new PrivyService();