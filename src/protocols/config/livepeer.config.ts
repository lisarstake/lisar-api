export const arbitrumOne = {
  id: 42161,
  name: "Arbitrum One",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://arb1.arbitrum.io/rpc"],
    },
  },
  blockExplorers: {
    default: {
      name: "Arbiscan",
      url: "https://arbiscan.io",
    },
  },
} as const;

export const LIVEPEER_CONTRACTS = {
  arbitrum: {
    proxy: "0x35Bcf3c30594191d53231E4FF333E8A770453e40",
    token: "0x289ba1701C2F088cf0faf8B3705246331cB8A839",
  },
};
