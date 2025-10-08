import { Request, Response } from 'express';
import { privyService } from '../integrations/privy/privy.service';
import { walletService } from '../services/wallet.service';
import { formatUnits } from 'viem';

export class WalletController {
  /**
   * Fetch a wallet by ID
   */
  async getWalletById(req: Request, res: Response): Promise<Response> {
    try {
      const { walletId } = req.params;

      if (!walletId) {
        return res.status(400).json({ error: 'Wallet ID is required' });
      }

      const wallet = await privyService.fetchWalletById(walletId);
      return res.status(200).json({success: true, wallet });
    } catch (error: any) {
      console.error('Error fetching wallet by ID:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Export a wallet's private key
   */
  async exportWalletPrivateKey(req: Request, res: Response): Promise<Response> {
    try {
      const { walletId } = req.params;
      const userJwt = req.headers.authorization?.split(' ')[1];

      if (!walletId) {
        return res.status(400).json({ error: 'Wallet ID is required' });
      }

      if (!userJwt) {
        return res.status(400).json({ error: 'Authorization token is required' });
      }

      const privateKey = await privyService.exportWalletPrivateKey(walletId, userJwt);
      return res.status(200).json({success: true, privateKey });
    } catch (error: any) {
      console.error('Error exporting wallet private key:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get the balance of ETH or LPT for a wallet
   */
  async getTokenBalance(req: Request, res: Response): Promise<Response> {
    try {
      const { walletAddress, token } = req.query;
     

      if (!walletAddress || typeof walletAddress !== 'string') {
        return res.status(400).json({ error: 'Wallet address is required' });
      }

      if (!token || (token !== 'ETH' && token !== 'LPT')) {
        return res.status(400).json({ error: 'Valid token type (ETH or LPT) is required' });
      }

      const balanceWei = await walletService.getTokenBalance(walletAddress as `0x${string}`, token);
      const balance = formatUnits(BigInt(balanceWei), 18); // Convert to bigint and format from wei to ether

      return res.status(200).json({ success: true, balance });
    } catch (error: any) {
      console.error('Error fetching token balance:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const walletController = new WalletController();
