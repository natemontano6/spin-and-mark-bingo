import { cn } from "@/lib/utils";

interface BingoCell {
  number: number;
  marked: boolean;
  column: 'B' | 'I' | 'N' | 'G' | 'O';
}

interface BingoCardProps {
  card: BingoCell[][];
  onCellClick?: (row: number, col: number) => void;
  winningCells?: Set<string>;
}

export const BingoCard = ({ card, onCellClick, winningCells = new Set() }: BingoCardProps) => {
  const headers = ['B', 'I', 'N', 'G', 'O'];

  return (
    <div className="bg-gradient-to-br from-card to-slate-800 rounded-xl p-4 shadow-2xl border border-border">
      {/* Header */}
      <div className="grid grid-cols-5 gap-2 mb-3">
        {headers.map((letter, index) => (
          <div
            key={letter}
            className="h-12 flex items-center justify-center bg-gradient-to-br from-primary to-primary-glow rounded-lg text-primary-foreground font-bold text-xl casino-glow"
          >
            {letter}
          </div>
        ))}
      </div>

      {/* Bingo Grid */}
      <div className="grid grid-cols-5 gap-2">
        {card.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const cellKey = `${rowIndex}-${colIndex}`;
            const isWinning = winningCells.has(cellKey);
            
            return (
              <div
                key={cellKey}
                onClick={() => onCellClick?.(rowIndex, colIndex)}
                className={cn(
                  "h-14 flex items-center justify-center rounded-lg font-semibold text-lg border-2 transition-all duration-300",
                  "bg-gradient-to-br from-muted to-slate-700 border-border text-foreground",
                  "hover:scale-105 cursor-pointer",
                  cell.marked && "bingo-cell marked",
                  isWinning && "winner-glow"
                )}
              >
                {/* Center cell is FREE */}
                {rowIndex === 2 && colIndex === 2 ? (
                  <span className="text-xs font-bold text-secondary">FREE</span>
                ) : (
                  <span>{cell.number}</span>
                )}
                
                {/* Marked overlay */}
                {cell.marked && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-secondary text-accent-foreground flex items-center justify-center font-bold text-sm">
                      ✓
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};