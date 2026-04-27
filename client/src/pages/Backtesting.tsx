import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TestTube2, Bot, TrendingUp, Calendar, DollarSign, BarChart3, Brain, Cpu, Zap, Network } from "lucide-react";
import { useMarket } from "@/contexts/MarketContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ComingSoon from "@/components/ComingSoon";

type AgentType = "IA" | "ML" | "Algoritmo" | "EA";

interface Agent {
  id: string;
  name: string;
  type: AgentType;
  description: string;
  icon: any;
}

export default function Backtesting() {
  const { market } = useMarket();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [showAgentDialog, setShowAgentDialog] = useState(false);

  // Backtesting parameters
  const [initialCapital, setInitialCapital] = useState("10000");
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2024-12-31");
  const [strategy, setStrategy] = useState("RSI");

  const agents: Agent[] = [
    {
      id: "gpt-agent",
      name: "GPT-5 Quant Analyst",
      type: "IA",
      description: "Advanced AI agent for strategy analysis and optimization",
      icon: Bot,
    },
    {
      id: "lstm-model",
      name: "LSTM Price Predictor",
      type: "ML",
      description: "Deep learning model for price prediction and trend analysis",
      icon: Brain,
    },
    {
      id: "random-forest",
      name: "Random Forest Classifier",
      type: "ML",
      description: "Machine learning model for pattern recognition and signals",
      icon: Network,
    },
    {
      id: "momentum-algo",
      name: "Momentum Strategy",
      type: "Algoritmo",
      description: "Classic momentum-based trading algorithm",
      icon: TrendingUp,
    },
    {
      id: "mean-reversion",
      name: "Mean Reversion EA",
      type: "EA",
      description: "Expert advisor for mean reversion strategies",
      icon: Zap,
    },
    {
      id: "grid-trading",
      name: "Grid Trading Bot",
      type: "EA",
      description: "Automated grid trading expert advisor",
      icon: Cpu,
    },
    {
      id: "inside-trading",
      name: "Inside Trading Analyzer",
      type: "Algoritmo",
      description: "Advanced algorithm for analyzing institutional trading patterns",
      icon: BarChart3,
    },
  ];

  const getTypeColor = (type: AgentType) => {
    switch (type) {
      case "IA":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "ML":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Algoritmo":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "EA":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const runBacktest = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("simulate-strategy", {
        body: {
          strategyType: strategy.toLowerCase(),
          initialCapital: parseFloat(initialCapital),
          market,
          startDate,
          endDate,
        },
      });

      if (error) throw error;

      setResults(data);
      toast.success("Backtesting completado");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al ejecutar backtesting");
    } finally {
      setLoading(false);
    }
  };

  const connectAgent = (agent: Agent) => {
    setShowAgentDialog(false);
    toast.success(`${agent.name} seleccionado`);
    setResults({
      type: "coming-soon",
      agentName: agent.name,
      agentType: agent.type,
      agentDescription: agent.description,
    });
  };

  return (
    <div className="min-h-full bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <TestTube2 className="h-6 w-6 text-primary" />
            Strategy Backtesting - {market.toUpperCase()}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Test trading strategies against historical data
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <Card className="p-6 lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Configuration
            </h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="capital">Initial Capital</Label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="capital"
                    type="number"
                    value={initialCapital}
                    onChange={(e) => setInitialCapital(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="strategy">Strategy Type</Label>
                <select
                  id="strategy"
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-background border border-input rounded-md text-foreground"
                >
                  <option value="RSI">RSI Strategy</option>
                  <option value="MACD">MACD Crossover</option>
                  <option value="Bollinger">Bollinger Bands</option>
                  <option value="Moving Average">Moving Average</option>
                </select>
              </div>

              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="endDate">End Date</Label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <Button
                  onClick={runBacktest}
                  disabled={loading}
                  className="w-full gap-2"
                >
                  <TestTube2 className="h-4 w-4" />
                  Run Backtest
                </Button>

                <Button
                  onClick={() => setShowAgentDialog(true)}
                  disabled={loading}
                  variant="secondary"
                  className="w-full gap-2"
                >
                  <Bot className="h-4 w-4" />
                  Connect Agent
                </Button>
              </div>
            </div>
          </Card>

          {/* Results Panel */}
          <Card className="p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Results
            </h3>

            {!results ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <TestTube2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Configure parameters and run backtest</p>
                </div>
              </div>
            ) : results.type === "coming-soon" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{results.agentName}</span>
                  </div>
                  {results.agentType && (
                    <Badge className={getTypeColor(results.agentType)}>
                      {results.agentType}
                    </Badge>
                  )}
                </div>
                <ComingSoon 
                  variant="card"
                  title="Función en desarrollo"
                  description={`La integración con ${results.agentName} estará disponible próximamente. ${results.agentDescription}`}
                />
              </div>
            ) : results.type === "agent" ? (
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-primary" />
                      <span className="font-semibold">{results.agentName || "AI Agent Analysis"}</span>
                    </div>
                    {results.agentType && (
                      <Badge className={getTypeColor(results.agentType)}>
                        {results.agentType}
                      </Badge>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap text-foreground">{results.analysis}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Total Return</div>
                    <div className="text-2xl font-bold text-bull">
                      {results.totalReturn ? `${results.totalReturn.toFixed(2)}%` : "N/A"}
                    </div>
                  </Card>

                  <Card className="p-4 bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Sharpe Ratio</div>
                    <div className="text-2xl font-bold text-foreground">
                      {results.sharpeRatio ? results.sharpeRatio.toFixed(2) : "N/A"}
                    </div>
                  </Card>

                  <Card className="p-4 bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Win Rate</div>
                    <div className="text-2xl font-bold text-foreground">
                      {results.winRate ? `${results.winRate.toFixed(1)}%` : "N/A"}
                    </div>
                  </Card>

                  <Card className="p-4 bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Max Drawdown</div>
                    <div className="text-2xl font-bold text-bear">
                      {results.maxDrawdown ? `${results.maxDrawdown.toFixed(2)}%` : "N/A"}
                    </div>
                  </Card>
                </div>

                {results.summary && (
                  <Card className="p-4 bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-2">Summary</div>
                    <p className="text-foreground">{results.summary}</p>
                  </Card>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Agent Selection Dialog */}
      <Dialog open={showAgentDialog} onOpenChange={setShowAgentDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Seleccionar Agente o Modelo
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {agents.map((agent) => {
              const Icon = agent.icon;
              return (
                <Card
                  key={agent.id}
                  className="p-4 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => connectAgent(agent)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{agent.name}</h4>
                      </div>
                    </div>
                    <Badge className={getTypeColor(agent.type)}>
                      {agent.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {agent.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
