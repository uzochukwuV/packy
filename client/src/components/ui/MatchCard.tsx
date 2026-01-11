import { useBetSlip } from "@/context/BetSlipContext";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

interface MatchCardProps {
  id: string;
  teamA: string;
  teamB: string;
  oddsA: number;
  oddsDraw: number;
  oddsB: number;
  startTime: string;
}

export function MatchCard({ id, teamA, teamB, oddsA, oddsDraw, oddsB, startTime }: MatchCardProps) {
  const { addBet, bets } = useBetSlip();

  const isSelected = (selection: string) => {
    return bets.some(b => b.matchId === id && b.selection === selection);
  };

  const handleSelect = (selection: string, odds: number) => {
    addBet({
      id: `${id}-${selection}`, // Unique ID for the slip
      matchId: id,
      matchTitle: `${teamA} vs ${teamB}`,
      selection,
      odds,
    });
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow duration-300 mb-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          Premier League
        </div>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{startTime}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Teams */}
        <div className="md:col-span-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <Users className="w-4 h-4" />
              </div>
              <span className="font-bold text-gray-900 text-lg">{teamA}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <Users className="w-4 h-4" />
              </div>
              <span className="font-bold text-gray-900 text-lg">{teamB}</span>
            </div>
          </div>
        </div>

        {/* Odds Buttons */}
        <div className="md:col-span-7 grid grid-cols-3 gap-3">
          <button
            onClick={() => handleSelect("Home", oddsA)}
            className={cn(
              "flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all duration-200",
              isSelected("Home") 
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]" 
                : "bg-gray-50 border-gray-200 text-gray-700 hover:border-primary/50 hover:bg-white"
            )}
          >
            <span className={cn("text-xs mb-1", isSelected("Home") ? "text-white/80" : "text-gray-400")}>1</span>
            <span className="font-bold font-mono text-lg">{oddsA.toFixed(2)}</span>
          </button>

          <button
            onClick={() => handleSelect("Draw", oddsDraw)}
            className={cn(
              "flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all duration-200",
              isSelected("Draw") 
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]" 
                : "bg-gray-50 border-gray-200 text-gray-700 hover:border-primary/50 hover:bg-white"
            )}
          >
            <span className={cn("text-xs mb-1", isSelected("Draw") ? "text-white/80" : "text-gray-400")}>X</span>
            <span className="font-bold font-mono text-lg">{oddsDraw.toFixed(2)}</span>
          </button>

          <button
            onClick={() => handleSelect("Away", oddsB)}
            className={cn(
              "flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all duration-200",
              isSelected("Away") 
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]" 
                : "bg-gray-50 border-gray-200 text-gray-700 hover:border-primary/50 hover:bg-white"
            )}
          >
            <span className={cn("text-xs mb-1", isSelected("Away") ? "text-white/80" : "text-gray-400")}>2</span>
            <span className="font-bold font-mono text-lg">{oddsB.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
