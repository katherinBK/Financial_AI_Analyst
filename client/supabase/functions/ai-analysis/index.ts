import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prices, indicators, pair } = await req.json();
    
    if (!prices || !indicators) {
      throw new Error('Missing required data');
    }

    console.log('Starting AI analysis for', pair);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Prepare context for AI
    const priceChange = ((prices[prices.length - 1] - prices[0]) / prices[0] * 100).toFixed(2);
    const trend = parseFloat(priceChange) > 0 ? 'bullish' : 'bearish';
    
    const prompt = `You are a quantitative trading analyst. Analyze this Forex data for ${pair || 'currency pair'}:

PRICE DATA:
- Current Price: ${prices[prices.length - 1].toFixed(5)}
- Price Change: ${priceChange}%
- Trend: ${trend}

TECHNICAL INDICATORS:
- RSI: ${indicators.rsi?.value.toFixed(2)} (${indicators.rsi?.signal})
- MACD: ${indicators.macd?.macd.toFixed(5)} (${indicators.macd?.signal})
- Bollinger Bands: Upper ${indicators.bollingerBands?.upper.toFixed(5)}, Lower ${indicators.bollingerBands?.lower.toFixed(5)} (${indicators.bollingerBands?.signal})
- ATR Volatility: ${indicators.atr?.volatility?.toFixed(2)}%
- Sharpe Ratio: ${indicators.sharpeRatio?.value.toFixed(2)} (${indicators.sharpeRatio?.rating})

Provide:
1. Market sentiment analysis (bullish/bearish/neutral)
2. Key support and resistance levels
3. Trading recommendation (buy/sell/hold) with confidence level
4. Risk assessment
5. Short-term price prediction (next 24h)

Be concise and actionable.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert quantitative trading analyst specializing in Forex markets. Provide precise, actionable trading insights based on technical indicators.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    console.log('AI analysis completed successfully');

    return new Response(JSON.stringify({ 
      analysis,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in AI analysis:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});