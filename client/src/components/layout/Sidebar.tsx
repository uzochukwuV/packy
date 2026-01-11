import { Link, useLocation } from "wouter";
import { LayoutDashboard, Coins, History, Trophy, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

export function Sidebar() {
  const [location] = useLocation();
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const navItems = [
    { label: "Betting Dashboard", icon: LayoutDashboard, href: "/" },
    { label: "Liquidity Pool", icon: Coins, href: "/liquidity" },
    { label: "My Bets", icon: History, href: "/my-bets" },
    { label: "Season Predictor", icon: Trophy, href: "/season" },
  ];

  const handleWalletClick = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect({ connector: injected() });
    }
  };

  return (
    <aside className="w-64 border-r border-border bg-secondary flex-shrink-0 hidden md:flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold font-display text-xl">
            V
          </div>
          <span className="font-display font-bold text-2xl text-gray-900 tracking-tight">Virtualz</span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn("nav-item cursor-pointer", isActive ? "nav-item-active" : "nav-item-inactive")}>
                  <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-gray-400")} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-gray-200">
        <button
          onClick={handleWalletClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white border border-gray-200 hover:border-primary/50 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:-translate-y-0.5"
        >
          <Wallet className="w-4 h-4 text-primary" />
          {isConnected ? (
            <span className="truncate max-w-[120px]">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
          ) : (
            "Connect Wallet"
          )}
        </button>
      </div>
    </aside>
  );
}
