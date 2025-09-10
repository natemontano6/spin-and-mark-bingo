import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SlotResult {
  column: 'B' | 'I' | 'N' | 'G' | 'O';
  value: number | string;
  isSpecial: boolean;
}

interface SlotMachineProps {
  onSpin: (results: SlotResult[]) => void;
  isSpinning: boolean;
  spinsRemaining: number;
}

const BINGO_RANGES = {
  B: { min: 1, max: 15 },
  I: { min: 16, max: 30 },
  N: { min: 31, max: 45 },
  G: { min: 46, max: 60 },
  O: { min: 61, max: 75 }
};

const SPECIAL_SYMBOLS = ['🃏', '⭐', '💎', '🎯', '🔥'];
const BULLSEYE_SYMBOL = '🎯';
const GOLD_BULLSEYE_SYMBOL = '🟡🎯';

export const SlotMachine = ({ onSpin, isSpinning, spinsRemaining }: SlotMachineProps) => {
  const [reelValues, setReelValues] = useState<(number | string)[]>([1, 16, 31, 46, 61]);
  const [animatingReels, setAnimatingReels] = useState<boolean[]>([false, false, false, false, false]);

  const generateRandomValue = (column: 'B' | 'I' | 'N' | 'G' | 'O'): number | string => {
    const rand = Math.random();
    
    // 2% chance for gold bullseye
    if (rand < 0.02) {
      return GOLD_BULLSEYE_SYMBOL;
    }
    // 3% chance for regular bullseye
    else if (rand < 0.05) {
      return BULLSEYE_SYMBOL;
    }
    // 5% chance for other special symbols
    else if (rand < 0.1) {
      const otherSymbols = SPECIAL_SYMBOLS.filter(s => s !== BULLSEYE_SYMBOL);
      return otherSymbols[Math.floor(Math.random() * otherSymbols.length)];
    }
    
    const range = BINGO_RANGES[column];
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  };

  const handleSpin = async () => {
    if (isSpinning) return;

    // Start spinning animation for all reels
    setAnimatingReels([true, true, true, true, true]);

    // Generate random spinning values
    const spinInterval = setInterval(() => {
      setReelValues(prev => prev.map((_, index) => {
        const columns: ('B' | 'I' | 'N' | 'G' | 'O')[] = ['B', 'I', 'N', 'G', 'O'];
        return generateRandomValue(columns[index]);
      }));
    }, 100);

    // Stop reels one by one with delays
    const results: SlotResult[] = [];
    const columns: ('B' | 'I' | 'N' | 'G' | 'O')[] = ['B', 'I', 'N', 'G', 'O'];

    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const value = generateRandomValue(columns[i]);
        const isSpecial = typeof value === 'string';
        
        results.push({
          column: columns[i],
          value,
          isSpecial
        });

        setAnimatingReels(prev => {
          const newState = [...prev];
          newState[i] = false;
          return newState;
        });

        setReelValues(prev => {
          const newValues = [...prev];
          newValues[i] = value;
          return newValues;
        });

        // If this is the last reel, call onSpin
        if (i === 4) {
          clearInterval(spinInterval);
          setTimeout(() => onSpin(results), 200);
        }
      }, 500 + i * 300);
    }
  };

  const columns = ['B', 'I', 'N', 'G', 'O'];

  return (
    <div className="bg-gradient-to-br from-card to-slate-800 rounded-xl p-6 border border-border shadow-2xl">
      <h2 className="text-2xl font-bold text-center mb-4 text-secondary">🎰 SLOT MACHINE 🎰</h2>
      
      {/* Slot Reels */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {columns.map((letter, index) => (
          <div key={letter} className="text-center">
            <div className="text-sm font-bold text-muted-foreground mb-2">{letter}</div>
            <div className="slot-reel h-20 flex items-center justify-center relative overflow-hidden">
              <div
                className={cn(
                  "text-2xl font-bold transition-all duration-200",
                  animatingReels[index] && "animate-slot-spin",
                  typeof reelValues[index] === 'string' ? "text-accent" : "text-foreground"
                )}
              >
                {reelValues[index]}
              </div>
              
              {/* Spinning overlay */}
              {animatingReels[index] && (
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-primary/20 to-transparent animate-pulse" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Spin Button */}
      <Button
        onClick={handleSpin}
        disabled={isSpinning || spinsRemaining <= 0}
        className={cn(
          "w-full h-14 text-xl font-bold disabled:opacity-50 casino-glow",
          spinsRemaining <= 0 
            ? "bg-gradient-to-r from-destructive to-red-600" 
            : "bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary"
        )}
      >
        {isSpinning ? "SPINNING..." : spinsRemaining <= 0 ? "NO SPINS LEFT!" : "🎰 SPIN! 🎰"}
      </Button>
    </div>
  );
};