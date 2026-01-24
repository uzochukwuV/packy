/**
 * Web3 Configuration for Backend
 * Manages wallet, RPC, and contract addresses
 */

import { createWalletClient, createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import dotenv from 'dotenv';
dotenv.config();

// Contract addresses on Sepolia (V2.5 - LATEST DEPLOYMENT - January 22, 2026)
export const CONTRACTS = {
  leagueToken: '0xEAe532bb7c4eA133158EF82B0dC1383ED6F91f00' as const,
  gameEngine: '0xB01Cdb788CE759841223d14371caA1e7d61E2429' as const,
  liquidityPool: '0x4FF5636b27746BDFB11A1e933e13B67C4B295dCB' as const,
  bettingPool: '0x1E53A69d39dD198F60FA2b21Fac12C2a56DFCF69' as const,
  seasonPredictor: '0xa85178299BF131bE63F31276D4F46f596001153D' as const,
} as const;

// === DEPLOYMENT SUMMARY ===
//   LeagueToken: 0xEAe532bb7c4eA133158EF82B0dC1383ED6F91f00
//   GameEngine: 0xB01Cdb788CE759841223d14371caA1e7d61E2429
//   LiquidityPool: 0x4FF5636b27746BDFB11A1e933e13B67C4B295dCB
//   BettingPool: 0x1E53A69d39dD198F60FA2b21Fac12C2a56DFCF69
//   SeasonPredictor: 0xa85178299BF131bE63F31276D4F46f596001153D
// Get admin private key from environment
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY as `0x${string}`;

if (!ADMIN_PRIVATE_KEY) {
  throw new Error('ADMIN_PRIVATE_KEY is required in environment variables');
}

// Create admin account
export const adminAccount = privateKeyToAccount(ADMIN_PRIVATE_KEY);

// RPC endpoint - use environment or default to Sepolia public RPC
const RPC_URL = process.env.RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY';

// Public client for reading blockchain data
export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(RPC_URL),
});

// Wallet client for writing transactions (admin operations)
export const walletClient = createWalletClient({
  account: adminAccount,
  chain: sepolia,
  transport: http(RPC_URL),
});

// Faucet configuration
export const FAUCET_CONFIG = {
  // Amount to send per request (in ether)
  FAUCET_AMOUNT: BigInt(1000 * 10 ** 18), // 1000 LEAGUE tokens

  // Cooldown period (1 hour)
  COOLDOWN_MS: 60 * 60 * 1000,

  // Maximum requests per address per day
  MAX_DAILY_REQUESTS: 5,
};

// Game monitoring intervals
export const MONITORING_CONFIG = {
  // Check game state every 30 seconds
  POLL_INTERVAL_MS: 30 * 1000,

  // Round duration from contract (3 hours - UPDATED in V2.5)
  ROUND_DURATION_MS: 3 * 60 * 60 * 1000,

  // Auto-settle delay after VRF request (5 minutes)
  VRF_SETTLEMENT_DELAY_MS: 5 * 60 * 1000,
};

export const log = (message: string, level: 'info' | 'warn' | 'error' = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [WEB3]`;

  switch (level) {
    case 'error':
      console.error(`${prefix} ❌`, message);
      break;
    case 'warn':
      console.warn(`${prefix} ⚠️`, message);
      break;
    default:
      console.log(`${prefix} ℹ️`, message);
  }
};
