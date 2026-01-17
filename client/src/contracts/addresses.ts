/**
 * Smart Contract Addresses
 * Deployed on Sepolia Testnet
 */

export const DEPLOYED_ADDRESSES = {
  leagueToken: '0x3a5465DF90106ee3F43BC1f2bAA3d308d73c93C8' as const,
  gameEngine: '0x4aa8954aF87dD5644D79346046EeE0EFaFBCb1A3' as const,
  liquidityPool: '0xDFCb055b55575D2d0D1bFbE5dC96edFFDB852f40' as const,
  bettingPool: '0x14A1C3Ad99bfd75383AB7744Ea8a72bB678CFadc' as const,
  seasonPredictor: '0x65aa43a11D824B9A89c221f6A495211F21F20469' as const,
} as const;

export type ContractAddresses = typeof DEPLOYED_ADDRESSES;


// === DEPLOYMENT SUMMARY ===
//   LeagueToken: 0x3a5465DF90106ee3F43BC1f2bAA3d308d73c93C8
//   GameEngine: 0x4aa8954aF87dD5644D79346046EeE0EFaFBCb1A3
//   LiquidityPool: 0xDFCb055b55575D2d0D1bFbE5dC96edFFDB852f40
//   BettingPool: 0x14A1C3Ad99bfd75383AB7744Ea8a72bB678CFadc
//   SeasonPredictor: 0x65aa43a11D824B9A89c221f6A495211F21F20469