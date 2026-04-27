import { createContext, useContext, useState, ReactNode } from "react";

export type MarketType = "forex" | "crypto" | "stocks" | "metals";

interface MarketContextType {
  market: MarketType;
  setMarket: (market: MarketType) => void;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error("useMarket must be used within MarketProvider");
  }
  return context;
};

export const MarketProvider = ({ children }: { children: ReactNode }) => {
  const [market, setMarket] = useState<MarketType>("forex");

  return (
    <MarketContext.Provider value={{ market, setMarket }}>
      {children}
    </MarketContext.Provider>
  );
};
