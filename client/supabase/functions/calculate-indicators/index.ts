import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// RSI (Relative Strength Index)
function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;
  
  const changes = prices.slice(-period - 1).map((price, i, arr) => 
    i === 0 ? 0 : price - arr[i - 1]
  ).slice(1);
  
  const gains = changes.map(c => c > 0 ? c : 0);
  const losses = changes.map(c => c < 0 ? Math.abs(c) : 0);
  
  const avgGain = gains.reduce((a, b) => a + b, 0) / period;
  const avgLoss = losses.reduce((a, b) => a + b, 0) / period;
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// MACD (Moving Average Convergence Divergence)
function calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macd = ema12 - ema26;
  
  // Signal line (9-period EMA of MACD)
  const macdValues = [macd];
  const signal = calculateEMA(macdValues, 9);
  const histogram = macd - signal;
  
  return { macd, signal, histogram };
}

function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  
  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }
  
  return ema;
}

// Bollinger Bands
function calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2): {
  upper: number;
  middle: number;
  lower: number;
  bandwidth: number;
} {
  const middle = prices.slice(-period).reduce((a, b) => a + b, 0) / period;
  const variance = prices.slice(-period)
    .map(p => Math.pow(p - middle, 2))
    .reduce((a, b) => a + b, 0) / period;
  const sd = Math.sqrt(variance);
  
  const upper = middle + (stdDev * sd);
  const lower = middle - (stdDev * sd);
  const bandwidth = ((upper - lower) / middle) * 100;
  
  return { upper, middle, lower, bandwidth };
}

// ATR (Average True Range)
function calculateATR(highs: number[], lows: number[], closes: number[], period: number = 14): number {
  const trueRanges = highs.map((high, i) => {
    if (i === 0) return high - lows[i];
    
    const tr1 = high - lows[i];
    const tr2 = Math.abs(high - closes[i - 1]);
    const tr3 = Math.abs(lows[i] - closes[i - 1]);
    
    return Math.max(tr1, tr2, tr3);
  });
  
  return trueRanges.slice(-period).reduce((a, b) => a + b, 0) / period;
}

// Sharpe Ratio (annualized)
function calculateSharpeRatio(returns: number[], riskFreeRate: number = 0.02): number {
  if (returns.length === 0) return 0;
  
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.map(r => Math.pow(r - avgReturn, 2)).reduce((a, b) => a + b, 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  
  if (stdDev === 0) return 0;
  
  // Annualize (assuming daily returns)
  const annualizedReturn = avgReturn * 252;
  const annualizedStdDev = stdDev * Math.sqrt(252);
  
  return (annualizedReturn - riskFreeRate) / annualizedStdDev;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prices, highs, lows, closes } = await req.json();
    
    if (!prices || !Array.isArray(prices) || prices.length === 0) {
      throw new Error('Invalid prices data');
    }

    console.log('Calculating indicators for', prices.length, 'data points');
    
    const rsi = calculateRSI(prices);
    const macd = calculateMACD(prices);
    const bollingerBands = calculateBollingerBands(prices);
    
    // ATR requires highs, lows, closes
    let atr = null;
    if (highs && lows && closes) {
      atr = calculateATR(highs, lows, closes);
    }
    
    // Calculate returns for Sharpe ratio
    const returns = prices.slice(1).map((price, i) => (price - prices[i]) / prices[i]);
    const sharpeRatio = calculateSharpeRatio(returns);
    
    // Generate trading signals
    const signals = {
      rsi: rsi < 30 ? 'oversold' : rsi > 70 ? 'overbought' : 'neutral',
      macdSignal: macd.histogram > 0 ? 'bullish' : 'bearish',
      bollingerBands: prices[prices.length - 1] < bollingerBands.lower ? 'buy' : 
                      prices[prices.length - 1] > bollingerBands.upper ? 'sell' : 'hold',
    };
    
    const result = {
      indicators: {
        rsi: {
          value: rsi,
          signal: signals.rsi,
        },
        macd: {
          ...macd,
          signalType: signals.macdSignal,
        },
        bollingerBands: {
          ...bollingerBands,
          signal: signals.bollingerBands,
        },
        atr: atr ? {
          value: atr,
          volatility: atr / prices[prices.length - 1] * 100, // As percentage
        } : null,
        sharpeRatio: {
          value: sharpeRatio,
          rating: sharpeRatio > 2 ? 'excellent' : sharpeRatio > 1 ? 'good' : sharpeRatio > 0 ? 'acceptable' : 'poor',
        },
      },
      currentPrice: prices[prices.length - 1],
      timestamp: new Date().toISOString(),
    };

    console.log('Indicators calculated successfully:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error calculating indicators:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});