import { useBetSlip } from "@/context/BetSlipContext";
import { X, Trash2, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useAccount } from "wagmi";
import { useToast } from "@/hooks/use-toast";

export function BetSlip() {
  const { bets, removeBet, clearSlip, stake, setStake, isOpen, toggleSlip } = useBetSlip();
  const { isConnected } = useAccount();
  const { toast } = useToast();

  const totalOdds = bets.reduce((acc, bet) => acc * bet.odds, 1);
  const potentialReturn = (stake * totalOdds).toFixed(2);
  const formattedOdds = totalOdds.toFixed(2);

  const handlePlaceBet = () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to place a bet.",
        variant: "destructive"
      });
      return;
    }
    
    if (bets.length === 0) return;

    // Here we would trigger the contract interaction
    toast({
      title: "Bet Placed Successfully!",
      description: `Staked ${stake} ETH for potential return of ${potentialReturn} ETH`,
      className: "bg-green-50 border-green-200 text-green-900",
    });
    clearSlip();
  };

  if (!isOpen) {
    return (
      <button 
        onClick={toggleSlip}
        className="fixed bottom-6 right-6 z-50 md:hidden bg-primary text-white p-4 rounded-full shadow-xl shadow-primary/30"
      >
        <Ticket className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold">
          {bets.length}
        </span>
      </button>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-border h-screen sticky top-0 hidden lg:flex flex-col shadow-[-4px_0_20px_rgba(0,0,0,0.02)]">
      <div className="p-5 border-b border-border bg-gray-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Ticket className="w-4 h-4" />
          </div>
          <h2 className="font-display font-bold text-lg">Bet Slip</h2>
        </div>
        <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-bold">
          {bets.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {bets.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
              <Ticket className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm">Your slip is empty.</p>
              <p className="text-xs mt-1 opacity-70">Select odds from any match to start betting.</p>
            </div>
          ) : (
            bets.map((bet) => (
              <motion.div
                key={bet.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="bg-secondary/50 rounded-xl p-3 border border-border group hover:border-primary/30 transition-colors"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-medium text-gray-500">{bet.matchTitle}</span>
                  <button 
                    onClick={() => removeBet(bet.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">{bet.selection}</span>
                  <span className="bg-white px-2 py-1 rounded-md text-sm font-bold text-primary shadow-sm border border-gray-100">
                    {bet.odds.toFixed(2)}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="p-5 border-t border-border bg-gray-50/50 space-y-4">
        {bets.length > 0 && (
          <>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Odds</span>
                <span className="font-bold font-mono">{formattedOdds}</span>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Stake (ETH)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={stake}
                    onChange={(e) => setStake(parseFloat(e.target.value) || 0)}
                    className="w-full pl-3 pr-12 py-2.5 bg-white border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-sm"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-gray-400">ETH</span>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl border border-green-100">
                <span className="text-xs font-bold text-green-700 uppercase">Potential Return</span>
                <span className="font-bold text-green-700 font-mono">{potentialReturn} ETH</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <button 
                onClick={clearSlip}
                className="col-span-1 flex items-center justify-center rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button 
                onClick={handlePlaceBet}
                disabled={!stake}
                className="col-span-3 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 active:translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Place Bet
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
