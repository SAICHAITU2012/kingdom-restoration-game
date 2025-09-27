import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, Zap } from 'lucide-react';
import { GameState } from '../GameState';

interface CricketChallengeProps {
  gameState: GameState;
  onComplete: (success: boolean, stoneType?: 'land') => void;
  onHealthChange: (health: number) => void;
}

interface Ball {
  id: number;
  speed: number;
  position: number;
  active: boolean;
}

export const CricketChallenge: React.FC<CricketChallengeProps> = ({
  gameState,
  onComplete,
  onHealthChange,
}) => {
  const [balls, setBalls] = useState<Ball[]>([]);
  const [currentBall, setCurrentBall] = useState(0);
  const [hitsRequired] = useState(3);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [batPosition, setBatPosition] = useState(50); // Percentage
  const [gameStarted, setGameStarted] = useState(false);

  const totalBalls = 5;
  const maxMisses = totalBalls - hitsRequired;

  // Initialize balls
  useEffect(() => {
    const initialBalls: Ball[] = [];
    for (let i = 0; i < totalBalls; i++) {
      initialBalls.push({
        id: i,
        speed: Math.random() * 3 + 2, // Speed between 2-5
        position: 0,
        active: false,
      });
    }
    setBalls(initialBalls);
  }, []);

  // Ball animation
  useEffect(() => {
    if (!gameStarted) return;

    const interval = setInterval(() => {
      setBalls(prev => prev.map(ball => {
        if (ball.id === currentBall && ball.active) {
          const newPosition = ball.position + ball.speed;
          
          if (newPosition >= 100) {
            // Ball reached the end - missed
            setMisses(prev => {
              const newMisses = prev + 1;
              if (newMisses > maxMisses) {
                onComplete(false);
              } else if (currentBall + 1 >= totalBalls) {
                // Check if we have enough hits
                if (hits >= hitsRequired) {
                  onComplete(true, 'land');
                } else {
                  onComplete(false);
                }
              }
              return newMisses;
            });
            
            setCurrentBall(prev => prev + 1);
            return { ...ball, active: false, position: 0 };
          }
          
          return { ...ball, position: newPosition };
        }
        return ball;
      }));
    }, 50);

    return () => clearInterval(interval);
  }, [gameStarted, currentBall, hits, hitsRequired, maxMisses, onComplete]);

  // Start next ball
  useEffect(() => {
    if (gameStarted && currentBall < totalBalls) {
      const timer = setTimeout(() => {
        setBalls(prev => prev.map(ball => 
          ball.id === currentBall 
            ? { ...ball, active: true, position: 0 }
            : ball
        ));
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [currentBall, gameStarted]);

  // Bat controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        setBatPosition(prev => Math.max(0, prev - 10));
      } else if (event.key === 'ArrowRight') {
        setBatPosition(prev => Math.min(100, prev + 10));
      } else if (event.key === ' ') {
        event.preventDefault();
        handleSwing();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleSwing = () => {
    const currentBallData = balls[currentBall];
    if (!currentBallData?.active) return;

    // Check if bat is in position (within 15% range) and ball is in hitting zone (80-95%)
    const batRange = 15;
    const ballInHittingZone = currentBallData.position >= 80 && currentBallData.position <= 95;
    const ballInBatRange = Math.abs(batPosition - 50) <= batRange; // Simplified bat range

    if (ballInHittingZone && ballInBatRange) {
      // Hit!
      setHits(prev => {
        const newHits = prev + 1;
        if (newHits >= hitsRequired) {
          onComplete(true, 'land');
        } else if (currentBall + 1 >= totalBalls) {
          onComplete(false);
        }
        return newHits;
      });
      
      setCurrentBall(prev => prev + 1);
      setBalls(prev => prev.map(ball => 
        ball.id === currentBall 
          ? { ...ball, active: false, position: 0 }
          : ball
      ));
    }
  };

  const startGame = () => {
    setGameStarted(true);
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8 text-center">
          <h1 className="text-3xl font-bold text-royal-gold mb-4">Cricket Challenge</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Hit {hitsRequired} out of {totalBalls} balls to earn the Land Stone!
          </p>
          <div className="mb-6 p-4 bg-card rounded-lg">
            <h3 className="font-semibold mb-2">Controls:</h3>
            <p className="text-sm text-muted-foreground">
              ← → Arrow keys to move bat<br/>
              SPACEBAR to swing
            </p>
          </div>
          <Button onClick={startGame} className="bg-stone-land hover:bg-stone-land/80">
            Start Cricket Challenge
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-royal-gold mb-2">Cricket Challenge</h1>
          <p className="text-muted-foreground">Hit {hitsRequired} balls to win!</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-stone-land">{hits}/{hitsRequired}</div>
            <div className="text-sm text-muted-foreground">Hits</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">{misses}/{maxMisses}</div>
            <div className="text-sm text-muted-foreground">Misses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{currentBall + 1}/{totalBalls}</div>
            <div className="text-sm text-muted-foreground">Ball</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-royal-gold">{totalBalls - currentBall - 1}</div>
            <div className="text-sm text-muted-foreground">Remaining</div>
          </div>
        </div>

        {/* Cricket Field */}
        <div className="relative h-64 bg-stone-land/20 rounded-lg mb-6 overflow-hidden">
          {/* Pitch */}
          <div className="absolute inset-0 bg-gradient-to-r from-stone-land/10 to-stone-land/30" />
          
          {/* Ball */}
          {balls[currentBall]?.active && (
            <div 
              className="absolute top-1/2 w-4 h-4 bg-destructive rounded-full animate-pulse transition-all duration-75"
              style={{ 
                left: `${balls[currentBall].position}%`,
                transform: 'translateY(-50%)'
              }}
            />
          )}
          
          {/* Bat */}
          <div 
            className="absolute bottom-4 w-2 h-16 bg-royal-gold rounded transition-all duration-200"
            style={{ left: `${batPosition}%`, transform: 'translateX(-50%)' }}
          />
          
          {/* Hitting zone indicator */}
          <div className="absolute right-0 top-0 w-1/5 h-full bg-royal-gold/20 border-l-2 border-royal-gold">
            <div className="text-center text-xs text-royal-gold pt-2">Hit Zone</div>
          </div>
        </div>

        {/* Controls */}
        <div className="text-center mb-6 p-4 bg-card rounded-lg">
          <div className="flex justify-center gap-8 mb-2">
            <div className="flex items-center gap-2">
              <span className="bg-royal-purple text-white px-2 py-1 rounded">←</span>
              <span>Move Left</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-royal-purple text-white px-2 py-1 rounded">→</span>
              <span>Move Right</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-royal-gold text-background px-2 py-1 rounded">SPACE</span>
              <span>Swing Bat</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Wait for the ball to reach the hitting zone, then swing!
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <Progress value={(hits / hitsRequired) * 100} className="w-full h-3" />
          <div className="text-center mt-2 text-sm text-muted-foreground">
            Challenge Progress: {hits}/{hitsRequired} successful hits
          </div>
        </div>

        <div className="text-center">
          <Button 
            onClick={() => onComplete(false)}
            variant="outline"
          >
            Forfeit
          </Button>
        </div>
      </Card>
    </div>
  );
};