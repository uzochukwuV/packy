/**
 * Smart Contract Addresses
 * Deployed on Sepolia Testnet - V2.5 (January 22, 2026)
 *
 * KEY UPDATES in V2.5:
 * - Round duration: 15 minutes → 3 hours
 * - Unified LP pool model with 5% protocol fee
 * - Reduced parlay multipliers (1.0x - 1.25x)
 * - Count-based parlay tiers for FOMO mechanics
 * - Enhanced liquidity pool with AMM-style shares
 */

export const DEPLOYED_ADDRESSES = {
  leagueToken: '0x48Ce9cAD6130206f733E693cC789Ef56e27d994f' as const,
  gameEngine: '0x93b78E4b92a7e6b52Ed229C7D592CF41Fd43F459' as const,
  liquidityPool: '0x54803f1e4aF71b0BFB40E66c2f78C8532D58Fd77' as const,
  bettingPool: '0xA98052b027818d26374eB46e7FbBCeDde2e19533' as const,
  seasonPredictor: '0xE75464943564907a2fa160050Af9494EAed39607' as const,
} as const;

export type ContractAddresses = typeof DEPLOYED_ADDRESSES;


// === DEPLOYMENT SUMMARY (V2.5) ===
//   LeagueToken: 0x48Ce9cAD6130206f733E693cC789Ef56e27d994f
//   GameEngine: 0x93b78E4b92a7e6b52Ed229C7D592CF41Fd43F459
//   LiquidityPool: 0x54803f1e4aF71b0BFB40E66c2f78C8532D58Fd77
//   BettingPool: 0xA98052b027818d26374eB46e7FbBCeDde2e19533
//   SeasonPredictor: 0xE75464943564907a2fa160050Af9494EAed39607