import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Flame, Heart } from 'lucide-react';
import { GameState } from '../GameState';

interface FireEscapeChallengeProps {
  gameState: GameState;
  onComplete: (success: boolean, stoneType?: 'fire') => void;
  onHealthChange: (health: number) => void;
}

interface Fireball {
  id: number;
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  size: number;
}

export const FireEscapeChallenge: React.FC<FireEscapeChallengeProps> = ({
  gameState,
  onComplete,
  onHealthChange,
}) => {
  const [kingPosition, setKingPosition] = useState({ x: 50, y: 50 });
  const [fireballs, setFireballs] = useState<Fireball[]>([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const [kingHealth, setKingHealth] = useState(gameState.kingHealth);
  const [gameStarted, setGameStarted] = useState(false);
  const [keys, setKeys] = useState<Set<string>>(new Set());

  const arenaSize = { width: 100, height: 100 }; // Percentage-based
  const kingSize = 5;
  const fireballCount = 8;

  // Generate initial fireballs
  const generateFireballs = useCallback(() => {
    const newFireballs: Fireball[] = [];
    for (let i = 0; i < fireballCount; i++) {
      newFireballs.push({
        id: i,
        x: Math.random() * 90 + 5,
        y: Math.random() * 90 + 5,
        speedX: (Math.random() - 0.5) * 4,
        speedY: (Math.random() - 0.5) * 4,
        size: Math.random() * 3 + 2,
      });
    }
    setFireballs(newFireballs);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!gameStarted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onComplete(true, 'fire');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, onComplete]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setKeys(prev => new Set(prev).add(event.key.toLowerCase()));
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      setKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(event.key.toLowerCase());
        return newKeys;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // King movement
  useEffect(() => {
    if (!gameStarted) return;

    const moveInterval = setInterval(() => {
      setKingPosition(prev => {
        let newX = prev.x;
        let newY = prev.y;
        const speed = 2;

        if (keys.has('arrowleft') || keys.has('a')) {
          newX = Math.max(kingSize / 2, newX - speed);
        }
        if (keys.has('arrowright') || keys.has('d')) {
          newX = Math.min(arenaSize.width - kingSize / 2, newX + speed);
        }
        if (keys.has('arrowup') || keys.has('w')) {
          newY = Math.max(kingSize / 2, newY - speed);
        }
        if (keys.has('arrowdown') || keys.has('s')) {
          newY = Math.min(arenaSize.height - kingSize / 2, newY + speed);
        }

        return { x: newX, y: newY };
      });
    }, 50);

    return () => clearInterval(moveInterval);
  }, [keys, gameStarted, kingSize, arenaSize]);

  // Fireball movement and collision detection
  useEffect(() => {
    if (!gameStarted) return;

    const fireballInterval = setInterval(() => {
      setFireballs(prev => prev.map(fireball => {
        let newX = fireball.x + fireball.speedX;
        let newY = fireball.y + fireball.speedY;
        let newSpeedX = fireball.speedX;
        let newSpeedY = fireball.speedY;

        // Bounce off walls
        if (newX <= fireball.size / 2 || newX >= arenaSize.width - fireball.size / 2) {
          newSpeedX = -newSpeedX;
          newX = Math.max(fireball.size / 2, Math.min(arenaSize.width - fireball.size / 2, newX));
        }
        if (newY <= fireball.size / 2 || newY >= arenaSize.height - fireball.size / 2) {
          newSpeedY = -newSpeedY;
          newY = Math.max(fireball.size / 2, Math.min(arenaSize.height - fireball.size / 2, newY));
        }

        // Check collision with king
        const distance = Math.sqrt(
          Math.pow(newX - kingPosition.x, 2) + Math.pow(newY - kingPosition.y, 2)
        );
        
        if (distance < (fireball.size + kingSize) / 2) {
          // Collision! Reduce king's health
          const newHealth = Math.max(0, kingHealth - 15);
          setKingHealth(newHealth);
          onHealthChange(newHealth);
          
          if (newHealth <= 0) {
            onComplete(false);
          }
        }

        return {
          ...fireball,
          x: newX,
          y: newY,
          speedX: newSpeedX,
          speedY: newSpeedY,
        };
      }));
    }, 50);

    return () => clearInterval(fireballInterval);
  }, [gameStarted, kingPosition, kingHealth, onComplete, onHealthChange, kingSize, arenaSize]);

  const startGame = () => {
    setGameStarted(true);
    generateFireballs();
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8 text-center">
          <h1 className="text-3xl font-bold text-royal-gold mb-4">Fire Escape Challenge</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Survive for 15 seconds while dodging the fireballs to earn the final Fire Stone!
          </p>
          <div className="mb-6 p-4 bg-card rounded-lg">
            <h3 className="font-semibold mb-2">Controls:</h3>
            <p className="text-sm text-muted-foreground">
              Arrow Keys or WASD to move<br/>
              Avoid the fireballs at all costs!
            </p>
          </div>
          <Button onClick={startGame} className="bg-stone-fire hover:bg-stone-fire/80">
            <Flame className="mr-2" />
            Enter the Fire Arena
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-royal-gold mb-2">Fire Escape Challenge</h1>
          <p className="text-muted-foreground">Survive the fireball onslaught!</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-stone-fire">{timeLeft}s</div>
            <div className="text-sm text-muted-foreground">Time Remaining</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <Heart className="text-destructive" size={20} />
              <Progress value={kingHealth} className="w-20" />
            </div>
            <div className="text-sm text-muted-foreground">King's Health</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-royal-gold">{fireballs.length}</div>
            <div className="text-sm text-muted-foreground">Active Fireballs</div>
          </div>
        </div>

        {/* Game Arena */}
        <div className="relative bg-stone-fire/10 border-4 border-stone-fire rounded-lg mx-auto" 
             style={{ width: '400px', height: '300px' }}>
          
          {/* King */}
          <div 
            className="absolute bg-royal-gold rounded-full border-2 border-white transition-all duration-75 animate-magic-glow"
            style={{
              width: `${kingSize * 4}px`,
              height: `${kingSize * 4}px`,
              left: `${(kingPosition.x / 100) * 400 - (kingSize * 2)}px`,
              top: `${(kingPosition.y / 100) * 300 - (kingSize * 2)}px`,
            }}
          >
            <div className="flex items-center justify-center w-full h-full text-xs">👑</div>
          </div>

          {/* Fireballs */}
          {fireballs.map(fireball => (
            <div
              key={fireball.id}
              className="absolute bg-stone-fire rounded-full animate-pulse border border-royal-crimson"
              style={{
                width: `${fireball.size * 4}px`,
                height: `${fireball.size * 4}px`,
                left: `${(fireball.x / 100) * 400 - (fireball.size * 2)}px`,
                top: `${(fireball.y / 100) * 300 - (fireball.size * 2)}px`,
                boxShadow: '0 0 10px hsl(var(--stone-fire))',
              }}
            >
              <Flame className="w-full h-full text-white" />
            </div>
          ))}

          {/* Arena boundaries indicator */}
          <div className="absolute inset-0 border-2 border-dashed border-stone-fire/30 rounded-lg pointer-events-none" />
        </div>

        {/* Controls reminder */}
        <div className="text-center mt-6 p-4 bg-card rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center justify-center gap-2">
              <span className="bg-royal-purple text-white px-2 py-1 rounded">↑ W</span>
              <span>Up</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="bg-royal-purple text-white px-2 py-1 rounded">↓ S</span>
              <span>Down</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="bg-royal-purple text-white px-2 py-1 rounded">← A</span>
              <span>Left</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="bg-royal-purple text-white px-2 py-1 rounded">→ D</span>
              <span>Right</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-6">
          <Progress value={((15 - timeLeft) / 15) * 100} className="w-full h-3" />
          <div className="text-center mt-2 text-sm text-muted-foreground">
            Survival Progress: {15 - timeLeft}/15 seconds survived
          </div>
        </div>

        <div className="text-center mt-6">
          <Button 
            onClick={() => onComplete(false)}
            variant="outline"
          >
            Surrender
          </Button>
        </div>
      </Card>
    </div>
  );
};