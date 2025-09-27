import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Heart, ArrowLeft, ArrowRight } from 'lucide-react';
import { GameState } from '../GameState';

interface ReverseRunnerChallengeProps {
  gameState: GameState;
  onComplete: (success: boolean, stoneType?: 'air') => void;
  onHealthChange: (health: number) => void;
}

export const ReverseRunnerChallenge: React.FC<ReverseRunnerChallengeProps> = ({
  gameState,
  onComplete,
  onHealthChange,
}) => {
  const [kingPosition, setKingPosition] = useState(5); // Center of 10-wide track
  const [obstacles, setObstacles] = useState<number[]>([]);
  const [distance, setDistance] = useState(0);
  const [kingHealth, setKingHealth] = useState(gameState.kingHealth);
  const [gameSpeed, setGameSpeed] = useState(1000);

  const trackWidth = 10;
  const targetDistance = 10;

  const generateObstacles = useCallback(() => {
    const newObstacles: number[] = [];
    // Generate 3-4 obstacles in random positions
    for (let i = 0; i < Math.floor(Math.random() * 2) + 3; i++) {
      newObstacles.push(Math.floor(Math.random() * trackWidth));
    }
    setObstacles(newObstacles);
  }, []);

  useEffect(() => {
    generateObstacles();
  }, [generateObstacles]);

  // Game loop
  useEffect(() => {
    const gameLoop = setInterval(() => {
      setDistance(prev => {
        const newDistance = prev + 1;
        if (newDistance >= targetDistance) {
          onComplete(true, 'air');
          return newDistance;
        }
        return newDistance;
      });

      // Generate new obstacles periodically
      if (Math.random() < 0.3) {
        generateObstacles();
      }

      // Increase speed over time
      setGameSpeed(prev => Math.max(300, prev - 10));
    }, gameSpeed);

    return () => clearInterval(gameLoop);
  }, [gameSpeed, onComplete, generateObstacles]);

  // Check for collisions
  useEffect(() => {
    if (obstacles.includes(kingPosition)) {
      const newHealth = Math.max(0, kingHealth - 20);
      setKingHealth(newHealth);
      onHealthChange(newHealth);
      
      if (newHealth <= 0) {
        onComplete(false);
      }
      
      // Remove the hit obstacle
      setObstacles(prev => prev.filter(pos => pos !== kingPosition));
    }
  }, [kingPosition, obstacles, kingHealth, onComplete, onHealthChange]);

  // Controls (reversed)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        // Left key moves king RIGHT (reversed controls)
        setKingPosition(prev => Math.min(trackWidth - 1, prev + 1));
      } else if (event.key === 'ArrowRight') {
        // Right key moves king LEFT (reversed controls)
        setKingPosition(prev => Math.max(0, prev - 1));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const renderTrack = () => {
    const track = [];
    for (let i = 0; i < trackWidth; i++) {
      const isKing = i === kingPosition;
      const isObstacle = obstacles.includes(i);
      
      track.push(
        <div
          key={i}
          className={`w-12 h-12 border-2 border-muted flex items-center justify-center text-2xl ${
            isKing 
              ? 'bg-royal-gold text-background animate-magic-glow' 
              : isObstacle 
              ? 'bg-destructive text-white animate-pulse'
              : 'bg-muted'
          }`}
        >
          {isKing ? '👑' : isObstacle ? '🔥' : ''}
        </div>
      );
    }
    return track;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-royal-gold mb-2">Reverse Runner Challenge</h1>
          <p className="text-muted-foreground">Navigate the track with REVERSE controls!</p>
          <p className="text-sm text-royal-crimson font-bold">
            ← Left Arrow moves RIGHT | Right Arrow → moves LEFT
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-stone-air">{distance}/{targetDistance}</div>
            <div className="text-sm text-muted-foreground">Distance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{Math.round((1000 - gameSpeed) / 10)}</div>
            <div className="text-sm text-muted-foreground">Speed</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <Heart className="text-destructive" size={20} />
              <Progress value={kingHealth} className="w-16" />
            </div>
            <div className="text-sm text-muted-foreground">King's Health</div>
          </div>
        </div>

        {/* Track */}
        <div className="mb-6">
          <div className="flex justify-center gap-1 mb-4">
            {renderTrack()}
          </div>
          
          {/* Moving background effect */}
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-stone-air animate-pulse"
              style={{ width: `${(distance / targetDistance) * 100}%` }}
            />
          </div>
        </div>

        {/* Controls Guide */}
        <div className="text-center mb-6 p-4 bg-card rounded-lg border-2 border-royal-crimson">
          <h3 className="text-lg font-semibold text-royal-crimson mb-2">⚠️ REVERSE CONTROLS ACTIVE ⚠️</h3>
          <div className="flex justify-center gap-8">
            <div className="flex items-center gap-2">
              <ArrowLeft className="text-royal-purple" />
              <span>Press LEFT to go RIGHT</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="text-royal-purple" />
              <span>Press RIGHT to go LEFT</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <Progress value={(distance / targetDistance) * 100} className="w-full h-3" />
          <div className="text-center mt-2 text-sm text-muted-foreground">
            Challenge Progress: {distance}/{targetDistance} distance covered
          </div>
        </div>

        <div className="text-center">
          <Button 
            onClick={() => onComplete(false)}
            variant="outline"
          >
            Give Up
          </Button>
        </div>
      </Card>
    </div>
  );
};