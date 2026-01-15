/**
 * Smart Contract Addresses
 * Deployed on Sepolia Testnet
 */

export const DEPLOYED_ADDRESSES = {
  leagueToken: '0x0954D38B6d2D0B08B3Fa5c15e70e1c83aa536b4b' as const,
  gameEngine: '0x50aE313D59bfB2A651fD99e91e963Cdd2AfA4eDF' as const,
  liquidityPool: '0x052c1fE33D0EBB6642f73F7f8D66Defc0f7C9Fbe' as const,
  bettingPool: '0x47Efc157C738B0AcB31bb37c8c77D73F831Fd441' as const,
  seasonPredictor: '0xf0960b01251c8be7D1E3Fc1758c46E714e6Bf035' as const,
} as const;

export type ContractAddresses = typeof DEPLOYED_ADDRESSES;
