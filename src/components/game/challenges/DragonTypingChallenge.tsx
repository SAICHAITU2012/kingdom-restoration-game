import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Zap, Heart } from 'lucide-react';
import { GameState } from '../GameState';
import dragonTyping from '@/assets/dragon-typing.jpg';

interface DragonTypingChallengeProps {
  gameState: GameState;
  onComplete: (success: boolean, stoneType?: 'space') => void;
  onHealthChange: (health: number) => void;
}

export const DragonTypingChallenge: React.FC<DragonTypingChallengeProps> = ({
  gameState,
  onComplete,
  onHealthChange,
}) => {
  const [currentLetter, setCurrentLetter] = useState('');
  const [score, setScore] = useState(0);
  const [dragonsDefeated, setDragonsDefeated] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [kingHealth, setKingHealth] = useState(gameState.kingHealth);

  const generateRandomLetter = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return letters[Math.floor(Math.random() * letters.length)];
  };

  const resetDragon = useCallback(() => {
    setCurrentLetter(generateRandomLetter());
  }, []);

  useEffect(() => {
    resetDragon();
  }, [resetDragon]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (dragonsDefeated >= 10) {
            onComplete(true, 'space');
          } else {
            onComplete(false);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [dragonsDefeated, onComplete]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const pressedKey = event.key.toUpperCase();
      
      if (pressedKey === currentLetter) {
        // Correct key - defeat dragon
        setScore(prev => prev + 10);
        setDragonsDefeated(prev => prev + 1);
        resetDragon();
        
        if (dragonsDefeated + 1 >= 10) {
          onComplete(true, 'space');
        }
      } else if (pressedKey.match(/[A-Z]/)) {
        // Wrong key - hurt king
        const newHealth = Math.max(0, kingHealth - 10);
        setKingHealth(newHealth);
        onHealthChange(newHealth);
        
        if (newHealth <= 0) {
          onComplete(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentLetter, kingHealth, dragonsDefeated, onComplete, onHealthChange, resetDragon]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-royal-gold mb-2">Dragon Typing Challenge</h1>
          <p className="text-muted-foreground">Defeat 10 dragons by typing the correct letters!</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-stone-space">{dragonsDefeated}/10</div>
            <div className="text-sm text-muted-foreground">Dragons Defeated</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-royal-gold">{score}</div>
            <div className="text-sm text-muted-foreground">Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{timeLeft}s</div>
            <div className="text-sm text-muted-foreground">Time Left</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <Heart className="text-destructive" size={20} />
              <Progress value={kingHealth} className="w-16" />
            </div>
            <div className="text-sm text-muted-foreground">King's Health</div>
          </div>
        </div>

        {/* Dragon Battle Area */}
        <div className="relative">
          <div 
            className="h-64 bg-cover bg-center rounded-lg mb-6 flex items-center justify-center"
            style={{ backgroundImage: `url(${dragonTyping})` }}
          >
            <div className="bg-royal-purple text-white text-6xl font-bold px-8 py-4 rounded-lg animate-magic-glow border-4 border-royal-gold">
              {currentLetter}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center mb-6">
          <p className="text-lg mb-2">
            Press <span className="bg-royal-purple text-white px-2 py-1 rounded font-mono">{currentLetter}</span> to defeat the dragon!
          </p>
          <p className="text-sm text-muted-foreground">
            Correct key = <Zap className="inline text-royal-gold" size={16} /> Defeat dragon | 
            Wrong key = <Heart className="inline text-destructive" size={16} /> Lose health
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <Progress value={(dragonsDefeated / 10) * 100} className="w-full h-3" />
          <div className="text-center mt-2 text-sm text-muted-foreground">
            Challenge Progress: {dragonsDefeated}/10 dragons defeated
          </div>
        </div>

        <div className="text-center">
          <Button 
            onClick={() => onComplete(false)}
            variant="outline"
          >
            Retreat
          </Button>
        </div>
      </Card>
    </div>
  );
};