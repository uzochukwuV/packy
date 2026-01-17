/**
 * GameEngine Monitoring System
 * Monitors game state and provides admin controls
 */

import { publicClient, walletClient, CONTRACTS, MONITORING_CONFIG, log } from './config';
import { GameEngineABI, BettingPoolABI } from './abis/index.js';

export interface GameState {
  currentSeasonId: bigint;
  currentRoundId: bigint;
  season: {
    seasonId: bigint;
    startTime: bigint;
    currentRound: bigint;
    active: boolean;
    completed: boolean;
    winningTeamId: bigint;
  } | null;
  round: {
    roundId: bigint;
    seasonId: bigint;
    startTime: bigint;
    vrfRequestId: bigint;
    settled: boolean;
  } | null;
  roundSettled: boolean;
  timeUntilRoundEnd?: number;
  shouldRequestVRF: boolean;
  shouldSettleRound: boolean;
}

/**
 * Get current game state
 */
export async function getGameState(): Promise<GameState> {
  try {
    // Read current season and round IDs
    const [currentSeasonId, currentRoundId] = await Promise.all([
      publicClient.readContract({
        address: CONTRACTS.gameEngine,
        abi: GameEngineABI as any,
        functionName: 'getCurrentSeason',
      }) as Promise<bigint>,
      publicClient.readContract({
        address: CONTRACTS.gameEngine,
        abi: GameEngineABI as any,
        functionName: 'getCurrentRound',
      }) as Promise<bigint>,
    ]);

    let season = null;
    let round = null;
    let roundSettled = false;
    let timeUntilRoundEnd = undefined;
    let shouldRequestVRF = false;
    let shouldSettleRound = false;

    // Get season details if exists
    if (currentSeasonId > 0n) {
      season = await publicClient.readContract({
        address: CONTRACTS.gameEngine,
        abi: GameEngineABI as any,
        functionName: 'getSeason',
        args: [currentSeasonId],
      }) as any;
    }

    // Get round details if exists
    if (currentRoundId > 0n) {
      [round, roundSettled] = await Promise.all([
        publicClient.readContract({
          address: CONTRACTS.gameEngine,
          abi: GameEngineABI as any,
          functionName: 'getRound',
          args: [currentRoundId],
        }) as Promise<any>,
        publicClient.readContract({
          address: CONTRACTS.gameEngine,
          abi: GameEngineABI as any,
          functionName: 'isRoundSettled',
          args: [currentRoundId],
        }) as Promise<boolean>,
      ]);

      // Calculate time until round end
      if (round && !roundSettled) {
        const roundStartTime = Number(round.startTime) * 1000; // Convert to ms
        const roundEndTime = roundStartTime + MONITORING_CONFIG.ROUND_DURATION_MS;
        timeUntilRoundEnd = Math.max(0, roundEndTime - Date.now());

        // Should request VRF if round duration has elapsed
        shouldRequestVRF = timeUntilRoundEnd === 0 && round.vrfRequestId === 0n;

        // Should settle round if VRF fulfilled but not settled yet
        if (round.vrfRequestId > 0n && !roundSettled) {
          const vrfRequest = await publicClient.readContract({
            address: CONTRACTS.gameEngine,
            abi: GameEngineABI as any,
            functionName: 'getRequestStatus',
            args: [round.vrfRequestId],
          }) as any;

          shouldSettleRound = vrfRequest[1]; // fulfilled flag
        }
      }
    }

    return {
      currentSeasonId,
      currentRoundId,
      season,
      round,
      roundSettled,
      timeUntilRoundEnd,
      shouldRequestVRF,
      shouldSettleRound,
    };
  } catch (error: any) {
    log(`Failed to get game state: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Start a new season
 */
export async function startSeason(): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    log('Starting new season...');

    const { request } = await publicClient.simulateContract({
      account: walletClient.account,
      address: CONTRACTS.gameEngine,
      abi: GameEngineABI as any,
      functionName: 'startSeason',
    });

    const txHash = await walletClient.writeContract(request);

    await publicClient.waitForTransactionReceipt({ hash: txHash });

    log(`✅ Season started | TX: ${txHash}`);

    return { success: true, txHash };
  } catch (error: any) {
    log(`Failed to start season: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

/**
 * Start a new round
 */
export async function startRound(): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    log('Starting new round...');

    const { request } = await publicClient.simulateContract({
      account: walletClient.account,
      address: CONTRACTS.gameEngine,
      abi: GameEngineABI as any,
      functionName: 'startRound',
    });

    const txHash = await walletClient.writeContract(request);

    await publicClient.waitForTransactionReceipt({ hash: txHash });

    log(`✅ Round started | TX: ${txHash}`);

    return { success: true, txHash };
  } catch (error: any) {
    log(`Failed to start round: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

/**
 * Request VRF randomness for match results
 */
export async function requestMatchResults(enableNativePayment = false): Promise<{
  success: boolean;
  txHash?: string;
  requestId?: bigint;
  error?: string;
}> {
  try {
    log('Requesting VRF for match results...');

    const { request } = await publicClient.simulateContract({
      account: walletClient.account,
      address: CONTRACTS.gameEngine,
      abi: GameEngineABI as any,
      functionName: 'requestMatchResults',
      args: [], // ABI shows no parameters - needs regeneration
    });

    const txHash = await walletClient.writeContract(request);

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    // Extract request ID from event logs
    // For now, we'll return success without request ID
    // In production, parse the VRFRequested event

    log(`✅ VRF requested | TX: ${txHash}`);

    return { success: true, txHash };
  } catch (error: any) {
    log(`Failed to request VRF: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

/**
 * Settle round after VRF fulfillment
 */
export async function settleRound(roundId: bigint): Promise<{
  success: boolean;
  txHash?: string;
  error?: string;
}> {
  try {
    log(`Settling round ${roundId}...`);

    const { request } = await publicClient.simulateContract({
      account: walletClient.account,
      address: CONTRACTS.bettingPool,
      abi: BettingPoolABI as any,
      functionName: 'settleRound',
      args: [roundId],
    });

    const txHash = await walletClient.writeContract(request);

    await publicClient.waitForTransactionReceipt({ hash: txHash });

    log(`✅ Round ${roundId} settled | TX: ${txHash}`);

    return { success: true, txHash };
  } catch (error: any) {
    log(`Failed to settle round: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

/**
 * Seed round pools (must be called before betting starts)
 */
export async function seedRoundPools(roundId: bigint): Promise<{
  success: boolean;
  txHash?: string;
  error?: string;
}> {
  try {
    log(`Seeding pools for round ${roundId}...`);

    const { request } = await publicClient.simulateContract({
      account: walletClient.account,
      address: CONTRACTS.bettingPool,
      abi: BettingPoolABI as any,
      functionName: 'seedRoundPools',
      args: [roundId],
    });

    const txHash = await walletClient.writeContract(request);

    await publicClient.waitForTransactionReceipt({ hash: txHash });

    log(`✅ Round ${roundId} pools seeded | TX: ${txHash}`);

    return { success: true, txHash };
  } catch (error: any) {
    log(`Failed to seed round pools: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

/**
 * Finalize round revenue distribution
 */
export async function finalizeRoundRevenue(roundId: bigint): Promise<{
  success: boolean;
  txHash?: string;
  error?: string;
}> {
  try {
    log(`Finalizing revenue for round ${roundId}...`);

    const { request } = await publicClient.simulateContract({
      account: walletClient.account,
      address: CONTRACTS.bettingPool,
      abi: BettingPoolABI as any,
      functionName: 'finalizeRoundRevenue',
      args: [roundId],
    });

    const txHash = await walletClient.writeContract(request);

    await publicClient.waitForTransactionReceipt({ hash: txHash });

    log(`✅ Round ${roundId} revenue finalized | TX: ${txHash}`);

    return { success: true, txHash };
  } catch (error: any) {
    log(`Failed to finalize round revenue: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

/**
 * Automated monitoring loop (run in background)
 */
let monitoringInterval: NodeJS.Timeout | null = null;

export function startMonitoring() {
  if (monitoringInterval) {
    log('Monitoring already running', 'warn');
    return;
  }

  log('Starting game monitoring system...');

  monitoringInterval = setInterval(async () => {
    try {
      const state = await getGameState();

      // Auto-request VRF if round duration elapsed
      if (state.shouldRequestVRF) {
        log('Round duration elapsed. Auto-requesting VRF...', 'warn');
        await requestMatchResults();
      }

      // Auto-settle round if VRF fulfilled
      if (state.shouldSettleRound && state.currentRoundId > 0n) {
        log('VRF fulfilled. Auto-settling round...', 'warn');
        await settleRound(state.currentRoundId);
      }
    } catch (error: any) {
      log(`Monitoring error: ${error.message}`, 'error');
    }
  }, MONITORING_CONFIG.POLL_INTERVAL_MS);

  log('✅ Game monitoring started');
}

export function stopMonitoring() {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
    log('Game monitoring stopped');
  }
}
