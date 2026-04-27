import { useMarket, MarketType } from "@/contexts/MarketContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign, Bitcoin, TrendingUp, Coins } from "lucide-react";

export default function MarketSelector() {
  const { market, setMarket } = useMarket();

  const markets: { value: MarketType; label: string; icon: any }[] = [
    { value: "forex", label: "Forex", icon: DollarSign },
    { value: "crypto", label: "Crypto", icon: Bitcoin },
    { value: "stocks", label: "Stocks", icon: TrendingUp },
    { value: "metals", label: "Metals", icon: Coins },
  ];

  return (
    <Select value={market} onValueChange={(value) => setMarket(value as MarketType)}>
      <SelectTrigger className="w-[180px] bg-background">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {markets.map((m) => {
          const Icon = m.icon;
          return (
            <SelectItem key={m.value} value={m.value}>
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{m.label}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
