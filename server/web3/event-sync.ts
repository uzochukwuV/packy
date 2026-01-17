/**
 * Blockchain Event Synchronization
 * Listens to GameEngine events and syncs data to database
 */

import { publicClient, CONTRACTS, log } from './config';
import { GameEngineABI } from './abis/index';
import { storage } from '../storage';

// Team names (matching contract initialization)
const TEAM_NAMES = [
  "Manchester Virtual",
  "Liverpool Digital",
  "Chelsea Crypto",
  "Arsenal Web3",
  "Tottenham Chain",
  "Manchester Block",
  "Newcastle Node",
  "Brighton Token",
  "Aston Meta",
  "West Ham Hash",
  "Everton Ether",
  "Leicester Link",
  "Wolves Wallet",
  "Crystal Palace Protocol",
  "Fulham Fork",
  "Brentford Bridge",
  "Bournemouth Bytes",
  "Nottingham NFT",
  "Southampton Smart",
  "Leeds Ledger",
];

/**
 * Get team name by ID
 */
function getTeamName(teamId: number): string {
  return TEAM_NAMES[teamId] || `Team ${teamId}`;
}

/**
 * Convert contract outcome enum to string
 * 0 = PENDING, 1 = HOME_WIN, 2 = AWAY_WIN, 3 = DRAW
 */
function getOutcome(outcomeValue: number): string {
  switch (outcomeValue) {
    case 0: return 'pending';
    case 1: return 'home_win';
    case 2: return 'away_win';
    case 3: return 'draw';
    default: return 'pending';
  }
}

/**
 * Sync round data from blockchain when RoundStarted event fires
 */
export async function syncRoundStart(roundId: bigint, seasonId: bigint, startTime: bigint) {
  try {
    log(`Syncing round ${roundId} start to database...`);

    // Check if round already exists
    const existing = await storage.getRoundById(roundId.toString());
    if (existing) {
      log(`Round ${roundId} already exists in database`, 'warn');
      return;
    }

    // Fetch match data from blockchain
    const matches = await publicClient.readContract({
      address: CONTRACTS.gameEngine,
      abi: GameEngineABI as any,
      functionName: 'getRoundMatches',
      args: [roundId],
    }) as any[];

    // Save round to database
    const roundStartDate = new Date(Number(startTime) * 1000);
    const roundEndDate = new Date(Number(startTime) * 1000 + 15 * 60 * 1000); // 15 minutes later

    await storage.saveRound({
      roundId: roundId.toString(),
      seasonId: seasonId.toString(),
      startTime: roundStartDate,
      endTime: roundEndDate,
      settled: false,
      isActive: true,
    });

    // Save matches with their initial state
    const matchRecords = matches.map((match: any, index: number) => ({
      roundId: roundId.toString(),
      matchIndex: index,
      homeTeamId: Number(match.homeTeamId),
      awayTeamId: Number(match.awayTeamId),
      homeTeamName: getTeamName(Number(match.homeTeamId)),
      awayTeamName: getTeamName(Number(match.awayTeamId)),
      homeScore: match.homeScore ? Number(match.homeScore) : null,
      awayScore: match.awayScore ? Number(match.awayScore) : null,
      homeOdds: match.homeOdds?.toString(),
      awayOdds: match.awayOdds?.toString(),
      drawOdds: match.drawOdds?.toString(),
      outcome: getOutcome(Number(match.outcome)),
      settled: false,
    }));

    await storage.saveMatches(matchRecords);

    log(`✅ Round ${roundId} and ${matchRecords.length} matches synced to database`);
  } catch (error: any) {
    log(`Failed to sync round ${roundId}: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Sync match results when VRF is fulfilled
 */
export async function syncVRFFulfilled(requestId: bigint, roundId: bigint) {
  try {
    log(`Syncing VRF fulfillment for round ${roundId}...`);

    // Update round VRF status
    await storage.updateRound(roundId.toString(), {
      vrfRequestId: requestId.toString(),
      vrfFulfilledAt: new Date(),
    });

    // Fetch updated matches with results from blockchain
    const matches = await publicClient.readContract({
      address: CONTRACTS.gameEngine,
      abi: GameEngineABI as any,
      functionName: 'getRoundMatches',
      args: [roundId],
    }) as any[];

    // Update each match with scores and outcomes
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      await storage.updateMatch(roundId.toString(), i, {
        homeScore: Number(match.homeScore),
        awayScore: Number(match.awayScore),
        outcome: getOutcome(Number(match.outcome)),
        settled: match.settled,
        settledAt: match.settled ? new Date() : undefined,
      });
    }

    log(`✅ Round ${roundId} results synced after VRF fulfillment`);
  } catch (error: any) {
    log(`Failed to sync VRF results for round ${roundId}: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Mark round as settled in database
 */
export async function syncRoundSettled(roundId: bigint) {
  try {
    log(`Marking round ${roundId} as settled...`);

    await storage.updateRound(roundId.toString(), {
      settled: true,
      settledAt: new Date(),
      isActive: false,
    });

    log(`✅ Round ${roundId} marked as settled in database`);
  } catch (error: any) {
    log(`Failed to mark round ${roundId} as settled: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Start listening to blockchain events
 */
export function startEventListeners() {
  log('Starting blockchain event listeners...');

  // Listen for RoundStarted event
  publicClient.watchContractEvent({
    address: CONTRACTS.gameEngine,
    abi: GameEngineABI as any,
    eventName: 'RoundStarted',
    onLogs: async (logs: any[]) => {
      for (const eventLog of logs) {
        const { roundId, seasonId, startTime } = eventLog.args as any;
        await syncRoundStart(roundId, seasonId, startTime);
      }
    },
    onError: (error: any) => {
      log(`RoundStarted event error: ${error.message}`, 'error');
    },
  });

  // Listen for VRFFulfilled event
  publicClient.watchContractEvent({
    address: CONTRACTS.gameEngine,
    abi: GameEngineABI as any,
    eventName: 'VRFFulfilled',
    onLogs: async (logs: any[]) => {
      for (const eventLog of logs) {
        const { requestId, roundId } = eventLog.args as any;
        await syncVRFFulfilled(requestId, roundId);
      }
    },
    onError: (error: any) => {
      log(`VRFFulfilled event error: ${error.message}`, 'error');
    },
  });

  // Listen for RoundSettled event
  publicClient.watchContractEvent({
    address: CONTRACTS.gameEngine,
    abi: GameEngineABI as any,
    eventName: 'RoundSettled',
    onLogs: async (logs: any[]) => {
      for (const eventLog of logs) {
        const { roundId } = eventLog.args as any;
        await syncRoundSettled(roundId);
      }
    },
    onError: (error: any) => {
      log(`RoundSettled event error: ${error.message}`, 'error');
    },
  });

  log('✅ Blockchain event listeners started');
}
