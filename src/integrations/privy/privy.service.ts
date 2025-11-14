import { privyClient } from '../../config/privy';
import { PrivyUser, PrivyWallet, CreateUserRequest, CreateWalletRequest } from '../../types/privy.types';
import { createViemAccount } from '@privy-io/node/viem';
import { createWalletClient, Hex, http, parseEther, encodeFunctionData, createPublicClient } from 'viem';
import { base } from 'viem/chains';
import { arbitrumOne } from '../../protocols/config/livepeer.config';
import { formatContractError, isNonceTooLowError } from '../../utils/contractErrorFormatter';


// public client for on-chain queries (used to fetch pending nonce)
const publicClient = createPublicClient({
  chain: arbitrumOne,
  transport: http(),
});

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
  async sendTransactionWithPrivyWalletGasSponsor(
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

      // Create a viem account instance for the wallet
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
        chain: arbitrumOne, // Replace with your desired network
        transport: http(),
      });
      const data = encodeFunctionData({
            abi,
            functionName,
            args,
        });

      const MAX_RETRIES = 3;
      let lastErr: any = null;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        // fetch latest pending nonce
        const nonceBigInt = await publicClient.getTransactionCount({ address, blockTag: 'pending' });
        const nonce = Number(nonceBigInt);

        try {
          console.debug(`Privy send attempt=${attempt} nonce=${nonce} to=${contractAddress}`);
          const hash = await client.sendTransaction({
            to: contractAddress,
            data,
            chain_id: 8453,
            sponsor: true,
            nonce,
          });

          return hash;
        } catch (err: any) {
          lastErr = err;
          if (isNonceTooLowError(err) && attempt < MAX_RETRIES) {
            console.warn(`Nonce-too-low detected (attempt ${attempt}). Retrying...`);
            await new Promise((r) => setTimeout(r, 500 * attempt));
            continue;
          }

          const formatted = formatContractError(err);
          console.error('Privy tx error (userMessage):', formatted.userMessage);
          console.error('Privy tx error (debug):', formatted.debug.full);
          throw new Error(formatted.userMessage);
        }
      }

      const formatted = formatContractError(lastErr);
      console.error('Privy tx error (userMessage):', formatted.userMessage);
      console.error('Privy tx error (debug):', formatted.debug.full);
      throw new Error(formatted.userMessage);

    } catch (error: any) {
      const formatted = formatContractError(error);
      console.error('Privy tx error (userMessage):', formatted.userMessage);
      console.error('Privy tx error (debug):', formatted.debug.full);
      throw new Error(formatted.userMessage);
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

      const data = encodeFunctionData({ abi, functionName, args });

      const MAX_RETRIES = 3;
      let lastErr: any = null;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const nonceBigInt = await publicClient.getTransactionCount({ address, blockTag: 'pending' });
        const nonce = Number(nonceBigInt);

        try {
          console.debug(`Privy write attempt=${attempt} nonce=${nonce} to=${contractAddress}`);

          const hash = await client.sendTransaction({
            to: contractAddress,
            data,
            chain_id: 8453,
            nonce,
          });

          return hash;
        } catch (err: any) {
          lastErr = err;
          if (isNonceTooLowError(err) && attempt < MAX_RETRIES) {
            console.warn(`Nonce-too-low detected (attempt ${attempt}). Retrying...`);
            await new Promise((r) => setTimeout(r, 500 * attempt));
            continue;
          }

          const formatted = formatContractError(err);
          console.error('Privy write error (userMessage):', formatted.userMessage);
          console.error('Privy write error (debug):', formatted.debug.full);
          throw new Error(formatted.userMessage);
        }
      }

      const formattedLast = formatContractError(lastErr);
      console.error('Privy write error (userMessage):', formattedLast.userMessage);
      console.error('Privy write error (debug):', formattedLast.debug.full);
      throw new Error(formattedLast.userMessage);

    } catch (error: any) {
      const formatted = formatContractError(error);
      console.error('Privy write error (userMessage):', formatted.userMessage);
      console.error('Privy write error (debug):', formatted.debug.full);
      throw new Error(formatted.userMessage);
    }
  }

  /**
   * Send a transaction using Privy's RPC API with gas sponsorship
   * Supports both simple transfers and smart contract interactions
   */
  async sendTransactionWithAPI(
    walletId: string,
    address: `0x${string}`,
    contractAddress: `0x${string}`,
    abi: any,
    functionName: string,
    args: any[],
    authSignature: string,
    value: string = '0x0',
    caip2: string = 'eip155:42161' // Arbitrum One by default
  ): Promise<string> {
    try {
      if (!privyClient) {
        throw new Error('Privy client not initialized');
      }

      const appId = process.env.PRIVY_APP_ID;
      const appSecret = process.env.PRIVY_APP_SECRET;

      if (!appId || !appSecret) {
        throw new Error('Privy App ID or App Secret not configured');
      }

      // Encode the contract function call
      const data = encodeFunctionData({
        abi,
        functionName,
        args,
      });

      const url = `https://api.privy.io/v1/wallets/${walletId}/rpc`;

      const MAX_RETRIES = 3;
      let lastErr: any = null;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        // Fetch latest pending nonce
        const nonceBigInt = await publicClient.getTransactionCount({ address, blockTag: 'pending' });
        const nonce = Number(nonceBigInt);

        try {
          console.debug(`Privy API send attempt=${attempt} nonce=${nonce} to=${contractAddress}`);

          // Build transaction params
          const transaction: any = {
            to: contractAddress,
            data,
            value,
            nonce: `0x${nonce.toString(16)}`, // Convert nonce to hex
          };

          const requestBody = {
            method: 'eth_sendTransaction',
            caip2,
            sponsor: true,
            params: {
              transaction,
            },
          };

          // Create Basic Auth header
          const authToken = Buffer.from(`${appId}:${appSecret}`).toString('base64');

          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${authToken}`,
              'privy-app-id': appId,
              'privy-authorization-signature': authSignature,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Privy RPC API error:', errorText);
            throw new Error(`Privy RPC API failed: ${response.status} ${response.statusText}`);
          }

          const result = await response.json() as any;
          
          console.log('Transaction sent successfully via Privy RPC API:', result);

          const hash = result.data || result.hash || result.result;
          return hash;

        } catch (err: any) {
          lastErr = err;
          if (isNonceTooLowError(err) && attempt < MAX_RETRIES) {
            console.warn(`Nonce-too-low detected (attempt ${attempt}). Retrying...`);
            await new Promise((r) => setTimeout(r, 500 * attempt));
            continue;
          }

          const formatted = formatContractError(err);
          console.error('Privy API tx error (userMessage):', formatted.userMessage);
          console.error('Privy API tx error (debug):', formatted.debug.full);
          throw new Error(formatted.userMessage);
        }
      }

      const formatted = formatContractError(lastErr);
      console.error('Privy API tx error (userMessage):', formatted.userMessage);
      console.error('Privy API tx error (debug):', formatted.debug.full);
      throw new Error(formatted.userMessage);

    } catch (error: any) {
      const formatted = formatContractError(error);
      console.error('Privy API tx error (userMessage):', formatted.userMessage);
      console.error('Privy API tx error (debug):', formatted.debug.full);
      throw new Error(formatted.userMessage);
    }
  }
}

export const privyService = new PrivyService();