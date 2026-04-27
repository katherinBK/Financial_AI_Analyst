import { Sparkles, Clock, Rocket } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ComingSoonProps {
  title?: string;
  description?: string;
  variant?: "default" | "compact" | "card";
  className?: string;
}

export default function ComingSoon({ 
  title = "Próximamente", 
  description = "Esta función estará disponible pronto",
  variant = "default",
  className = ""
}: ComingSoonProps) {
  
  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 text-muted-foreground ${className}`}>
        <Clock className="h-4 w-4" />
        <span className="text-sm">{title}</span>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 animate-ping">
              <Sparkles className="h-12 w-12 text-primary/30" />
            </div>
            <Rocket className="h-12 w-12 text-primary relative z-10" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center text-center space-y-6 py-12 ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 animate-ping opacity-75">
          <div className="h-20 w-20 rounded-full bg-primary/20" />
        </div>
        <div className="relative z-10 p-6 rounded-full bg-primary/10">
          <Rocket className="h-8 w-8 text-primary" />
        </div>
      </div>
      
      <div className="space-y-2 max-w-md">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>Estamos trabajando en ello</span>
      </div>
    </div>
  );
}
