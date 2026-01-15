# Backend Web3 Integration

This directory contains the backend Web3 integration for the Betting Pool application, including the faucet system and GameEngine monitoring.

## Overview

The backend provides two main Web3 functionalities:

1. **LEAGUE Token Faucet**: Distributes test LEAGUE tokens to users for testing
2. **GameEngine Monitoring**: Automatically monitors game state and manages seasons/rounds

## Setup

### 1. Environment Variables

Add the following to your `.env.local` file:

```env
# Admin wallet private key (without 0x prefix)
ADMIN_PRIVATE_KEY=your_private_key_here

# Sepolia RPC URL (get from Alchemy or Infura)
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key
```

### 2. Fund Admin Wallet

The admin wallet needs:
- **ETH** for gas fees (minimum 0.1 ETH recommended on Sepolia)
- **LEAGUE tokens** for faucet distribution (recommended 100,000+ LEAGUE)

You can get Sepolia ETH from:
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia

### 3. Contract Addresses

Contracts are deployed on Sepolia testnet:
- **LeagueToken**: `0x0954D38B6d2D0B08B3Fa5c15e70e1c83aa536b4b`
- **GameEngine**: `0x50aE313D59bfB2A651fD99e91e963Cdd2AfA4eDF`
- **BettingPool**: `0x47Efc157C738B0AcB31bb37c8c77D73F831Fd441`
- **LiquidityPool**: `0x052c1fE33D0EBB6642f73F7f8D66Defc0f7C9Fbe`
- **SeasonPredictor**: `0xf0960b01251c8be7D1E3Fc1758c46E714e6Bf035`

## API Endpoints

### Faucet Endpoints

#### Request Tokens
```
POST /api/faucet/request
Body: { "address": "0x..." }

Response:
{
  "success": true,
  "txHash": "0x...",
  "amount": "1000",
  "nextRequestTime": 1641234567890
}
```

**Rate Limits:**
- 1000 LEAGUE tokens per request
- 1 hour cooldown between requests
- Maximum 5 requests per day per address

#### Get Faucet Stats
```
GET /api/faucet/stats

Response:
{
  "faucetBalance": "50000",
  "faucetAmount": "1000",
  "cooldownMs": 3600000,
  "maxDailyRequests": 5,
  "adminAddress": "0x..."
}
```

#### Get User History
```
GET /api/faucet/history/:address

Response:
{
  "address": "0x...",
  "requests": [
    { "timestamp": 1641234567890, "amount": "1000" }
  ],
  "totalRequests": 3,
  "nextRequestTime": 1641234567890
}
```

#### Check if Can Request
```
GET /api/faucet/can-request/:address

Response:
{
  "canRequest": false,
  "reason": "Cooldown period active",
  "nextRequestTime": 1641234567890,
  "requestsToday": 2,
  "maxDailyRequests": 5
}
```

### Admin Endpoints

#### Get Game State
```
GET /api/admin/game-state

Response:
{
  "currentSeasonId": "1",
  "currentRoundId": "5",
  "season": {
    "seasonId": "1",
    "startTime": "1641234567",
    "currentRound": "5",
    "active": true,
    "completed": false,
    "winningTeamId": "0"
  },
  "round": {
    "roundId": "5",
    "seasonId": "1",
    "startTime": "1641234567",
    "vrfRequestId": "12345",
    "settled": false
  },
  "roundSettled": false,
  "timeUntilRoundEnd": 450000,
  "shouldRequestVRF": false,
  "shouldSettleRound": false
}
```

#### Start New Season
```
POST /api/admin/start-season

Response:
{
  "success": true,
  "txHash": "0x..."
}
```

#### Start New Round
```
POST /api/admin/start-round

Response:
{
  "success": true,
  "txHash": "0x..."
}
```

#### Request VRF for Match Results
```
POST /api/admin/request-vrf
Body: { "enableNativePayment": false }

Response:
{
  "success": true,
  "txHash": "0x..."
}
```

#### Settle Round
```
POST /api/admin/settle-round
Body: { "roundId": "5" }

Response:
{
  "success": true,
  "txHash": "0x..."
}
```

