import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, MessageSquare, Twitter, Newspaper, TestTube2, TrendingUp, Menu, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import MarketSelector from "./MarketSelector";
import { useMarketTheme } from "@/hooks/useMarketTheme";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  useMarketTheme();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { path: "/", icon: Home, label: "Terminal", shortcut: "T" },
    { path: "/ai-chat", icon: MessageSquare, label: "AI Assistant", shortcut: "A" },
    { path: "/tweets", icon: Twitter, label: "Market Tweets", shortcut: "M" },
    { path: "/news", icon: Newspaper, label: "News & APIs", shortcut: "N" },
    { path: "/backtesting", icon: TestTube2, label: "Backtesting", shortcut: "B" },
    { path: "/inside-trading", icon: TrendingUp, label: "Inside Trading", shortcut: "I" },
  ];

  const NavContent = ({ isMobile = false }) => (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => isMobile && setMobileOpen(false)}
            className={cn(
              "flex items-center justify-between px-3 py-2.5 rounded-md transition-all duration-200 group",
              isActive
                ? "bg-primary/20 text-primary border-l-2 border-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <div className="flex items-center gap-3">
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            {!isMobile && isActive && (
              <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar - Bloomberg Style */}
      <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-card border-border p-0">
              <div className="p-6 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold text-xs">
                    QF
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground">Quant Finance</h2>
                    <p className="text-xs text-muted-foreground">Terminal Pro</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <NavContent isMobile={true} />
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold text-xs hidden md:flex">
              QF
            </div>
            <div className="hidden md:block">
              <h1 className="text-sm font-bold text-foreground">Quant Finance Terminal</h1>
              <p className="text-xs text-muted-foreground">Real-time Market Analytics</p>
            </div>
          </div>
        </div>

        {/* Center - Market Selector (only on home) */}
        {location.pathname === "/" && (
          <div className="flex-1 flex justify-center px-4">
            <MarketSelector />
          </div>
        )}
        {location.pathname !== "/" && <div className="flex-1" />}

        {/* Right - Status */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-muted-foreground">Live</span>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Desktop Only */}
        <aside className={cn(
          "hidden md:flex flex-col border-r border-border/50 bg-card/30 backdrop-blur-sm transition-all duration-300",
          sidebarOpen ? "w-56" : "w-16"
        )}>
          {/* Sidebar Header */}
          <div className="h-16 border-b border-border/50 flex items-center justify-between px-4">
            {sidebarOpen && (
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Navigation</span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <ChevronRight className={cn("h-4 w-4 transition-transform", !sidebarOpen && "rotate-180")} />
            </Button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-3">
            {sidebarOpen ? (
              <NavContent />
            ) : (
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      title={item.label}
                      className={cn(
                        "flex items-center justify-center p-2 rounded-md transition-colors",
                        isActive
                          ? "bg-primary/20 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="border-t border-border/50 p-3">
            <div className={cn(
              "text-xs text-muted-foreground",
              !sidebarOpen && "text-center"
            )}>
              {sidebarOpen ? "v1.0" : "v"}
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
