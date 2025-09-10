import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GameStatsProps {
  score: number;
  spins: number;
  matches: number;
  completedLines: number;
  maxSpins?: number;
}

export const GameStats = ({ score, spins, matches, completedLines, maxSpins = 12 }: GameStatsProps) => {
  const remainingSpins = maxSpins - spins;
  const isLowSpins = remainingSpins <= 2 && remainingSpins > 0;
  const isNoSpins = remainingSpins <= 0;

  const stats = [
    { label: "Score", value: score, color: "text-secondary" },
    { 
      label: "Spins Left", 
      value: remainingSpins, 
      color: isNoSpins ? "text-destructive" : isLowSpins ? "text-yellow-500" : "text-foreground" 
    },
    { label: "Matches", value: matches, color: "text-casino-green" },
    { label: "Lines", value: completedLines, color: "text-accent" }
  ];

  return (
    <Card className="bg-gradient-to-br from-card to-slate-800 border-border shadow-lg">
      <CardContent className="p-4">
        <div className="grid grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={cn("text-2xl font-bold", stat.color)}>
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};