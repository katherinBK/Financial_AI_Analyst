import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, ExternalLink } from "lucide-react";
import { useMarket } from "@/contexts/MarketContext";

export default function News() {
  const { market } = useMarket();

  // Datos simulados de noticias
  const sampleNews = [
    {
      id: 1,
      title: `${market.toUpperCase()} Market Shows Strong Recovery`,
      source: "Bloomberg",
      summary: "Technical indicators suggest continued upward momentum in key markets...",
      timestamp: "1h ago",
      impact: "high",
      tags: ["$BTC", "$ETH", "Bullish"],
    },
    {
      id: 2,
      title: "Central Bank Policy Update",
      source: "Reuters",
      summary: "Latest monetary policy decisions affecting currency markets...",
      timestamp: "3h ago",
      impact: "medium",
      tags: ["$USD", "FED"],
    },
    {
      id: 3,
      title: `${market.toUpperCase()} Volatility Expected This Week`,
      source: "Financial Times",
      summary: "Analysts predict increased market activity ahead of economic data releases...",
      timestamp: "5h ago",
      impact: "high",
      tags: ["$EUR", "$GBP", "Volatility"],
    },
  ];

  return (
    <div className="min-h-full bg-background p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Newspaper className="h-6 w-6 text-primary" />
            Market News & Analysis - {market.toUpperCase()}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Latest news and API data affecting market conditions
          </p>
        </div>

        <div className="space-y-4">
          {sampleNews.map((news) => (
            <Card key={news.id} className="p-6 hover:border-primary/50 transition-colors cursor-pointer relative">
              {/* Tags estilo Binance en la esquina superior derecha */}
              <div className="absolute top-4 right-4 flex flex-wrap gap-1.5 justify-end max-w-[200px]">
                {news.tags.map((tag, idx) => (
                  <Badge 
                    key={idx} 
                    variant="outline" 
                    className="text-xs px-2 py-0.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-start justify-between gap-4 pr-52">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={news.impact === "high" ? "default" : "secondary"}>
                      {news.impact.toUpperCase()} IMPACT
                    </Badge>
                    <span className="text-sm text-muted-foreground">{news.source}</span>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{news.timestamp}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-2">{news.title}</h3>
                  <p className="text-muted-foreground">{news.summary}</p>
                </div>
                
                <ExternalLink className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
