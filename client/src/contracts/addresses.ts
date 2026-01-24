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
  leagueToken: '0xEAe532bb7c4eA133158EF82B0dC1383ED6F91f00' as const,
  gameEngine: '0xB01Cdb788CE759841223d14371caA1e7d61E2429' as const,
  liquidityPool: '0x4FF5636b27746BDFB11A1e933e13B67C4B295dCB' as const,
  bettingPool: '0x1E53A69d39dD198F60FA2b21Fac12C2a56DFCF69' as const,
  seasonPredictor: '0xa85178299BF131bE63F31276D4F46f596001153D' as const,
} as const;

export type ContractAddresses = typeof DEPLOYED_ADDRESSES;



// === DEPLOYMENT SUMMARY ===
//   LeagueToken: 0xEAe532bb7c4eA133158EF82B0dC1383ED6F91f00
//   GameEngine: 0xB01Cdb788CE759841223d14371caA1e7d61E2429
//   LiquidityPool: 0x4FF5636b27746BDFB11A1e933e13B67C4B295dCB
//   BettingPool: 0x1E53A69d39dD198F60FA2b21Fac12C2a56DFCF69
//   SeasonPredictor: 0xa85178299BF131bE63F31276D4F46f596001153D

// === DEPLOYMENT SUMMARY (V2.5 - LATEST DEPLOYMENT) ===
//   LeagueToken: 0xEAe532bb7c4eA133158EF82B0dC1383ED6F91f00
//   GameEngine: 0xB01Cdb788CE759841223d14371caA1e7d61E2429
//   LiquidityPool: 0x4FF5636b27746BDFB11A1e933e13B67C4B295dCB
//   BettingPool: 0x1E53A69d39dD198F60FA2b21Fac12C2a56DFCF69
//   SeasonPredictor: 0xa85178299BF131bE63F31276D4F46f596001153D