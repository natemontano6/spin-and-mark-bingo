import { useState, useCallback, useEffect } from "react";
import { BingoCard } from "@/components/BingoCard";
import { SlotMachine } from "@/components/SlotMachine";
import { GameStats } from "@/components/GameStats";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BingoCell {
  number: number;
  marked: boolean;
  column: 'B' | 'I' | 'N' | 'G' | 'O';
}

interface SlotResult {
  column: 'B' | 'I' | 'N' | 'G' | 'O';
  value: number | string;
  isSpecial: boolean;
}

const BINGO_RANGES = {
  B: { min: 1, max: 15 },
  I: { min: 16, max: 30 },
  N: { min: 31, max: 45 },
  G: { min: 46, max: 60 },
  O: { min: 61, max: 75 }
};

const Index = () => {
  const [bingoCard, setBingoCard] = useState<BingoCell[][]>([]);
  const [score, setScore] = useState(0);
  const [spins, setSpins] = useState(0);
  const [matches, setMatches] = useState(0);
  const [completedLines, setCompletedLines] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningCells, setWinningCells] = useState<Set<string>>(new Set());

  // Generate a new bingo card
  const generateBingoCard = useCallback(() => {
    const columns: ('B' | 'I' | 'N' | 'G' | 'O')[] = ['B', 'I', 'N', 'G', 'O'];
    const newCard: BingoCell[][] = [];

    for (let row = 0; row < 5; row++) {
      const cardRow: BingoCell[] = [];
      for (let col = 0; col < 5; col++) {
        const column = columns[col];
        const range = BINGO_RANGES[column];
        
        // Center cell is free
        if (row === 2 && col === 2) {
          cardRow.push({
            number: 0, // FREE space
            marked: true,
            column
          });
        } else {
          // Generate unique number for this column
          let number;
          do {
            number = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
          } while (newCard.some(r => r.some(cell => cell.number === number && cell.column === column)));
          
          cardRow.push({
            number,
            marked: false,
            column
          });
        }
      }
      newCard.push(cardRow);
    }
    
    setBingoCard(newCard);
    setScore(0);
    setSpins(0);
    setMatches(0);
    setCompletedLines(0);
    setWinningCells(new Set());
    toast("New bingo card generated! 🎯");
  }, []);

  // Check for winning patterns
  const checkWinningPatterns = useCallback((card: BingoCell[][]) => {
    const newWinningCells = new Set<string>();
    let linesCompleted = 0;

    // Check rows
    for (let row = 0; row < 5; row++) {
      if (card[row].every(cell => cell.marked)) {
        for (let col = 0; col < 5; col++) {
          newWinningCells.add(`${row}-${col}`);
        }
        linesCompleted++;
      }
    }

    // Check columns
    for (let col = 0; col < 5; col++) {
      if (card.every(row => row[col].marked)) {
        for (let row = 0; row < 5; row++) {
          newWinningCells.add(`${row}-${col}`);
        }
        linesCompleted++;
      }
    }

    // Check diagonals
    if (card.every((row, index) => row[index].marked)) {
      for (let i = 0; i < 5; i++) {
        newWinningCells.add(`${i}-${i}`);
      }
      linesCompleted++;
    }

    if (card.every((row, index) => row[4 - index].marked)) {
      for (let i = 0; i < 5; i++) {
        newWinningCells.add(`${i}-${4 - i}`);
      }
      linesCompleted++;
    }

    setWinningCells(newWinningCells);
    
    // Award points for new lines
    if (linesCompleted > completedLines) {
      const newLines = linesCompleted - completedLines;
      setScore(prev => prev + newLines * 1000);
      setCompletedLines(linesCompleted);
      
      if (newLines > 0) {
        toast(`BINGO! ${newLines} line${newLines > 1 ? 's' : ''} completed! 🎉`);
      }
    }

    // Check for full card
    if (card.every(row => row.every(cell => cell.marked))) {
      toast("FULL CARD! BLACKOUT BINGO! 🎊");
      setScore(prev => prev + 5000);
    }
  }, [completedLines]);

  // Handle slot machine results
  const handleSlotResult = useCallback((results: SlotResult[]) => {
    setIsSpinning(false);
    setSpins(prev => prev + 1);
    
    let newMatches = 0;
    const updatedCard = [...bingoCard];

    results.forEach((result, index) => {
      if (!result.isSpecial && typeof result.value === 'number') {
        // Check if this number exists on the card in the correct column
        for (let row = 0; row < 5; row++) {
          const cell = updatedCard[row][index];
          if (cell.number === result.value && !cell.marked) {
            cell.marked = true;
            newMatches++;
            toast(`Match found! ${result.column}${result.value} 🎯`);
          }
        }
      } else if (result.isSpecial) {
        // Special symbols give bonus points
        setScore(prev => prev + 500);
        toast(`Special symbol! ${result.value} +500 points! ✨`);
      }
    });

    if (newMatches > 0) {
      setMatches(prev => prev + newMatches);
      setScore(prev => prev + newMatches * 100);
      setBingoCard(updatedCard);
      
      // Check for winning patterns after a short delay
      setTimeout(() => checkWinningPatterns(updatedCard), 300);
    }
  }, [bingoCard, checkWinningPatterns]);

  const handleSpin = () => {
    setIsSpinning(true);
  };

  // Initialize the game
  useEffect(() => {
    generateBingoCard();
  }, [generateBingoCard]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-slate-900 to-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
            🎰 BINGO SLOTS 🎰
          </h1>
          <p className="text-muted-foreground">Match the slots to mark your card!</p>
        </div>

        {/* Game Stats */}
        <GameStats 
          score={score}
          spins={spins}
          matches={matches}
          completedLines={completedLines}
        />

        {/* Bingo Card */}
        <BingoCard 
          card={bingoCard}
          winningCells={winningCells}
        />

        {/* Slot Machine */}
        <SlotMachine 
          onSpin={handleSlotResult}
          isSpinning={isSpinning}
        />

        {/* New Game Button */}
        <Button
          onClick={generateBingoCard}
          variant="outline"
          className="w-full bg-gradient-to-r from-muted to-slate-700 border-border hover:from-slate-700 hover:to-muted"
        >
          🎯 New Game 🎯
        </Button>
      </div>
    </div>
  );
};

export default Index;