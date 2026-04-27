import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Monte Carlo simulation for price prediction
function monteCarloSimulation(
  currentPrice: number,
  volatility: number,
  drift: number,
  days: number,
  simulations: number = 1000
): {
  predictions: number[][];
  statistics: {
    mean: number;
    median: number;
    percentile95: number;
    percentile5: number;
  };
} {
  const dt = 1 / 252; // Daily steps (trading days)
  const predictions: number[][] = [];
  
  for (let sim = 0; sim < simulations; sim++) {
    const path = [currentPrice];
    let price = currentPrice;
    
    for (let day = 0; day < days; day++) {
      // Generate random normal variable (Box-Muller transform)
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      
      // Geometric Brownian Motion
      const change = drift * dt + volatility * Math.sqrt(dt) * z;
      price = price * Math.exp(change);
      path.push(price);
    }
    
    predictions.push(path);
  }
  
  // Calculate statistics
  const finalPrices = predictions.map(p => p[p.length - 1]).sort((a, b) => a - b);
  const mean = finalPrices.reduce((a, b) => a + b, 0) / finalPrices.length;
  const median = finalPrices[Math.floor(finalPrices.length / 2)];
  const percentile95 = finalPrices[Math.floor(finalPrices.length * 0.95)];
  const percentile5 = finalPrices[Math.floor(finalPrices.length * 0.05)];
  
  return {
    predictions: predictions.slice(0, 10), // Return only 10 sample paths for visualization
    statistics: { mean, median, percentile95, percentile5 },
  };
}

// Backtest strategy
function backtestStrategy(
  prices: number[],
  signals: string[], // 'buy', 'sell', 'hold'
  initialCapital: number = 10000
): {
  finalCapital: number;
  returns: number;
  trades: number;
  winRate: number;
  maxDrawdown: number;
} {
  let capital = initialCapital;
  let position = 0; // 0 = no position, 1 = long position
  let entryPrice = 0;
  let trades = 0;
  let wins = 0;
  let peak = initialCapital;
  let maxDrawdown = 0;
  
  for (let i = 1; i < prices.length; i++) {
    const signal = signals[i];
    const price = prices[i];
    
    if (signal === 'buy' && position === 0) {
      // Enter long position
      position = 1;
      entryPrice = price;
      trades++;
    } else if (signal === 'sell' && position === 1) {
      // Exit position
      const profitLoss = (price - entryPrice) / entryPrice;
      capital = capital * (1 + profitLoss);
      
      if (profitLoss > 0) wins++;
      position = 0;
    }
    
    // Track drawdown
    if (capital > peak) peak = capital;
    const drawdown = (peak - capital) / peak;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }
  
  const returns = ((capital - initialCapital) / initialCapital) * 100;
  const winRate = trades > 0 ? (wins / trades) * 100 : 0;
  
  return {
    finalCapital: capital,
    returns,
    trades,
    winRate,
    maxDrawdown: maxDrawdown * 100,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data } = await req.json();
    
    console.log('Running simulation:', type);

    if (type === 'montecarlo') {
      const { currentPrice, volatility, drift, days } = data;
      
      if (!currentPrice || !volatility || !days) {
        throw new Error('Missing required parameters for Monte Carlo simulation');
      }
      
      const result = monteCarloSimulation(
        currentPrice,
        volatility,
        drift || 0,
        days,
        1000
      );
      
      console.log('Monte Carlo simulation completed');
      
      return new Response(JSON.stringify({ 
        type: 'montecarlo',
        result,
        timestamp: new Date().toISOString(),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (type === 'backtest') {
      const { prices, signals, initialCapital } = data;
      
      if (!prices || !signals) {
        throw new Error('Missing required parameters for backtest');
      }
      
      const result = backtestStrategy(prices, signals, initialCapital || 10000);
      
      console.log('Backtest completed:', result);
      
      return new Response(JSON.stringify({ 
        type: 'backtest',
        result,
        timestamp: new Date().toISOString(),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    throw new Error('Invalid simulation type');
    
  } catch (error) {
    console.error('Error in simulation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});