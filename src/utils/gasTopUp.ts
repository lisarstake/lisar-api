import { ethers } from 'ethers';
import { supabase } from '../config/supabase';
import { sendMail } from '../services/email.service';

/**
 * Top up ETH gas for a user's wallet
 * Sends a small amount of ETH to cover initial transaction costs
 */
export async function topUpUserGas(walletAddress: string, userId: string, userEmail?: string): Promise<void> {
  try {
    // Configuration
    const GAS_TOP_UP_AMOUNT = process.env.GAS_TOP_UP_AMOUNT || '0.0001'; // Default 0.0001 ETH
    const FUNDER_PRIVATE_KEY = process.env.GAS_TOPUP_PRIVATE_KEY;
    const RPC_URL = 'https://arb1.arbitrum.io/rpc';

    if (!FUNDER_PRIVATE_KEY) {
      console.error('GAS_TOPUP_PRIVATE_KEY not configured, skipping gas top-up');
      return;
    }

    console.log(`Topping up gas for user ${userId} at wallet ${walletAddress}`);

    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const funderWallet = new ethers.Wallet(FUNDER_PRIVATE_KEY, provider);

    // Check funder wallet balance
    const funderBalance = await provider.getBalance(funderWallet.address);
    const topUpAmountWei = ethers.parseEther(GAS_TOP_UP_AMOUNT);

    console.log('Funder wallet balance:', ethers.formatEther(funderBalance), 'ETH');
    console.log('Top-up amount:', GAS_TOP_UP_AMOUNT, 'ETH');

    if (funderBalance < topUpAmountWei) {
      console.error('Insufficient balance in funder wallet for gas top-up');
      return;
    }

    // Check if user wallet already has sufficient gas
    const userBalance = await provider.getBalance(walletAddress);
    const minBalanceThreshold = ethers.parseEther('0.0005'); // 0.0005 ETH threshold

    if (userBalance >= minBalanceThreshold) {
      console.log(`User wallet already has ${ethers.formatEther(userBalance)} ETH, skipping top-up`);
      return;
    }

    // Send ETH to user wallet
    const tx = await funderWallet.sendTransaction({
      to: walletAddress,
      value: topUpAmountWei
    });

    console.log('Gas top-up transaction sent:', tx.hash);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('Gas top-up confirmed in block:', receipt?.blockNumber);

    // Create transaction record
    if (supabase) {
      try {
        await supabase.from('transactions').insert({
          user_id: userId,
          transaction_hash: tx.hash,
          transaction_type: 'gas_topup',
          amount: GAS_TOP_UP_AMOUNT,
          token_symbol: 'ETH',
          wallet_address: walletAddress,
          status: 'confirmed',
          source: 'gas_funder',
          created_at: new Date().toISOString()
        });
      } catch (dbError) {
        console.error('Failed to record gas top-up transaction:', dbError);
      }
    }

    // Send notification email
    if (userEmail) {
      try {
        await sendMail({
          to: userEmail,
          subject: 'Gas Top-up Received',
          text: `Your wallet has been topped up with ${GAS_TOP_UP_AMOUNT} ETH for gas fees.\n\nWallet: ${walletAddress}\nTransaction: ${tx.hash}`,
          html: `
            <h3>Gas Top-up Received</h3>
            <p>Your wallet has been topped up with <b>${GAS_TOP_UP_AMOUNT} ETH</b> for gas fees.</p>
            <p><strong>Wallet:</strong> <code>${walletAddress}</code></p>
            <p><strong>Transaction:</strong> <code>${tx.hash}</code></p>
            <p>You can now start making transactions on the Arbitrum network!</p>
          `
        });
      } catch (emailError) {
        console.error('Failed to send gas top-up notification email:', emailError);
      }
    }

    console.log(`Successfully topped up ${GAS_TOP_UP_AMOUNT} ETH to ${walletAddress}`);

  } catch (error) {
    console.error('Error topping up gas for user:', error);
    throw error;
  }
}
