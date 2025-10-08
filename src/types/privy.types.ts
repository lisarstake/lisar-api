export type PrivyUser = {
  id: string;
  created_at: number;
  linked_accounts: any[];
};

export type PrivyWallet = {
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
