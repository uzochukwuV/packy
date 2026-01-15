/**
 * Web3 Configuration for Backend
 * Manages wallet, RPC, and contract addresses
 */

import { createWalletClient, createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

// Contract addresses on Sepolia
export const CONTRACTS = {
  leagueToken: '0x0954D38B6d2D0B08B3Fa5c15e70e1c83aa536b4b' as const,
  gameEngine: '0x50aE313D59bfB2A651fD99e91e963Cdd2AfA4eDF' as const,
  liquidityPool: '0x052c1fE33D0EBB6642f73F7f8D66Defc0f7C9Fbe' as const,
  bettingPool: '0x47Efc157C738B0AcB31bb37c8c77D73F831Fd441' as const,
  seasonPredictor: '0xf0960b01251c8be7D1E3Fc1758c46E714e6Bf035' as const,
} as const;

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

  // Round duration from contract (15 minutes)
  ROUND_DURATION_MS: 15 * 60 * 1000,

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
