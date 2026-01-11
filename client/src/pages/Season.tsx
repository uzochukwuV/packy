import { Trophy, Star, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const TEAMS = [
  { id: 1, name: "Manchester City", color: "bg-blue-400" },
  { id: 2, name: "Arsenal", color: "bg-red-500" },
  { id: 3, name: "Liverpool", color: "bg-red-700" },
  { id: 4, name: "Chelsea", color: "bg-blue-700" },
  { id: 5, name: "Tottenham", color: "bg-indigo-900" },
  { id: 6, name: "Man United", color: "bg-red-600" },
];

export default function Season() {
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800 p-8 md:p-12 text-white shadow-xl">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Trophy className="w-64 h-64 rotate-12" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-[#D2691E] font-bold tracking-widest uppercase text-sm mb-4">
             <Star className="w-4 h-4" /> Season 2024/25
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">Predict the Champion</h1>
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            Lock in your prediction for the season winner. The prize pool accumulates until the final whistle. Correct predictions share the entire pot!
          </p>
          
          <div className="flex flex-wrap gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 min-w-[140px]">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Prize Pool</p>
              <p className="text-2xl font-mono font-bold text-[#D2691E]">150.5 ETH</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 min-w-[140px]">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Participants</p>
              <p className="text-2xl font-mono font-bold">1,240</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEAMS.map((team) => (
          <div 
            key={team.id}
            onClick={() => setSelectedTeam(team.id)}
            className={cn(
              "group cursor-pointer rounded-2xl border bg-white p-6 transition-all duration-300 relative overflow-hidden",
              selectedTeam === team.id 
                ? "border-primary ring-2 ring-primary/20 shadow-xl" 
                : "border-border hover:border-gray-300 hover:shadow-lg hover:-translate-y-1"
            )}
          >
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md", team.color)}>
                {team.name.charAt(0)}
              </div>
              {selectedTeam === team.id && (
                <div className="bg-primary text-white p-1.5 rounded-full shadow-lg animate-in zoom-in">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              )}
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-1 relative z-10">{team.name}</h3>
            <p className="text-sm text-gray-500 relative z-10">Current Rank: #{(team.id % 4) + 1}</p>

            {/* Selection Overlay Effect */}
            <div className={cn(
              "absolute inset-0 bg-primary/5 transition-opacity duration-300",
              selectedTeam === team.id ? "opacity-100" : "opacity-0 group-hover:opacity-50"
            )} />
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-8">
        <button 
          disabled={!selectedTeam}
          className="px-8 py-4 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 shadow-xl shadow-primary/25 active:translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirm Prediction (0.1 ETH)
        </button>
      </div>
    </div>
  );
}
