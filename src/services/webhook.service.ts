
import { PrivyWebhookEvent, OnramperWebhookEvent, SupabaseWebhookEvent } from '../types/webhook.types';
import { delegationService } from '../services/delegation.service';
import { livepeerService } from '../protocols/services/livepeer.service';
import { supabase } from '../config/supabase';
import { arbitrumOne, LIVEPEER_CONTRACTS } from '../protocols/config/livepeer.config';
import { ethers } from 'ethers';
import { transactionService } from './transaction.service';
import { sendMail } from './email.service';
import { topUpUserGas } from '../utils/gasTopUp';

// Onramper status code mapping
const ONRAMPER_STATUS_CODES: Record<number, string> = {
  [-4]: 'amount mismatch',
  [-3]: 'bank and kyc name mismatch',
  [-2]: 'transaction abandoned',
  [-1]: 'transaction timed out',
  [0]: 'transaction created',
  [1]: 'referenceId claimed',
  [2]: 'deposit secured',
  [3]: 'crypto purchased',
  [4]: 'withdrawal complete',
  [5]: 'webhook sent',
  [11]: 'order placement initiated',
  [12]: 'purchasing crypto',
  [13]: 'crypto purchased',
  [14]: 'withdrawal initiated',
  [15]: 'withdrawal complete',
  [16]: 'webhook sent',
};

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
          await this.handleWalletFundsWithdrawn(event,svixId);
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

    
   console.log('')

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
          .select('user_id, lpt_balance, email')
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

        // Send notification to user about successful deposit
        if (user.email) {
          await sendMail({
            to: user.email,
            subject: 'LPT Deposit Received',
            text: `You have received a deposit of ${amountInEther} LPT.\n\nTransaction Hash: ${transactionHash}`,
            html: `<p>You have received a deposit of <b>${amountInEther} LPT</b>.</p><p>Transaction Hash: <code>${transactionHash}</code></p>`
          });
        }
      } catch (error) {
        console.error('Error processing LPT deposit:', error);
      }
    } else {
      console.log('Non-LPT token deposit, skipping balance update');
    }
  }

  private async handleWalletFundsWithdrawn(event: PrivyWebhookEvent, svix_id: string): Promise<void> {
    // Privy withdrawal webhook sample includes: amount, asset.address, recipient, sender, transaction_hash, wallet_id
   
    const eventData: any = event || {};

    const walletId = eventData.wallet_id;
    const amount = eventData.amount;
    const tokenAddress = eventData.asset?.address;
    const txHash = eventData.transaction_hash;
    const sender = eventData.sender;
    const recipient = eventData.recipient;

    try {
      if (!supabase) {
        console.error('Supabase client not initialized');
        return;
      }

      // Resolve user by wallet_id
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('user_id, email, lpt_balance, wallet_address')
        .eq('wallet_id', walletId)
        .maybeSingle();

      if (userError) {
        console.error('Error finding user by wallet_id for withdrawal:', userError);
      }

      const userId = user && (user as any).user_id ? (user as any).user_id : 'unknown';

      // If this is an LPT withdrawal, update user's LPT balance
      const lptTokenAddress = LIVEPEER_CONTRACTS.arbitrum.token?.toLowerCase();
      let amountInEther = null as string | null;
      if (tokenAddress && lptTokenAddress && tokenAddress.toLowerCase() === lptTokenAddress) {
        try {
          amountInEther = ethers.formatEther(amount);
          const currentBalance = (user && (user as any).lpt_balance) || 0;
          const newBalance = Math.max(0, Number(currentBalance) - parseFloat(amountInEther));

          const { error: updateError } = await supabase
            .from('users')
            .update({ lpt_balance: newBalance })
            .eq('user_id', userId);

          if (updateError) {
            console.error('Error updating user LPT balance after withdrawal:', updateError);
          } else {
            console.log(`Updated LPT balance for user ${userId}: -${amountInEther}, newBalance=${newBalance}`);
          }
        } catch (err) {
          console.error('Failed to parse LPT withdrawal amount:', err);
        }
      }

      // Create a transaction record for the withdrawal
      const txPayload: any = {
        user_id: userId,
        transaction_hash: txHash || '',
        transaction_type: 'withdrawal',
        amount: amountInEther ?? (amount ? String(amount) : '0'),
        token_address: tokenAddress,
        token_symbol: lptTokenAddress && tokenAddress && tokenAddress.toLowerCase() === lptTokenAddress ? 'LPT' : undefined,
        wallet_address: (user && (user as any).wallet_address) || sender || undefined,
        wallet_id: walletId,
        status: 'confirmed',
        source: 'privy_webhook',
      };

      const transactionResult = await transactionService.createTransaction(txPayload);
      if (!transactionResult.success) {
        console.error('Error creating withdrawal transaction record:', transactionResult.error);
      } else {
        console.log('Withdrawal transaction recorded:', transactionResult.data?.id || txHash);
      }

      // Notify user by email if available
      if (user && (user as any).email) {
        try {
          await sendMail({
            to: (user as any).email,
            subject: 'LPT Withdrawal processed',
            text: `A withdrawal of ${txPayload.amount} ${txPayload.token_symbol || ''} was processed from your wallet.\n\nTransaction: ${txHash}\nRecipient: ${recipient}`,
            html: `<p>A withdrawal of <b>${txPayload.amount} ${txPayload.token_symbol || ''}</b> was processed from your wallet.</p><p>Transaction: <code>${txHash}</code></p><p>Recipient: <code>${recipient}</code></p>`,
          });
        } catch (mailErr) {
          console.error('Failed to send withdrawal notification email:', mailErr);
        }
      } else {
        console.log('No user/email found for wallet_id', walletId, '; skipping email notification');
      }
    } catch (error) {
      console.error('Error processing wallet funds withdrawn webhook:', error);
    }
  }

  /**
   * Handle Onramper webhook events
   * Processes completed onramp transactions
   */
  async handleOnramperWebhook(event: OnramperWebhookEvent): Promise<void> {
    try {
      const statusDesc = ONRAMPER_STATUS_CODES[event.status] || 'unknown status';
      console.log('Processing Onramper webhook:', {
        orderId: event.orderId,
        status: event.status,
        statusDesc,
        walletAddress: event.walletAddress,
        fiatType: event.fiatType,
        coinCode: event.coinCode,
        network: event.network,
        actualCryptoAmount: event.actualCryptoAmount,
        actualFiatAmount: event.actualFiatAmount,
        transactionHash: event.transactionHash,
        eventType: event.eventType
      });

      // Check for duplicate webhook processing using orderId
      if (!supabase) {
        console.error('Supabase client not initialized');
        return;
      }

      const { data: existingTransaction, error: duplicateError } = await supabase
        .from('transactions')
        .select('id')
        .eq('transaction_hash', event.transactionHash)
        .eq('source', 'onramp')
        .maybeSingle();

      if (duplicateError) {
        console.error('Error checking for duplicate Onramper webhook:', duplicateError);
        return;
      }

      if (existingTransaction) {
        console.log('Onramper webhook already processed, skipping orderId:', event.orderId);
        return;
      }

      // Log and branch on all status codes
      switch (event.status) {
        case -4: // amount mismatch
        case -3: // bank and kyc name mismatch
        case -2: // transaction abandoned
        case -1: // transaction timed out
        case 0:  // transaction created
        case 1:  // referenceId claimed
        case 2:  // deposit secured
        case 11: // order placement initiated
        case 12: // purchasing crypto
        case 14: // withdrawal initiated
          // Log and skip processing for these statuses
          console.log(`Onramper status ${event.status}: ${statusDesc}. No transaction record created.`);
          return;
        case 3:
        case 13:
          // Crypto purchased (but not withdrawn yet)
          console.log(`Onramper status ${event.status}: ${statusDesc}. Crypto purchased, not yet withdrawn.`);
          // Optionally, you could record a pending transaction here
          return;
        case 4:
        case 5:
        case 15:
        case 16:
          // Withdrawal complete or webhook sent: process as successful deposit
          break;
        default:
          console.log(`Onramper status ${event.status}: ${statusDesc}. Unhandled status.`);
          return;
      }

      // Find user by wallet address (guard for undefined walletAddress)
      const walletAddressSafe = event.walletAddress ? event.walletAddress.toLowerCase() : null;
      let user: any = null;
      let userError: any = null;
      if (walletAddressSafe) {
        // Use case-insensitive match to find wallet regardless of casing (addresses may be mixed-case)
        // Use PostgREST filter with ILIKE which is case-insensitive
        const resp = await supabase
          .from('users')
          .select('user_id, wallet_address, email')
          .filter('wallet_address', 'ilike', walletAddressSafe)
          .maybeSingle();
        user = resp.data;
        userError = resp.error;
      }

      if (userError) {
        console.error('Error finding user by wallet address:', userError);
        return;
      }

      if (!user) {
        console.log('No user found with wallet address:', event.walletAddress);
        // Still create a transaction record for tracking purposes
      }

      // Safe coin code and amount handling to avoid crashes when fields are missing
      const coinCodeSafe = event.coinCode || 'unknown';
      const tokenSymbolSafe = coinCodeSafe.toUpperCase();
      const tokenAddressSafe = event.coinCode || (event.coinId ? String(event.coinId) : 'unknown');
      const amountSafe = event.actualCryptoAmount != null ? String(event.actualCryptoAmount) : '0';

      // Create transaction record - build payload and include metadata only when available
      const txPayload: any = {
        user_id: user?.user_id || 'unknown',
        transaction_hash: event.transactionHash || '',
        transaction_type: 'deposit',
        amount: amountSafe,
        token_address: tokenAddressSafe,
        token_symbol: tokenSymbolSafe,
        wallet_address: event.walletAddress || undefined,
        created_at: event.createdAt || undefined,
        order_id: event.orderId,
        event_type: event.eventType,
        coin_id: event.coinId,
        fiat_type: event.fiatType,
        fiat_amount: event.actualFiatAmount,
        payment_type: event.paymentType,
        actual_price: event.actualPrice,
        reference_id: event.merchantRecognitionId,
        chain_id: event.chainId,
        network: event.network,
        status: 'confirmed',
        source: 'onramp'
      };


      const transactionResult = await transactionService.createTransaction(txPayload);

      if (!transactionResult.success) {
        console.error('Error creating Onramper transaction record:', transactionResult.error);
        throw new Error(transactionResult.error);
      }

      console.log('Onramper transaction recorded successfully:', {
        orderId: event.orderId,
        userId: user?.user_id,
        transactionHash: event.transactionHash,
        amount: event.actualCryptoAmount,
        coinCode: event.coinCode
      });

      // Optionally notify user
      if (user?.email) {
        try {
          await sendMail({
            to: user.email,
            subject: 'Onramp deposit received',
            text: `We received ${amountSafe} ${tokenSymbolSafe} to your wallet ${event.walletAddress}. Order: ${event.orderId}`,
            html: `<p>We received <b>${amountSafe} ${tokenSymbolSafe}</b> to your wallet <code>${event.walletAddress}</code>.</p><p>Order: <code>${event.orderId}</code></p>`
          });
        } catch (mailErr) {
          console.error('Failed to send onramp notification email:', mailErr);
        }
      }

    } catch (error) {
      console.error('Error handling Onramper webhook:', error);
      throw error;
    }
  }

  /**
   * Handle generic Supabase database webhooks
   * Routes to specific handlers based on table and event type
   */
  async handleSupabaseWebhook(event: SupabaseWebhookEvent): Promise<void> {
    try {
      const { type, table, record } = event;

      console.log('Processing Supabase webhook:', { type, table });

      // Route to specific handlers based on table and event type
      if (table === 'users' && type === 'INSERT') {
        await this.handleSupabaseUserCreated(event);
      } else if (table === 'users' && type === 'UPDATE') {
        await this.handleSupabaseUserUpdated(event);
      } else if (table === 'transactions' && type === 'INSERT') {
        await this.handleSupabaseTransactionCreated(event);
      } else {
        console.log(`No handler for Supabase webhook: ${table}.${type}`);
      }

    } catch (error) {
      console.error('Error handling Supabase webhook:', error);
      throw error;
    }
  }

  /**
   * Handle Supabase webhook for new user creation
   * Processes user onboarding tasks when a new user is added to the users table
   */
  private async handleSupabaseUserCreated(event: SupabaseWebhookEvent): Promise<void> {
    try {
      const { type, table, record } = event;
      console.log('Handling Supabase user created event:',  table);

      // Validate event type and table
      if (type !== 'INSERT' || table !== 'users') {
        console.log('Skipping non-INSERT or non-users event:', { type, table });
        return;
      }

      const user = record;
      
      // 1. Send welcome email
      if (user.email) {
        try {
          await sendMail({
            to: user.email,
            subject: 'Welcome to LISAR!',
            text: `Welcome to LISAR! Your account has been successfully created.\n\nUser ID: ${user.user_id}\nWallet Address: ${user.wallet_address || 'Not set'}`,
            html: `
              <h2>Welcome to LISAR!</h2>
              <p>Your account has been successfully created.</p>
              <p><strong>User ID:</strong> <code>${user.user_id}</code></p>
              ${user.username ? `<p><strong>Username:</strong> ${user.username}</p>` : ''}
              <p><strong>Wallet Address:</strong> <code>${user.wallet_address || 'Not set'}</code></p>
              <p>Start exploring our platform and manage your delegations!</p>
            `
          });
          console.log('Welcome email sent to:', user.email);
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
          // Don't throw - continue processing other tasks
        }
      }

      // 2. Create welcome notification for new user
      if (!supabase) {
        console.error('Supabase client not initialized');
        return;
      }

      try {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: user.user_id,
            type: 'welcome',
            title: 'Welcome to LISAR',
            message: 'Your account has been created successfully. Start by exploring our delegation features!',
            is_read: false,
            created_at: new Date().toISOString()
          });

        if (notificationError) {
          console.error('Failed to create welcome notification:', notificationError);
        } else {
          console.log('Welcome notification created for user:', user.user_id);
        }
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
      }


      // 4. Top up ETH gas for new user wallet
      if (user.wallet_address) {
        try {
          await topUpUserGas(user.wallet_address, user.user_id, user.email);
        } catch (gasError) {
          console.error('Failed to top up gas for new user:', gasError);
          // Don't throw - gas top-up failure shouldn't block onboarding
        }
      } else {
        console.log('No wallet address for user, skipping gas top-up');
      }

      // TODO: Add additional onboarding logic here:
      // - Sync to external CRM or analytics service
      // - Initialize user preferences
      // - Track user registration metrics
      // - Set up default notification settings

    } catch (error) {
      console.error('Error handling Supabase user created webhook:', error);
      throw error;
    }
  }

  /**
   * Handle Supabase webhook for user updates
   */
  private async handleSupabaseUserUpdated(event: SupabaseWebhookEvent): Promise<void> {
    try {
      const { record, old_record } = event;
      console.log('User updated:', {
        userId: record.user_id,
        changes: old_record ? this.getChangedFields(old_record, record) : 'N/A'
      });

      // TODO: Add logic for user updates
      // - Send notification for important profile changes
      // - Log security-relevant changes (email, 2FA status)
      // - Sync updates to external services

    } catch (error) {
      console.error('Error handling Supabase user updated webhook:', error);
      throw error;
    }
  }

  /**
   * Handle Supabase webhook for new transaction creation
   */
  private async handleSupabaseTransactionCreated(event: SupabaseWebhookEvent): Promise<void> {
    try {
      const { record } = event;
      console.log('Transaction created:', {
        transactionId: record.id,
        userId: record.user_id,
        type: record.transaction_type,
        amount: record.amount
      });

      // TODO: Add logic for new transactions
      // - Send notification to user
      // - Update analytics/reporting
      // - Trigger downstream workflows

    } catch (error) {
      console.error('Error handling Supabase transaction created webhook:', error);
      throw error;
    }
  }

  /**
   * Helper to identify changed fields between old and new record
   */
  private getChangedFields(oldRecord: any, newRecord: any): string[] {
    const changes: string[] = [];
    for (const key in newRecord) {
      if (oldRecord[key] !== newRecord[key]) {
        changes.push(key);
      }
    }
    return changes;
  }
}

export const webhookService = new WebhookService();

