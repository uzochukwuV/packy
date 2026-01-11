import { Sidebar } from "./Sidebar";
import { BetSlip } from "./BetSlip";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Coins, History, Trophy } from "lucide-react";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const navItems = [
    { label: "Betting Dashboard", icon: LayoutDashboard, href: "/" },
    { label: "Liquidity Pool", icon: Coins, href: "/liquidity" },
    { label: "My Bets", icon: History, href: "/my-bets" },
    { label: "Season Predictor", icon: Trophy, href: "/season" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold font-display text-lg">V</div>
          <span className="font-display font-bold text-xl text-gray-900">Virtualz</span>
        </div>
        
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger>
            <Menu className="w-6 h-6 text-gray-600" />
          </SheetTrigger>
          <SheetContent side="left" className="w-[80%] p-0">
             <div className="p-6">
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold font-display text-xl">V</div>
                  <span className="font-display font-bold text-2xl text-gray-900">Virtualz</span>
                </div>
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = location === item.href;
                    return (
                      <Link key={item.href} href={item.href}>
                        <div 
                          className={cn("nav-item cursor-pointer", isActive ? "nav-item-active" : "nav-item-inactive")}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-gray-400")} />
                          {item.label}
                        </div>
                      </Link>
                    );
                  })}
                </nav>
             </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:min-w-0 pt-16 md:pt-0 overflow-y-auto h-screen scrollbar-hide">
        <div className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
           {children}
        </div>
      </main>

      {/* Right Sidebar (Bet Slip) */}
      <BetSlip />
    </div>
  );
}
