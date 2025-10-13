import { PrivyWebhookEvent } from '../types/webhook.types';
import { delegationService } from '../services/delegation.service';
import { livepeerService } from '../protocols/services/livepeer.service';
import { supabase } from '../config/supabase';
import { LIVEPEER_CONTRACTS } from '../protocols/config/livepeer.config';
import { ethers } from 'ethers';
import { transactionService } from './transaction.service';

export class WebhookService {
  async handlePrivyWebhook(event: PrivyWebhookEvent, svixId: string): Promise<void> {
    try {
      switch (event.type) {
        // Transaction events
        case 'transaction.confirmed':
          await this.handleTransactionConfirmed(event);
          break;
        case 'transaction.failed':
          await this.handleTransactionFailed(event);
          break;
        
        // User lifecycle events
        case 'user.created':
          await this.handleUserCreated(event);
          break;
        case 'user.authenticated':
          await this.handleUserAuthenticated(event);
          break;
        case 'user.linked_account':
          await this.handleUserLinkedAccount(event);
          break;
        case 'user.unlinked_account':
          await this.handleUserUnlinkedAccount(event);
          break;
        case 'user.updated_account':
          await this.handleUserUpdatedAccount(event);
          break;
        case 'user.transferred_account':
          await this.handleUserTransferredAccount(event);
          break;
        case 'user.wallet_created':
          await this.handleUserWalletCreated(event);
          break;
        
        // MFA events
        case 'mfa.enabled':
          await this.handleMfaEnabled(event);
          break;
        case 'mfa.disabled':
          await this.handleMfaDisabled(event);
          break;
        
        // Wallet security events
        case 'private_key.exported':
          await this.handlePrivateKeyExported(event);
          break;
        case 'wallet.recovery_setup':
          await this.handleWalletRecoverySetup(event);
          break;
        case 'wallet.recovered':
          await this.handleWalletRecovered(event);
          break;
        case 'wallet.funds_deposited':
          await this.handleWalletFundsDeposited(event, svixId);
          break;
        case 'wallet.funds_withdrawn':
          await this.handleWalletFundsWithdrawn(event);
          break;
        
        default:
          console.log('Unhandled webhook event type:', event.type);
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }

  private async handleTransactionConfirmed(event: PrivyWebhookEvent): Promise<void> {
    const { transactionHash, contractCall, walletId } = event.data;
    console.log('Transaction confirmed:', transactionHash);

    // Handle specific contract interactions
    if (contractCall) {
      switch (contractCall.functionName) {
        case 'approve':
          // Handle token approval confirmation
          console.log('Token approval confirmed for wallet:', walletId);
          break;
        case 'bond':
          // Handle successful delegation
          console.log('Delegation confirmed for wallet:', walletId);
          // You might want to update the delegation status in your database
          break;
        case 'unbond':
          // Handle successful unbonding
          console.log('Unbonding confirmed for wallet:', walletId);
          // You might want to update the delegation status in your database
          break;
      }
    }
  }

  private async handleTransactionFailed(event: PrivyWebhookEvent): Promise<void> {
    const { transactionHash, contractCall, walletId } = event.data;
    console.error('Transaction failed:', transactionHash);

    // Handle specific contract interaction failures
    if (contractCall) {
      switch (contractCall.functionName) {
        case 'approve':
          // Handle token approval failure
          console.error('Token approval failed for wallet:', walletId);
          break;
        case 'bond':
          // Handle delegation failure
          console.error('Delegation failed for wallet:', walletId);
          break;
        case 'unbond':
          // Handle unbonding failure
          console.error('Unbonding failed for wallet:', walletId);
          break;
      }
    }
  }

  // User lifecycle event handlers
  private async handleUserCreated(event: PrivyWebhookEvent): Promise<void> {
    const { userId, email, phone } = event.data;
    console.log('User created:', { userId, email, phone });
    // TODO: Add user to your database, send welcome email, etc.
  }

  private async handleUserAuthenticated(event: PrivyWebhookEvent): Promise<void> {
    const { userId } = event.data;
    console.log('User authenticated:', userId);
    // TODO: Update last login timestamp, track user activity, etc.
  }

  private async handleUserLinkedAccount(event: PrivyWebhookEvent): Promise<void> {
    const { userId, linkedAccount } = event.data;
    console.log('User linked account:', { userId, linkedAccount });
    // TODO: Update user profile with new linked account
  }

  private async handleUserUnlinkedAccount(event: PrivyWebhookEvent): Promise<void> {
    const { userId, linkedAccount } = event.data;
    console.log('User unlinked account:', { userId, linkedAccount });
    // TODO: Remove linked account from user profile
  }

  private async handleUserUpdatedAccount(event: PrivyWebhookEvent): Promise<void> {
    const { userId, email, phone } = event.data;
    console.log('User updated account:', { userId, email, phone });
    // TODO: Update user profile in database
  }

  private async handleUserTransferredAccount(event: PrivyWebhookEvent): Promise<void> {
    const { userId } = event.data;
    console.log('User transferred account:', userId);
    // TODO: Handle account transfer logic
  }

  private async handleUserWalletCreated(event: PrivyWebhookEvent): Promise<void> {
    const { userId, walletAddress, walletType } = event.data;
    console.log('Wallet created for user:', { userId, walletAddress, walletType });
    // TODO: Store wallet information in database, notify user, etc.
  }

  // MFA event handlers
  private async handleMfaEnabled(event: PrivyWebhookEvent): Promise<void> {
    const { userId, mfaMethod } = event.data;
    console.log('MFA enabled for user:', { userId, mfaMethod });
    // TODO: Update user security settings, send notification
  }

  private async handleMfaDisabled(event: PrivyWebhookEvent): Promise<void> {
    const { userId, mfaMethod } = event.data;
    console.log('MFA disabled for user:', { userId, mfaMethod });
    // TODO: Update user security settings, send security alert
  }

  // Wallet security event handlers
  private async handlePrivateKeyExported(event: PrivyWebhookEvent): Promise<void> {
    const { userId, walletAddress } = event.data;
    console.log('Private key exported:', { userId, walletAddress });
    // TODO: Log security event, send security alert to user
  }

  private async handleWalletRecoverySetup(event: PrivyWebhookEvent): Promise<void> {
    const { userId, walletAddress, recoveryMethod } = event.data;
    console.log('Wallet recovery setup:', { userId, walletAddress, recoveryMethod });
    // TODO: Update wallet security settings
  }

  private async handleWalletRecovered(event: PrivyWebhookEvent): Promise<void> {
    const { userId, walletAddress, recoveryMethod } = event.data;
    console.log('Wallet recovered:', { userId, walletAddress, recoveryMethod });
    // TODO: Log recovery event, send notification to user
  }

  private async handleWalletFundsDeposited(event: PrivyWebhookEvent, svixId: string): Promise<void> {

    // For the actual webhook event structure, extract from the event object directly
    const eventData = event as any;
    const depositAmount = eventData.amount;
    const assetAddress = eventData.asset?.address;
    const recipientAddress = eventData.recipient;
    const walletId = eventData.wallet_id;
    const transactionHash = eventData.transaction_hash;
    
    console.log('Funds deposited to webhook:', { 
      svixId,
      walletId,
      recipientAddress,
      depositAmount,
      assetAddress,
      transactionHash
    });

    // Check for duplicate webhook processing using svixId
    if (!supabase) {
      console.error('Supabase client not initialized');
      return;
    }

    const { data: existingTransaction, error: duplicateError } = await supabase
      .from('transactions')
      .select('id')
      .eq('svix_id', svixId)
      .maybeSingle();

    if (duplicateError) {
      console.error('Error checking for duplicate webhook:', duplicateError);
      return;
    }

    if (existingTransaction) {
      console.log('Webhook already processed, skipping:', svixId);
      return;
    }

    // Check if this is an LPT token deposit
    const lptTokenAddress = LIVEPEER_CONTRACTS.arbitrum.token.toLowerCase();
    if (assetAddress && assetAddress.toLowerCase() === lptTokenAddress) {
      console.log('LPT token deposit detected');
      
      try {
        if (!supabase) {
          console.error('Supabase client not initialized');
          return;
        }

        // Find user by wallet_id instead of wallet_address
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('user_id, lpt_balance')
          .eq('wallet_id', walletId)
          .maybeSingle();

        if (userError) {
          console.error('Error finding user by wallet_id:', userError);
          return;
        }

        if (!user) {
          console.log('No user found with wallet_id:', walletId);
          return;
        }

        // Convert amount from wei to ether (LPT has 18 decimals)
        const amountInEther = ethers.formatEther(depositAmount);
        const currentBalance = user.lpt_balance || 0;
        const newBalance = currentBalance + parseFloat(amountInEther);

        // Update user's LPT balance
        const { error: updateError } = await supabase
          .from('users')
          .update({ lpt_balance: newBalance })
          .eq('user_id', user.user_id);

        if (updateError) {
          console.error('Error updating user LPT balance:', updateError);
          return;
        }

        console.log(`Successfully updated LPT balance for user ${user.user_id}:`, {
          previousBalance: currentBalance,
          depositAmount: amountInEther,
          newBalance: newBalance,
          transactionHash
        });

        // Create transaction record using transaction service
        const transactionResult = await transactionService.createTransaction({
          user_id: user.user_id,
          transaction_hash: transactionHash,
          transaction_type: 'deposit',
          amount: amountInEther,
          token_address: assetAddress,
          token_symbol: 'LPT',
          wallet_address: recipientAddress,
          wallet_id: walletId,
          status: 'confirmed',
          source: 'privy_webhook',
          svix_id: svixId
        });

        if (!transactionResult.success) {
          console.error('Error creating transaction record:', transactionResult.error);
          // Don't return here - balance update was successful, just log the error
        } else {
          console.log('Transaction record created successfully for user:', user.user_id);
        }

        // TODO: Send notification to user about successful deposit
        
      } catch (error) {
        console.error('Error processing LPT deposit:', error);
      }
    } else {
      console.log('Non-LPT token deposit, skipping balance update');
    }
  }

  private async handleWalletFundsWithdrawn(event: PrivyWebhookEvent): Promise<void> {
    const { userId, walletAddress, amount, tokenAddress, tokenSymbol } = event.data;
    console.log('Funds withdrawn from wallet:', { 
      userId, 
      walletAddress, 
      amount, 
      tokenAddress, 
      tokenSymbol 
    });
    // TODO: Update wallet balance in database, notify user of withdrawal
  }
}

export const webhookService = new WebhookService();
