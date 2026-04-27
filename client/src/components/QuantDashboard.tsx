import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity, BarChart3, Zap, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMarket } from "@/contexts/MarketContext";
import CandlestickChart from "./CandlestickChart";

interface Indicators {
  rsi: { value: number; signal: string };
  macd: { macd: number; signal: number; histogram: number; signalType: string };
  bollingerBands: { upper: number; middle: number; lower: number; bandwidth: number; signal: string };
  atr: { value: number; volatility: number } | null;
  sharpeRatio: { value: number; rating: string };
}

export default function QuantDashboard() {
  const { market } = useMarket();
  const [loading, setLoading] = useState(true);
  const [indicators, setIndicators] = useState<Indicators | null>(null);
  const [prices, setPrices] = useState<number[]>([]);

  // Generate sample price data with OHLC for candlestick
  const generateSampleData = () => {
    const basePrice = 1.0850; // EUR/USD example
    const data: number[] = [];
    let price = basePrice;
    
    for (let i = 0; i < 100; i++) {
      const change = (Math.random() - 0.48) * 0.002; // Slight upward bias
      price = price * (1 + change);
      data.push(price);
    }
    
    return data;
  };

  const calculateIndicators = async () => {
    try {
      const samplePrices = generateSampleData();
      setPrices(samplePrices);
      
      const highs = samplePrices.map(p => p * 1.001);
      const lows = samplePrices.map(p => p * 0.999);
      
      const { data, error } = await supabase.functions.invoke('calculate-indicators', {
        body: { 
          prices: samplePrices,
          highs,
          lows,
          closes: samplePrices,
        }
      });

      if (error) throw error;
      
      setIndicators(data.indicators);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Error al calcular indicadores");
    } finally {
      setLoading(false);
    }
  };

  // Auto-calculate on mount and market change
  useEffect(() => {
    calculateIndicators();
  }, [market]);

  // Generate OHLC candlestick data from prices
  const chartData = prices.map((close, i) => {
    const volatility = close * 0.003;
    const open = i > 0 ? prices[i - 1] : close;
    const high = Math.max(open, close) + Math.random() * volatility;
    const low = Math.min(open, close) - Math.random() * volatility;
    return { 
      index: i, 
      open, 
      high, 
      low, 
      close
    };
  });

  const getMarketPair = () => {
    switch (market) {
      case "forex": return "EUR/USD";
      case "crypto": return "BTC/USD";
      case "stocks": return "S&P 500";
      case "metals": return "Gold/USD";
      default: return "EUR/USD";
    }
  };

  const getSignalIcon = (signal: string, isBullish: boolean = false) => {
    if (signal === 'oversold' || isBullish) {
      return <TrendingUp className="h-4 w-4 text-bull" />;
    } else if (signal === 'overbought' || !isBullish) {
      return <TrendingDown className="h-4 w-4 text-bear" />;
    }
    return <Activity className="h-4 w-4 text-muted-foreground" />;
  };

  const getSignalColor = (signal: string, isBullish: boolean = false) => {
    if (signal === 'oversold' || isBullish) {
      return 'text-bull';
    } else if (signal === 'overbought' || !isBullish) {
      return 'text-bear';
    }
    return 'text-muted-foreground';
  };

  return (
    <div className="min-h-full bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{getMarketPair()}</h1>
              <p className="text-sm text-muted-foreground mt-1">Real-time Market Analysis & Technical Indicators</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border/50">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-muted-foreground">LIVE</span>
            </div>
          </div>
        </div>

        {/* Main Chart Section */}
        {prices.length > 0 && (
          <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Price Chart
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">100 candles • 1H timeframe</p>
                </div>
              </div>
              <div className="w-full overflow-x-auto rounded-lg border border-border/30 bg-background/50">
                <div className="p-4">
                  <CandlestickChart data={chartData} height={450} />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Indicators Section */}
        {indicators && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Technical Indicators</h2>
            
            {/* Top Row - Main Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* RSI */}
              <Card className="p-5 border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">RSI (14)</h3>
                    <Activity className="h-4 w-4 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-foreground">{indicators.rsi.value.toFixed(1)}</p>
                      <span className="text-xs text-muted-foreground">/100</span>
                    </div>
                    
                    {/* RSI Bar */}
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          indicators.rsi.value > 70 ? 'bg-bear' : 
                          indicators.rsi.value < 30 ? 'bg-bull' : 
                          'bg-primary'
                        }`}
                        style={{ width: `${indicators.rsi.value}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                    {getSignalIcon(indicators.rsi.signal)}
                    <span className={`text-xs font-medium ${getSignalColor(indicators.rsi.signal)}`}>
                      {indicators.rsi.signal === 'oversold' ? 'Oversold' : 
                       indicators.rsi.signal === 'overbought' ? 'Overbought' : 
                       'Neutral'}
                    </span>
                  </div>
                </div>
              </Card>

              {/* MACD */}
              <Card className="p-5 border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">MACD</h3>
                    <Zap className="h-4 w-4 text-chart-2 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-foreground">{indicators.macd.histogram.toFixed(5)}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-muted/30 rounded px-2 py-1.5">
                        <p className="text-muted-foreground">MACD</p>
                        <p className="font-mono font-semibold text-foreground">{indicators.macd.macd.toFixed(5)}</p>
                      </div>
                      <div className="bg-muted/30 rounded px-2 py-1.5">
                        <p className="text-muted-foreground">Signal</p>
                        <p className="font-mono font-semibold text-foreground">{indicators.macd.signal.toFixed(5)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                    {getSignalIcon('', indicators.macd.signalType === 'bullish')}
                    <span className={`text-xs font-medium ${getSignalColor('', indicators.macd.signalType === 'bullish')}`}>
                      {indicators.macd.signalType === 'bullish' ? 'Bullish' : 'Bearish'}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Bollinger Bands */}
              <Card className="p-5 border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bollinger Bands</h3>
                    <BarChart3 className="h-4 w-4 text-chart-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-foreground">{indicators.bollingerBands.bandwidth.toFixed(1)}</p>
                      <span className="text-xs text-muted-foreground">%</span>
                    </div>
                    
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between items-center px-2 py-1 bg-muted/30 rounded">
                        <span className="text-muted-foreground">Upper</span>
                        <span className="font-mono font-semibold text-foreground">{indicators.bollingerBands.upper.toFixed(5)}</span>
                      </div>
                      <div className="flex justify-between items-center px-2 py-1 bg-muted/30 rounded">
                        <span className="text-muted-foreground">Middle</span>
                        <span className="font-mono font-semibold text-foreground">{indicators.bollingerBands.middle.toFixed(5)}</span>
                      </div>
                      <div className="flex justify-between items-center px-2 py-1 bg-muted/30 rounded">
                        <span className="text-muted-foreground">Lower</span>
                        <span className="font-mono font-semibold text-foreground">{indicators.bollingerBands.lower.toFixed(5)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* ATR */}
              {indicators.atr && (
                <Card className="p-5 border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">ATR Volatility</h3>
                      <Activity className="h-4 w-4 text-chart-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-foreground">{indicators.atr.volatility.toFixed(1)}</p>
                        <span className="text-xs text-muted-foreground">%</span>
                      </div>
                      
                      <div className="bg-muted/30 rounded px-2 py-1.5 text-xs">
                        <p className="text-muted-foreground">ATR Range</p>
                        <p className="font-mono font-semibold text-foreground">{indicators.atr.value.toFixed(5)}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/30">
                      <p className="text-xs text-muted-foreground">
                        {indicators.atr.volatility > 2 ? '⚠️ High volatility' : 
                         indicators.atr.volatility < 1 ? '✓ Low volatility' : 
                         '→ Normal volatility'}
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Bottom Row - Sharpe Ratio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-5 border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sharpe Ratio</h3>
                    <TrendingUp className="h-4 w-4 text-chart-5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-foreground">{indicators.sharpeRatio.value.toFixed(2)}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30">
                      {indicators.sharpeRatio.rating === 'excellent' ? (
                        <CheckCircle className="h-4 w-4 text-bull" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-xs font-medium text-foreground capitalize">
                        {indicators.sharpeRatio.rating} Risk-Adjusted Return
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground pt-2 border-t border-border/30">
                    Higher values indicate better risk-adjusted returns
                  </p>
                </div>
              </Card>

              {/* Summary Card */}
              <Card className="p-5 border-border/50 bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm border-primary/20">
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Market Summary</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Current Price</span>
                      <span className="font-mono font-semibold text-foreground">{prices[prices.length - 1]?.toFixed(5)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">24h High</span>
                      <span className="font-mono font-semibold text-bull">{Math.max(...prices).toFixed(5)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">24h Low</span>
                      <span className="font-mono font-semibold text-bear">{Math.min(...prices).toFixed(5)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/30">
                      <span className="text-sm text-muted-foreground">Change</span>
                      <span className={`font-mono font-semibold ${prices[prices.length - 1] >= prices[0] ? 'text-bull' : 'text-bear'}`}>
                        {((prices[prices.length - 1] - prices[0]) / prices[0] * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}