import { Search } from "lucide-react";

const MOCK_HISTORY = [
  { id: 1, match: "Arsenal vs Liverpool", selection: "Arsenal", stake: "0.5 ETH", odds: 2.15, potential: "1.075 ETH", status: "Pending", date: "Today, 10:00 AM" },
  { id: 2, match: "Real Madrid vs Barcelona", selection: "Draw", stake: "0.2 ETH", odds: 3.40, potential: "0.68 ETH", status: "Won", date: "Yesterday" },
  { id: 3, match: "Chelsea vs Man Utd", selection: "Man Utd", stake: "1.0 ETH", odds: 2.80, potential: "2.80 ETH", status: "Lost", date: "Oct 24, 2024" },
];

export default function MyBets() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">My Bets</h1>
          <p className="text-muted-foreground">Track your betting history and active wagers.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-6 gap-4 p-4 border-b border-border bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
           <div className="col-span-2">Match</div>
           <div className="text-center">Selection</div>
           <div className="text-center">Stake</div>
           <div className="text-center">Status</div>
           <div className="text-right">Payout</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100">
           {MOCK_HISTORY.map((bet) => (
             <div key={bet.id} className="grid grid-cols-6 gap-4 p-4 items-center hover:bg-gray-50/50 transition-colors">
               <div className="col-span-2">
                 <p className="font-bold text-gray-900">{bet.match}</p>
                 <p className="text-xs text-gray-500">{bet.date}</p>
               </div>
               <div className="text-center">
                 <span className="inline-block bg-secondary px-2 py-1 rounded-md text-sm font-medium text-gray-700">
                    {bet.selection} <span className="text-gray-400 text-xs ml-1">@{bet.odds.toFixed(2)}</span>
                 </span>
               </div>
               <div className="text-center font-mono text-sm text-gray-600">{bet.stake}</div>
               <div className="text-center">
                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold
                   ${bet.status === 'Won' ? 'bg-green-100 text-green-700' : 
                     bet.status === 'Lost' ? 'bg-red-100 text-red-700' : 
                     'bg-yellow-100 text-yellow-700'}`}>
                   {bet.status}
                 </span>
               </div>
               <div className={`text-right font-bold font-mono text-sm ${bet.status === 'Won' ? 'text-green-600' : 'text-gray-900'}`}>
                 {bet.status === 'Lost' ? '-' : bet.potential}
               </div>
             </div>
           ))}
        </div>
        
        {MOCK_HISTORY.length === 0 && (
          <div className="p-12 text-center text-gray-400">
            No bets placed yet.
          </div>
        )}
      </div>
    </div>
  );
}
