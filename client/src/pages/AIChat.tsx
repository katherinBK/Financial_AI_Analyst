import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Send, TrendingUp, Lightbulb, AlertCircle, BarChart, Zap, Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMarket } from "@/contexts/MarketContext";
import { Badge } from "@/components/ui/badge";

interface Message {
  role: "user" | "assistant" | "feedback";
  content: string;
  feedbackGiven?: boolean;
}

type ToolMode = "default" | "reasoning" | "search";

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTool, setSelectedTool] = useState<ToolMode>("default");
  const [showStrategyForm, setShowStrategyForm] = useState(false);
  const [strategyForm, setStrategyForm] = useState({
    market: "",
    symbol: "",
    capital: "",
    maxDrawdown: "",
  });
  const { market } = useMarket();

  const tools = [
    { id: "default" as ToolMode, icon: Brain, label: "Default", description: "Análisis estándar" },
    { id: "reasoning" as ToolMode, icon: Zap, label: "Reasoning", description: "Análisis profundo" },
    { id: "search" as ToolMode, icon: Search, label: "Search", description: "Búsqueda de información" },
  ];

  const quickPrompts = [
    { icon: TrendingUp, text: "Analiza la tendencia actual", color: "text-bull" },
    { icon: Lightbulb, text: "Dame una estrategia de trading", color: "text-chart-2" },
    { icon: AlertCircle, text: "Identifica riesgos del mercado", color: "text-bear" },
    { icon: BarChart, text: "Explica los indicadores técnicos", color: "text-primary" },
  ];

  const handleQuickPrompt = (promptText: string) => {
    if (promptText === "Dame una estrategia de trading") {
      setShowStrategyForm(true);
    } else {
      sendMessage(promptText);
    }
  };

  const handleStrategyFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = `Dame una estrategia de trading con los siguientes parámetros:
- Mercado: ${strategyForm.market}
- Símbolo: ${strategyForm.symbol}
- Capital: ${strategyForm.capital}
- Drawdown máximo: ${strategyForm.maxDrawdown}%`;
    
    setShowStrategyForm(false);
    setStrategyForm({ market: "", symbol: "", capital: "", maxDrawdown: "" });
    sendMessage(prompt, true);
  };

  const sendMessage = async (customPrompt?: string, isStrategy: boolean = false) => {
    const messageToSend = customPrompt || input;
    if (!messageToSend.trim()) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: messageToSend }]);
    setLoading(true);

    try {
      // Preparar el contexto de conversación (mensajes previos)
      const conversationContext = messages.map(msg => ({
        role: msg.role === "feedback" ? "assistant" : msg.role,
        content: msg.content
      }));

      // Determinar el tool correcto
      let toolToUse: string | null = null;
      
      if (selectedTool === "reasoning") {
        toolToUse = "react";
      } else if (selectedTool === "search") {
        toolToUse = "search";
      }

      if (isStrategy) {
        toolToUse = "react"; // Las estrategias siempre requieren razonamiento profundo
        metadata = {
          market: strategyForm.market || market,
          symbol: strategyForm.symbol,
          capital: strategyForm.capital,
          maxDrawdown: strategyForm.maxDrawdown,
        };
      }

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/orchestrator/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: messageToSend,
          tool: toolToUse,
          market: isStrategy ? (strategyForm.market || market) : market,
          metadata: metadata,
          context: conversationContext.length > 0 ? conversationContext : null,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      // Extraer el texto de la respuesta
      const aiText = data.text || data.raw?.text || JSON.stringify(data);

      setMessages((prev) => {
        const newMessages = [
          ...prev,
          { role: "assistant" as const, content: aiText },
        ];
        
        // Si es una estrategia, agregar mensaje de feedback
        if (isStrategy) {
          newMessages.push({
            role: "feedback" as const,
            content: "¿La predicción fue acertada?",
            feedbackGiven: false,
          });
        }
        
        return newMessages;
      });
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al comunicarse con la API");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = (messageIndex: number, answer: "yes" | "no") => {
    setMessages((prev) =>
      prev.map((msg, idx) =>
        idx === messageIndex ? { ...msg, feedbackGiven: true } : msg
      )
    );
    toast.success(answer === "yes" ? "¡Excelente!" : "Gracias por tu feedback");
  };

  return (
    <div className="h-full flex flex-col bg-background p-3 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
          <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          AI Trading Assistant
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Powered by Local AI Reasoning - Market: {market.toUpperCase()}
        </p>
      </div>

      {/* Messages Area */}
      <Card className="flex-1 overflow-y-auto p-3 sm:p-6 mb-4 space-y-3 sm:space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Brain className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm sm:text-base">Pregunta sobre análisis técnico, estrategias o predicciones</p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "feedback" ? (
                <div className="max-w-[90%] sm:max-w-[80%] p-3 sm:p-4 rounded-lg text-sm sm:text-base bg-muted text-foreground">
                  <p className="mb-3 font-medium">{msg.content}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleFeedback(idx, "yes")}
                      disabled={msg.feedbackGiven}
                    >
                      Sí
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFeedback(idx, "no")}
                      disabled={msg.feedbackGiven}
                    >
                      No
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className={`max-w-[90%] sm:max-w-[80%] p-3 sm:p-4 rounded-lg text-sm sm:text-base ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              )}
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted p-3 sm:p-4 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <div className="animate-pulse">Thinking...</div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Strategy Form */}
      {showStrategyForm && (
        <Card className="mb-4 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Parámetros de Estrategia</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowStrategyForm(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <form onSubmit={handleStrategyFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="market">Mercado</Label>
              <Input
                id="market"
                value={strategyForm.market}
                onChange={(e) => setStrategyForm(prev => ({ ...prev, market: e.target.value }))}
                placeholder="Ej: Forex, Stocks, Crypto"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="symbol">Símbolo</Label>
              <Input
                id="symbol"
                value={strategyForm.symbol}
                onChange={(e) => setStrategyForm(prev => ({ ...prev, symbol: e.target.value }))}
                placeholder="Ej: EUR/USD, AAPL, BTC"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capital">Capital</Label>
              <Input
                id="capital"
                type="number"
                value={strategyForm.capital}
                onChange={(e) => setStrategyForm(prev => ({ ...prev, capital: e.target.value }))}
                placeholder="Ej: 10000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxDrawdown">Drawdown Máximo (%)</Label>
              <Input
                id="maxDrawdown"
                type="number"
                value={strategyForm.maxDrawdown}
                onChange={(e) => setStrategyForm(prev => ({ ...prev, maxDrawdown: e.target.value }))}
                placeholder="Ej: 20"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Generar Estrategia
            </Button>
          </form>
        </Card>
      )}

      {/* Quick Prompts */}
      {messages.length === 0 && !showStrategyForm && (
        <div className="mb-3 flex flex-wrap gap-2">
          {quickPrompts.map((prompt, idx) => (
            <Button
              key={idx}
              variant="outline"
              size="sm"
              onClick={() => handleQuickPrompt(prompt.text)}
              disabled={loading}
              className="text-xs sm:text-sm flex items-center gap-1.5"
            >
              <prompt.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${prompt.color}`} />
              <span className="hidden sm:inline">{prompt.text}</span>
              <span className="sm:hidden">{prompt.text.split(' ')[0]}</span>
            </Button>
          ))}
        </div>
      )}

      {/* Tools Selection */}
      <div className="mb-3 flex flex-wrap gap-2">
        {tools.map((tool) => (
          <Button
            key={tool.id}
            variant={selectedTool === tool.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTool(tool.id)}
            className="text-xs sm:text-sm flex items-center gap-1.5"
          >
            <tool.icon className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{tool.label}</span>
          </Button>
        ))}
      </div>

      {/* Input Area */}
      <div className="space-y-2">
        {selectedTool !== "default" && (
          <Badge variant="secondary" className="text-xs">
            {tools.find(t => t.id === selectedTool)?.description}
          </Badge>
        )}
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Escribe tu pregunta sobre análisis técnico, estrategias de trading..."
            className="min-h-[60px] resize-none text-sm sm:text-base"
            disabled={loading}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            size="icon"
            className="h-[60px] w-[60px] shrink-0"
          >
            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
