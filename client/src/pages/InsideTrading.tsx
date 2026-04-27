import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Building2, AlertCircle } from "lucide-react";
import { useMarket } from "@/contexts/MarketContext";

export default function InsideTrading() {
  const { market } = useMarket();

  // Datos simulados de inside trading
  const insideTrades = [
    {
      id: 1,
      company: "Goldman Sachs",
      ticker: "GS",
      insider: "David Solomon",
      position: "CEO",
      action: "BUY",
      shares: 15000,
      value: 4850000,
      pricePerShare: 323.33,
      date: "2024-01-15",
      filingDate: "2024-01-17",
      sentiment: "bullish",
    },
    {
      id: 2,
      company: "JPMorgan Chase",
      ticker: "JPM",
      insider: "Jamie Dimon",
      position: "Chairman & CEO",
      action: "SELL",
      shares: 8000,
      value: 1368000,
      pricePerShare: 171.00,
      date: "2024-01-14",
      filingDate: "2024-01-16",
      sentiment: "bearish",
    },
    {
      id: 3,
      company: "Morgan Stanley",
      ticker: "MS",
      insider: "James P. Gorman",
      position: "Executive Chairman",
      action: "BUY",
      shares: 25000,
      value: 2225000,
      pricePerShare: 89.00,
      date: "2024-01-13",
      filingDate: "2024-01-15",
      sentiment: "bullish",
    },
    {
      id: 4,
      company: "Bank of America",
      ticker: "BAC",
      insider: "Brian Moynihan",
      position: "CEO",
      action: "BUY",
      shares: 50000,
      value: 1650000,
      pricePerShare: 33.00,
      date: "2024-01-12",
      filingDate: "2024-01-14",
      sentiment: "bullish",
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <div className="min-h-full bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Inside Trading Activity - {market.toUpperCase()}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Institutional trading patterns and insider transactions
          </p>
        </div>

        {/* Alert Banner */}
        <Card className="p-4 mb-6 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Data Information</h3>
              <p className="text-sm text-muted-foreground">
                Inside trading data is currently being pulled from external web services. 
                This information is updated regularly and reflects SEC filings and institutional disclosures.
              </p>
            </div>
          </div>
        </Card>

        {/* Trading Activity Grid */}
        <div className="space-y-4">
          {insideTrades.map((trade) => (
            <Card 
              key={trade.id} 
              className="p-6 hover:border-primary/50 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                {/* Left Section - Company Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {trade.company}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {trade.ticker}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">{trade.insider}</span>
                        {" • "}
                        {trade.position}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Trade: {trade.date}</span>
                        <span>•</span>
                        <span>Filed: {trade.filingDate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Section - Trade Details */}
                <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
                  {/* Action Badge */}
                  <div className="flex flex-col items-start sm:items-center">
                    <span className="text-xs text-muted-foreground mb-1">Action</span>
                    <Badge 
                      className={
                        trade.action === "BUY"
                          ? "bg-bull/20 text-bull border-bull/30"
                          : "bg-bear/20 text-bear border-bear/30"
                      }
                    >
                      {trade.action}
                    </Badge>
                  </div>

                  {/* Shares */}
                  <div className="flex flex-col items-start sm:items-end">
                    <span className="text-xs text-muted-foreground mb-1">Shares</span>
                    <span className="font-semibold text-foreground">
                      {formatNumber(trade.shares)}
                    </span>
                  </div>

                  {/* Value */}
                  <div className="flex flex-col items-start sm:items-end">
                    <span className="text-xs text-muted-foreground mb-1">Total Value</span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(trade.value)}
                    </span>
                  </div>

                  {/* Price per Share */}
                  <div className="flex flex-col items-start sm:items-end">
                    <span className="text-xs text-muted-foreground mb-1">Price/Share</span>
                    <span className="font-semibold text-foreground">
                      ${trade.pricePerShare.toFixed(2)}
                    </span>
                  </div>

                  {/* Sentiment */}
                  <div className="flex flex-col items-start sm:items-center">
                    <span className="text-xs text-muted-foreground mb-1">Sentiment</span>
                    <div className={`w-3 h-3 rounded-full ${
                      trade.sentiment === "bullish" ? "bg-bull" : "bg-bear"
                    }`} />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
