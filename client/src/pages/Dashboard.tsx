import { MatchCard } from "@/components/ui/MatchCard";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useDashboardData } from "@/hooks/contracts/useGameEngine";
import type { Match } from "@/contracts/types";

export default function Dashboard() {
  // Fetch real-time blockchain data
  const { seasonId, roundId, matches, isSettled, isLoading, isError, refetch } = useDashboardData();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading matches from blockchain...</p>
          <p className="text-sm text-gray-400 mt-1">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !roundId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Unable to Load Matches</h3>
          <p className="text-gray-600 mb-4">
            {!roundId
              ? "No active round found. Please wait for the admin to start a new round."
              : "There was an error connecting to the blockchain. Please check your wallet connection."
            }
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
     
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-display font-bold text-gray-900">Live Matches</h1>
            {(isSettled as boolean) && (
              <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
                SETTLED
              </span>
            )}
          </div>
          <p className="text-muted-foreground">
            Season {seasonId?.toString()} • Round {roundId?.toString()} • {matches?.length || 0} Matches
          </p>
        </div>

        {/* Refresh Button */}
        <div className="flex gap-3">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Odds
          </button>
        </div>
      </div>

      {/* Round Status Banner */}
      {isSettled && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-800">
            <strong>Round Settled:</strong> This round has been settled. Winning bets can be claimed in the "My Bets" section.
          </p>
        </div>
      )}

      {/* Matches Grid */}
      <div className="space-y-4">
        {matches && matches.length > 0 ? (
          matches.map((match: Match, index: number) => (
            <MatchCard
              key={`${roundId}-${index}`}
              roundId={roundId}
              matchIndex={index}
              match={match}
              startTime="Live" // TODO: Calculate from Round.startTime + ROUND_DURATION
            />
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-border">
            <p className="text-gray-500">No matches available in this round.</p>
          </div>
        )}
      </div>
    </div>
  );
}
