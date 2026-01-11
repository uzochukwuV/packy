import { MatchCard } from "@/components/ui/MatchCard";
import { Filter, Search } from "lucide-react";

// Mock Data
const MOCK_MATCHES = [
  { id: "1", teamA: "Arsenal", teamB: "Liverpool", oddsA: 2.15, oddsDraw: 3.40, oddsB: 2.90, startTime: "14:00 Today" },
  { id: "2", teamA: "Manchester City", teamB: "Chelsea", oddsA: 1.65, oddsDraw: 3.80, oddsB: 4.50, startTime: "16:30 Today" },
  { id: "3", teamA: "Barcelona", teamB: "Real Madrid", oddsA: 2.50, oddsDraw: 3.20, oddsB: 2.50, startTime: "20:00 Today" },
  { id: "4", teamA: "Juventus", teamB: "AC Milan", oddsA: 2.10, oddsDraw: 3.10, oddsB: 3.20, startTime: "Tomorrow" },
  { id: "5", teamA: "Bayern Munich", teamB: "Dortmund", oddsA: 1.45, oddsDraw: 4.50, oddsB: 5.50, startTime: "Tomorrow" },
];

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Live Matches</h1>
          <p className="text-muted-foreground">Place your bets on the hottest upcoming games.</p>
        </div>
        
        {/* Search & Filter */}
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              placeholder="Search teams..." 
              className="pl-9 pr-4 py-2 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-48 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Matches Grid */}
      <div className="space-y-4">
        {MOCK_MATCHES.map((match) => (
          <MatchCard key={match.id} {...match} />
        ))}
      </div>
    </div>
  );
}
