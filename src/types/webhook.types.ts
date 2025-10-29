export interface PrivyWebhookEvent {
  id: string;
  type: 'transaction.confirmed' | 'transaction.failed' | 'user.created' | 'user.authenticated' | 
        'user.linked_account' | 'user.unlinked_account' | 'user.updated_account' | 
        'user.transferred_account' | 'user.wallet_created' | 'mfa.enabled' | 'mfa.disabled' | 
        'private_key.exported' | 'wallet.recovery_setup' | 'wallet.recovered' | 
        'wallet.funds_deposited' | 'wallet.funds_withdrawn';
  data: {
    // Transaction-specific data
    walletId?: string;
    transactionHash?: string;
    status?: 'confirmed' | 'failed';
    chainId?: number;
    from?: string;
    to?: string;
    value?: string;
    contractCall?: {
      functionName: string;
      args: any[];
    };
    // User-specific data
    userId?: string;
    email?: string;
    phone?: string;
    walletAddress?: string;
    walletType?: 'embedded_wallet' | 'smart_wallet';
    // Account linking data
    linkedAccount?: {
      type: string;
      address?: string;
    };
    // MFA data
    mfaMethod?: string;
    // Recovery data
    recoveryMethod?: string;
    // Funds data
    amount?: string;
    tokenAddress?: string;
    tokenSymbol?: string;
  };
  createdAt: string;
}
