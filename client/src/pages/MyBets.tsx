import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { Loader2, Ticket, ExternalLink } from "lucide-react";
import { formatToken } from "@/contracts/types";
import { formatDistance } from "date-fns";

interface Bet {
  id: number;
  betId: string;
  bettor: string;
  seasonId: string;
  roundId: string;
  amount: string;
  matchIndices: number[];
  outcomes: number[];
  parlayMultiplier: string;
  potentialWinnings: string;
  status: string;
  txHash: string;
  placedAt: string;
  settledAt: string | null;
}

export default function MyBets() {
  const { address, isConnected } = useAccount();
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBets = async () => {
      if (!address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/bets/${address}`);

        if (!response.ok) {
          throw new Error('Failed to fetch bets');
        }

        const data = await response.json();
        setBets(data);
      } catch (err: any) {
        console.error('Error fetching bets:', err);
        setError(err.message || 'Failed to load bets');
      } finally {
        setLoading(false);
      }
    };

    fetchBets();
  }, [address]);

  const getOutcomeLabel = (outcome: number) => {
    if (outcome === 1) return "Home";
    if (outcome === 2) return "Away";
    return "Draw";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won':
        return 'bg-green-100 text-green-700';
      case 'lost':
        return 'bg-red-100 text-red-700';
      case 'claimed':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  const formatBetDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistance(date, new Date(), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  if (!isConnected) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-border shadow-sm">
          <Ticket className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Wallet Not Connected</h2>
          <p className="text-gray-500 text-center max-w-md">
            Please connect your wallet to view your betting history.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">My Bets</h1>
          <p className="text-muted-foreground">Track your betting history and active wagers.</p>
        </div>
        {bets.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-bold text-gray-900">{bets.length}</span> total bets
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-red-500 mb-2">Error loading bets</p>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        ) : bets.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Ticket className="w-16 h-16 text-gray-200 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No bets yet</h3>
            <p className="text-sm text-gray-500 max-w-md">
              Start placing bets on matches to see them appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <div className="col-span-3">Bet Details</div>
              <div className="col-span-2 text-center">Round</div>
              <div className="col-span-2 text-center">Selections</div>
              <div className="col-span-2 text-center">Stake</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-1 text-right">Payout</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {bets.map((bet) => {
                const stakeAmount = parseFloat(formatToken(BigInt(bet.amount)));
                const potentialWinnings = parseFloat(formatToken(BigInt(bet.potentialWinnings)));
                const parlayMultiplier = parseFloat(formatToken(BigInt(bet.parlayMultiplier)));

                return (
                  <div
                    key={bet.id}
                    className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Bet Details */}
                    <div className="col-span-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-400">#{bet.betId}</span>
                        <a
                          href={`https://sepolia.etherscan.io/tx/${bet.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <p className="text-xs text-gray-500">{formatBetDate(bet.placedAt)}</p>
                    </div>

                    {/* Round */}
                    <div className="col-span-2 text-center">
                      <span className="inline-block bg-secondary px-2 py-1 rounded-md text-xs font-medium text-gray-700">
                        Season {bet.seasonId} • R{bet.roundId}
                      </span>
                    </div>

                    {/* Selections */}
                    <div className="col-span-2 text-center">
                      <div className="space-y-1">
                        {bet.matchIndices.length === 1 ? (
                          <span className="inline-block bg-blue-50 px-2 py-1 rounded text-xs font-medium text-blue-700">
                            Single: Match {bet.matchIndices[0]} • {getOutcomeLabel(bet.outcomes[0])}
                          </span>
                        ) : (
                          <>
                            <span className="inline-block bg-purple-50 px-2 py-1 rounded text-xs font-bold text-purple-700">
                              {bet.matchIndices.length}-Leg Parlay
                            </span>
                            <div className="text-[10px] text-gray-500">
                              {bet.matchIndices.map((idx, i) => (
                                <span key={i} className="block">
                                  M{idx}: {getOutcomeLabel(bet.outcomes[i])}
                                </span>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Stake */}
                    <div className="col-span-2 text-center">
                      <p className="font-mono text-sm font-bold text-gray-900">
                        {stakeAmount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">LEAGUE</p>
                    </div>

                    {/* Status */}
                    <div className="col-span-2 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(bet.status)}`}>
                        {bet.status}
                      </span>
                      {bet.matchIndices.length > 1 && (
                        <p className="text-[10px] text-purple-600 mt-1">
                          {parlayMultiplier.toFixed(2)}x bonus
                        </p>
                      )}
                    </div>

                    {/* Payout */}
                    <div className="col-span-1 text-right">
                      <p className={`font-mono text-sm font-bold ${bet.status === 'won' || bet.status === 'claimed' ? 'text-green-600' : bet.status === 'lost' ? 'text-gray-400' : 'text-gray-900'}`}>
                        {bet.status === 'lost' ? '-' : potentialWinnings.toFixed(2)}
                      </p>
                      {bet.status !== 'lost' && (
                        <p className="text-xs text-gray-500">LEAGUE</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
