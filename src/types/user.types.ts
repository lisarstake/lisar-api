export interface UserWithWallet {
  supabaseUser: {
    id: string;
    email: string;
    email_confirmed_at: string | null;
    user_metadata: any;
  };
  privyUser: {
    id: string;
    custom_user_id: string;
  };
  wallet?: {
    id: string;
    address: string;
    chain_type: string;
  };
  session?: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    expires_at: number;
    token_type: string;
  } | null;
}
