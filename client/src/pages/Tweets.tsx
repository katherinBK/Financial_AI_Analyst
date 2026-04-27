import { Card } from "@/components/ui/card";
import { Twitter, TrendingUp, TrendingDown } from "lucide-react";
import { useMarket } from "@/contexts/MarketContext";

export default function Tweets() {
  const { market } = useMarket();

  // Datos simulados de tweets
  const sampleTweets = [
    {
      id: 1,
      author: "@TradingExpert",
      content: `${market.toUpperCase()} looking bullish on the 4H chart. RSI showing strong momentum. 📈`,
      sentiment: "bullish",
      timestamp: "2h ago",
    },
    {
      id: 2,
      author: "@MarketAnalyst",
      content: `Breaking: Major resistance level at current ${market} prices. Watch for breakout or reversal.`,
      sentiment: "neutral",
      timestamp: "4h ago",
    },
    {
      id: 3,
      author: "@QuantTrader",
      content: `${market.toUpperCase()} volatility increasing. ATR suggesting potential big moves ahead. Risk management crucial.`,
      sentiment: "bearish",
      timestamp: "6h ago",
    },
  ];

  return (
    <div className="min-h-full bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Twitter className="h-6 w-6 text-primary" />
            Market Sentiment - {market.toUpperCase()}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Curated tweets from top traders and analysts
          </p>
        </div>

        <div className="space-y-4">
          {sampleTweets.map((tweet) => (
            <Card key={tweet.id} className="p-6 hover:border-primary/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Twitter className="h-6 w-6 text-primary" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-foreground">{tweet.author}</span>
                    <span className="text-sm text-muted-foreground">{tweet.timestamp}</span>
                    {tweet.sentiment === "bullish" && (
                      <TrendingUp className="h-4 w-4 text-bull ml-auto" />
                    )}
                    {tweet.sentiment === "bearish" && (
                      <TrendingDown className="h-4 w-4 text-bear ml-auto" />
                    )}
                  </div>
                  <p className="text-foreground">{tweet.content}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
