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

export interface OnramperWebhookEvent {
  orderId: number;
  eventType: 'onramp' | 'offramp';
  walletAddress: string;
  coinId: number;
  fiatType: number;
  expectedPrice: number;
  actualFiatAmount: number;
  paymentType: number;
  expectedCryptoAmount: number;
  actualPrice: number;
  actualCryptoAmount: number;
  kycNeeded: number;
  createdAt: string;
  updatedAt: string;
  status: number;
  referenceId: string;
  chainId: number;
  onRampFee: number;
  gasFee: number;
  clientFee: number;
  gatewayFee: number;
  transactionHash: string;
  merchantRecognitionId?: string;
  webhookTrials: number;
  coinCode: string;
  network: string;
}

export interface SupabaseWebhookEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  record: any;
  old_record?: any;
}