#### Seed Round Pools
```
POST /api/admin/seed-pools
Body: { "roundId": "5" }

Response:
{
  "success": true,
  "txHash": "0x..."
}
```

#### Finalize Round Revenue
```
POST /api/admin/finalize-revenue
Body: { "roundId": "5" }

Response:
{
  "success": true,
  "txHash": "0x..."
}
```

## Automated Monitoring

The server automatically starts a monitoring system that:

1. **Polls game state every 30 seconds**
2. **Auto-requests VRF** when round duration (15 minutes) has elapsed
3. **Auto-settles round** when VRF is fulfilled

### Monitoring Configuration

```typescript
MONITORING_CONFIG = {
  POLL_INTERVAL_MS: 30000,        // 30 seconds
  ROUND_DURATION_MS: 900000       // 15 minutes
}
```

### Logs

The monitoring system logs actions to console:
```
[web3] GameEngine monitoring started
[web3] Round duration elapsed. Auto-requesting VRF...
[web3] ✅ VRF requested | TX: 0x...
[web3] VRF fulfilled. Auto-settling round...
[web3] ✅ Round 5 settled | TX: 0x...
```

## Game Flow

The typical game round flow:

1. **Admin starts season** → `POST /api/admin/start-season`
2. **Admin starts round** → `POST /api/admin/start-round`
3. **Admin seeds pools** → `POST /api/admin/seed-pools` (optional, provides initial liquidity)
4. **Users place bets** (15-minute betting window)
5. **Monitor auto-requests VRF** (after 15 minutes)
6. **Chainlink VRF fulfills** (generates match results, ~2-5 minutes)
7. **Monitor auto-settles round** (distributes winnings)
8. **Admin finalizes revenue** → `POST /api/admin/finalize-revenue`
9. **Repeat from step 2** for next round

## Architecture

### Files

- **config.ts**: Web3 client setup, contract addresses, configuration
- **faucet.ts**: Token distribution with rate limiting
- **game-monitor.ts**: Game state monitoring and admin controls
- **abis/**: Contract ABIs (GameEngine, BettingPool, LeagueToken)

### Rate Limiting

Faucet uses in-memory Map for rate limiting. For production, use Redis:

```typescript
// Production-ready rate limiting
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

async function canRequestTokens(address: string) {
  const key = `faucet:${address}`;
  const requests = await redis.llen(key);
  // ... check limits
}
```

## Security Notes

1. **Never commit private keys** to version control
2. **Use environment variables** for sensitive data
3. **Admin endpoints should be protected** with authentication in production
4. **Rate limiting is critical** to prevent faucet abuse
5. **Monitor admin wallet balance** to ensure sufficient ETH for gas

## Troubleshooting

### Monitoring Not Starting

```
[web3] GameEngine monitoring disabled (missing ADMIN_PRIVATE_KEY or RPC_URL)
```

**Solution**: Add `ADMIN_PRIVATE_KEY` and `RPC_URL` to `.env.local`

### Transaction Failures

```
[web3] Failed to start season: insufficient funds for gas
```

**Solution**: Fund admin wallet with Sepolia ETH

### Faucet Empty

```
Faucet balance too low
```

**Solution**: Transfer LEAGUE tokens to admin wallet

### VRF Not Fulfilling

If VRF doesn't fulfill after requesting, check:
1. Chainlink VRF subscription has LINK
2. Contract has correct VRF configuration
3. Network is not congested (wait 5-10 minutes)

## Development

To test locally without starting the server:

```typescript
import { getGameState, startSeason } from './web3/game-monitor';

async function test() {
  const state = await getGameState();
  console.log('Current season:', state.currentSeasonId);

  const result = await startSeason();
  console.log('Season started:', result.txHash);
}

test();
```

## Production Considerations

1. **Use Redis** for rate limiting instead of in-memory Map
2. **Add authentication** to admin endpoints (JWT, API keys)
3. **Set up monitoring alerts** for low balances
4. **Use a dedicated admin wallet** with limited funds
5. **Implement proper error handling** and retry logic
6. **Log to external service** (Datadog, Sentry) not just console
7. **Rate limit admin endpoints** to prevent abuse
