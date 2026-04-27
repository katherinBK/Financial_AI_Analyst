import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MarketProvider } from "@/contexts/MarketContext";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import AIChat from "./pages/AIChat";
import Tweets from "./pages/Tweets";
import News from "./pages/News";
import Backtesting from "./pages/Backtesting";
import InsideTrading from "./pages/InsideTrading";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <MarketProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/ai-chat" element={<AIChat />} />
              <Route path="/tweets" element={<Tweets />} />
              <Route path="/news" element={<News />} />
              <Route path="/backtesting" element={<Backtesting />} />
              <Route path="/inside-trading" element={<InsideTrading />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </MarketProvider>
  </QueryClientProvider>
);

export default App;
