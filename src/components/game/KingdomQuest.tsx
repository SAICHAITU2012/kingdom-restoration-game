import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Crown, Heart, Gem } from 'lucide-react';
import { GameState, initialGameState, Stone, stoneNames, challengeNames } from './GameState';
import { DragonTypingChallenge } from './challenges/DragonTypingChallenge';
import { ReverseRunnerChallenge } from './challenges/ReverseRunnerChallenge';
import { CricketChallenge } from './challenges/CricketChallenge';
import { SaveQueenChallenge } from './challenges/SaveQueenChallenge';
import { FireEscapeChallenge } from './challenges/FireEscapeChallenge';
import kingHero from '@/assets/king-hero.jpg';
import kingdomRestored from '@/assets/kingdom-restored.jpg';
import elementalStones from '@/assets/elemental-stones.jpg';

export const KingdomQuest: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [currentChallenge, setCurrentChallenge] = useState<number | null>(null);

  const updateGameState = (updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  };

  const completeChallenge = (success: boolean, stoneType?: Stone) => {
    if (success && stoneType) {
      const newStones = { ...gameState.stones, [stoneType]: true };
      updateGameState({
        stones: newStones,
        currentLevel: gameState.currentLevel + 1,
      });
      
      // Check if all stones collected
      if (Object.values(newStones).every(Boolean)) {
        updateGameState({ gameStatus: 'won' });
      }
    }
    setCurrentChallenge(null);
  };

  const startChallenge = (level: number) => {
    setCurrentChallenge(level);
  };

  const renderChallenge = () => {
    if (currentChallenge === null) return null;

    const challengeProps = {
      gameState,
      onComplete: completeChallenge,
      onHealthChange: (health: number) => updateGameState({ kingHealth: health }),
    };

    switch (currentChallenge) {
      case 0:
        return <DragonTypingChallenge {...challengeProps} />;
      case 1:
        return <ReverseRunnerChallenge {...challengeProps} />;
      case 2:
        return <CricketChallenge {...challengeProps} />;
      case 3:
        return <SaveQueenChallenge {...challengeProps} />;
      case 4:
        return <FireEscapeChallenge {...challengeProps} />;
      default:
        return null;
    }
  };

  if (currentChallenge !== null) {
    return renderChallenge();
  }

  if (gameState.gameStatus === 'won') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
        <Card className="max-w-4xl w-full p-8 text-center animate-kingdom-bloom">
          <div 
            className="h-64 mb-6 rounded-lg bg-cover bg-center"
            style={{ backgroundImage: `url(${kingdomRestored})` }}
          />
          <h1 className="text-4xl font-bold text-royal-gold mb-4 animate-magic-glow">
            🎉 Kingdom Restored! 🎉
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            The king has successfully collected all five elemental stones! 
            The kingdom is now thriving with life, prosperity, and happiness.
          </p>
          <div className="flex justify-center gap-4 mb-6">
            {(Object.keys(gameState.stones) as Stone[]).map(stone => (
              <div key={stone} className={`w-12 h-12 rounded-full bg-stone-${stone} animate-float`} />
            ))}
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="bg-royal-gold text-background hover:bg-accent"
          >
            Play Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-royal-gold mb-4 animate-magic-glow">
            <Crown className="inline-block mr-2" />
            Kingdom Quest
          </h1>
          <p className="text-xl text-muted-foreground">
            Help the king restore his suffering kingdom by collecting the five elemental stones
          </p>
        </div>

        {/* King Status */}
        <Card className="mb-8 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-full bg-cover bg-center border-4 border-royal-gold"
                style={{ backgroundImage: `url(${kingHero})` }}
              />
              <div>
                <h3 className="text-xl font-semibold text-royal-gold">King's Status</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Heart className="text-destructive" size={20} />
                  <Progress value={gameState.kingHealth} className="w-32" />
                  <span className="text-sm">{gameState.kingHealth}/100</span>
                </div>
              </div>
            </div>
            
            {/* Collected Stones */}
            <div className="flex gap-2">
              {(Object.entries(gameState.stones) as [Stone, boolean][]).map(([stone, collected]) => (
                <div
                  key={stone}
                  className={`w-12 h-12 rounded-full ${
                    collected 
                      ? `bg-stone-${stone} animate-stone-collect` 
                      : 'bg-muted border-2 border-dashed border-muted-foreground'
                  } flex items-center justify-center`}
                >
                  {collected && <Gem className="text-white" size={20} />}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Kingdom Visual */}
        <Card className="mb-8 overflow-hidden">
          <div 
            className={`h-64 bg-cover bg-center transition-all duration-2000 ${
              Object.values(gameState.stones).filter(Boolean).length === 0
                ? 'filter grayscale brightness-50'
                : Object.values(gameState.stones).filter(Boolean).length < 5
                ? 'filter grayscale-0 brightness-75'
                : 'filter grayscale-0 brightness-100 animate-kingdom-bloom'
            }`}
            style={{ 
              backgroundImage: Object.values(gameState.stones).filter(Boolean).length < 3
                ? `url(${kingHero})`
                : `url(${kingdomRestored})`
            }}
          />
          <div className="p-4 text-center">
            <h3 className="text-lg font-semibold text-royal-gold">
              Kingdom Status: {Object.values(gameState.stones).filter(Boolean).length}/5 Elements Restored
            </h3>
          </div>
        </Card>

        {/* Challenges */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challengeNames.map((challengeName, index) => {
            const stoneType = Object.keys(gameState.stones)[index] as Stone;
            const isCompleted = gameState.stones[stoneType];
            const isAvailable = index === gameState.currentLevel;
            const isLocked = index > gameState.currentLevel;

            return (
              <Card 
                key={index} 
                className={`p-6 text-center transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-card border-royal-gold shadow-magic' 
                    : isAvailable 
                    ? 'hover:shadow-royal cursor-pointer border-accent' 
                    : 'opacity-50'
                }`}
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-stone-${stoneType} ${
                  isCompleted ? 'animate-stone-collect' : 'opacity-50'
                } flex items-center justify-center`}>
                  <Gem className="text-white" size={24} />
                </div>
                
                <h3 className="text-lg font-semibold mb-2 text-royal-gold">
                  {challengeName}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {stoneNames[stoneType]}
                </p>
                
                {isCompleted ? (
                  <div className="text-royal-gold font-semibold">✓ Completed</div>
                ) : isAvailable ? (
                  <Button 
                    onClick={() => startChallenge(index)}
                    className="w-full bg-royal-purple hover:bg-royal-gold"
                  >
                    Start Challenge
                  </Button>
                ) : (
                  <div className="text-muted-foreground">🔒 Locked</div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Elemental Stones Visual */}
        <Card className="mt-8 p-6">
          <div 
            className="h-48 bg-cover bg-center rounded-lg"
            style={{ backgroundImage: `url(${elementalStones})` }}
          />
          <div className="text-center mt-4">
            <h3 className="text-xl font-semibold text-royal-gold">The Five Elemental Stones</h3>
            <p className="text-muted-foreground">
              Collect all stones to restore the kingdom to its former glory
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};