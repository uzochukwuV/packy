import { Coins, TrendingUp, ArrowUpRight, ArrowDownLeft, Lock, Loader2, CheckCircle2, AlertCircle, Percent } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAccount } from "wagmi";
import { 
  useLiquidityPoolStats, 
  useUserLPPosition, 
  useAddLiquidity, 
  useRemoveLiquidity,
  usePreviewDeposit,
  usePreviewWithdrawal
} from "@/hooks/contracts/useLiquidityPool";
import { useLeagueBalance, useLeagueAllowance, useApproveLeague } from "@/hooks/contracts/useLeagueToken";
import { DEPLOYED_ADDRESSES } from "@/contracts/addresses";
import { formatToken, parseToken } from "@/contracts/types";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Liquidity() {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState<string>('');
  const { isConnected, address } = useAccount();
  const { toast } = useToast();
  const [needsApproval, setNeedsApproval] = useState(false);

  // Fetch real contract data
  const { 
    totalLiquidity, 
    availableLiquidity, 
    lockedLiquidity,
    utilizationRate,
    isLoading: statsLoading 
  } = useLiquidityPoolStats();
  
  const { 
    amount: userLPAmount, 
    shares: userShares,
    percentage: userPercentage,
    isLoading: positionLoading 
  } = useUserLPPosition(address);
  
  const { balance: userBalance, formattedBalance } = useLeagueBalance(address);
  const { data: allowance, refetch: refetchAllowance } = useLeagueAllowance(address);
  
  // Preview calculations
  const amountBigInt = amount ? parseToken(amount) : 0n;
  const { data: previewShares } = usePreviewDeposit(activeTab === 'deposit' ? amountBigInt : undefined);
  const { data: previewAmount } = usePreviewWithdrawal(activeTab === 'withdraw' && userShares ? userShares : undefined);

  // Token approval
  const { approve, isConfirming: isApproving, isSuccess: approveSuccess, isPending: approvePending } = useApproveLeague();

  // Liquidity operations
  const { addLiquidity, isConfirming: isDepositing, isSuccess: depositSuccess } = useAddLiquidity();
  const { removeLiquidity, isConfirming: isWithdrawing, isSuccess: withdrawSuccess } = useRemoveLiquidity();

  // Calculate APY (simple estimate based on utilization)
  const estimatedAPY = utilizationRate ? (Number(utilizationRate) / 100) * 0.05 : 0; // 5% base * utilization

  // Real Stats
  const stats = [
    { 
      label: "Total Liquidity", 
      value: statsLoading ? "..." : `${formatToken(totalLiquidity || 0n)} LEAGUE`,
      subValue: `Available: ${formatToken(availableLiquidity || 0n)}`,
      change: `${Number(utilizationRate || 0n) / 100}% Utilized`, 
      icon: Lock 
    },
    { 
      label: "Est. APY", 
      value: statsLoading ? "..." : `${estimatedAPY.toFixed(2)}%`,
      subValue: "Based on pool activity",
      change: "+Variable", 
      icon: TrendingUp 
    },
    { 
      label: "My Share", 
      value: positionLoading ? "..." : `${formatToken(userLPAmount || 0n)} LEAGUE`,
      subValue: userPercentage ? `${(Number(userPercentage) / 100).toFixed(2)}% of pool` : "0% of pool",
      change: userShares ? `${formatToken(userShares)} shares` : "No position", 
      icon: Coins 
    },
  ];

  // Check if approval is needed
  useEffect(() => {
    if (activeTab === 'deposit' && amount && allowance !== undefined) {
      const amountInWei = parseToken(amount);
      setNeedsApproval(allowance < amountInWei);
    }
  }, [amount, allowance, activeTab]);

  // Refetch after approval
  useEffect(() => {
    if (approveSuccess) {
      refetchAllowance();
      toast({
        title: "Approval Successful! ✓",
        description: "You can now deposit liquidity.",
        className: "bg-green-50 border-green-200 text-green-900",
      });
    }
  }, [approveSuccess, refetchAllowance, toast]);

  // Handle deposit success
  useEffect(() => {
    if (depositSuccess) {
      toast({
        title: "Liquidity Added! 🎉",
        description: `Successfully deposited ${amount} LEAGUE tokens.`,
        className: "bg-green-50 border-green-200 text-green-900",
      });
      setAmount('');
    }
  }, [depositSuccess, amount, toast]);

  // Handle withdraw success
  useEffect(() => {
    if (withdrawSuccess) {
      toast({
        title: "Liquidity Withdrawn! 💰",
        description: `Successfully withdrew liquidity.`,
        className: "bg-green-50 border-green-200 text-green-900",
      });
      setAmount('');
    }
  }, [withdrawSuccess, toast]);

  const handleApprove = async () => {
    if (!amount) return;
    try {
      const amountInWei = parseToken(amount);
      // Approve 10x to avoid multiple approvals
      await approve(amountInWei * 10n);
    } catch (err: any) {
      console.error("Approval failed:", err);
      toast({
        title: "Approval Failed",
        description: err.message || "Failed to approve tokens.",
        variant: "destructive",
      });
    }
  };

  const handleDeposit = async () => {
    if (!amount || !isConnected) return;
    try {
      const amountInWei = parseToken(amount);
      await addLiquidity(amountInWei);
    } catch (err: any) {
      console.error("Deposit failed:", err);
      toast({
        title: "Deposit Failed",
        description: err.message || "Failed to deposit liquidity.",
        variant: "destructive",
      });
    }
  };

  const handleWithdraw = async () => {
    if (!userShares || !isConnected) return;
    try {
      // Withdraw all shares for simplicity
      await removeLiquidity(userShares);
    } catch (err: any) {
      console.error("Withdrawal failed:", err);
      toast({
        title: "Withdrawal Failed",
        description: err.message || "Failed to withdraw liquidity.",
        variant: "destructive",
      });
    }
  };

  const setMaxAmount = () => {
    if (activeTab === 'deposit' && userBalance) {
      setAmount(formatToken(userBalance));
    } else if (activeTab === 'withdraw' && userLPAmount) {
      setAmount(formatToken(userLPAmount));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Liquidity Pool</h1>
        <p className="text-muted-foreground">Provide liquidity to the house bankroll and earn share of profits.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">{stat.change}</span>
            </div>
            <p className="text-sm text-gray-500 font-medium mb-1">{stat.label}</p>
            <h3 className="text-2xl font-display font-bold text-gray-900 mb-1">{stat.value}</h3>
            {stat.subValue && (
              <p className="text-xs text-gray-400">{stat.subValue}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Interaction Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Action Form */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="flex border-b border-border">
            <button 
              onClick={() => setActiveTab('deposit')}
              className={cn(
                "flex-1 py-4 text-sm font-bold transition-colors relative",
                activeTab === 'deposit' ? "text-primary bg-primary/5" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              Deposit Liquidity
              {activeTab === 'deposit' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
            <button 
              onClick={() => setActiveTab('withdraw')}
              className={cn(
                "flex-1 py-4 text-sm font-bold transition-colors relative",
                activeTab === 'withdraw' ? "text-primary bg-primary/5" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              Withdraw Liquidity
              {activeTab === 'withdraw' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Amount (ETH)</label>
              <div className="relative">
                <input 
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-lg"
                />
                <button className="absolute right-3 top-3 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md hover:bg-primary/20">
                  MAX
                </button>
              </div>
              <p className="text-xs text-gray-400 text-right">Balance: 42.00 ETH</p>
            </div>

            <button 
              disabled={!isConnected}
              className="w-full py-3.5 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 active:translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {activeTab === 'deposit' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
              {activeTab === 'deposit' ? "Add Liquidity" : "Remove Liquidity"}
            </button>
          </div>
        </div>

        {/* Right: Info / History */}
        <div className="bg-gray-50 rounded-2xl p-6 md:p-8 border border-border/50">
          <h3 className="font-bold text-lg mb-4">How it works</h3>
          <ul className="space-y-4 mb-8">
            <li className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 text-xs font-bold">1</div>
              <p className="text-sm text-gray-600">Deposit ETH into the shared liquidity pool used to pay out winning bets.</p>
            </li>
            <li className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 text-xs font-bold">2</div>
              <p className="text-sm text-gray-600">Earn a share of the house edge (typically 3-5%) on every bet placed.</p>
            </li>
            <li className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 text-xs font-bold">3</div>
              <p className="text-sm text-gray-600">Withdraw your initial deposit plus accumulated rewards at any time.</p>
            </li>
          </ul>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
             <h4 className="font-bold text-blue-900 text-sm mb-1">Risk Warning</h4>
             <p className="text-xs text-blue-800/80 leading-relaxed">
               Liquidity providers act as the counterparty to bettors. While the house has a statistical edge, short-term variance can result in temporary losses to the pool.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
