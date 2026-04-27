import { useEffect } from "react";
import { useMarket } from "@/contexts/MarketContext";

export function useMarketTheme() {
  const { market } = useMarket();

  useEffect(() => {
    document.documentElement.setAttribute("data-market", market);
  }, [market]);

  return market;
}
