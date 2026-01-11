import { Coins, TrendingUp, ArrowUpRight, ArrowDownLeft, Lock } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAccount } from "wagmi";

export default function Liquidity() {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState<string>('');
  const { isConnected } = useAccount();

  // Mock Stats
  const stats = [
    { label: "Total Liquidity", value: "1,245.50 ETH", change: "+12.5%", icon: Lock },
    { label: "Current APY", value: "8.4%", change: "+0.2%", icon: TrendingUp },
    { label: "My Share", value: "5.25 ETH", change: "0.42%", icon: Coins },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Liquidity Pool</h1>
        <p className="text-muted-foreground">Provide liquidity to the house bankroll and earn share of profits.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-secondary rounded-xl text-primary">
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">{stat.change}</span>
            </div>
            <p className="text-sm text-gray-500 font-medium mb-1">{stat.label}</p>
            <h3 className="text-2xl font-display font-bold text-gray-900">{stat.value}</h3>
          </div>
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
