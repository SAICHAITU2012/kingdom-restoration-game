import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Crown, Heart, Gem } from 'lucide-react';
import { GameState, Stone } from '../GameState';

interface SaveQueenChallengeProps {
  gameState: GameState;
  onComplete: (success: boolean, stoneType?: 'water') => void;
  onHealthChange: (health: number) => void;
}

export const SaveQueenChallenge: React.FC<SaveQueenChallengeProps> = ({
  gameState,
  onComplete,
  onHealthChange,
}) => {
  const [decision, setDecision] = useState<'save' | 'keep' | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Get available stones to sacrifice
  const availableStones = (Object.entries(gameState.stones) as [Stone, boolean][])
    .filter(([_, collected]) => collected)
    .map(([stone, _]) => stone);

  const handleDecision = (choice: 'save' | 'keep') => {
    setDecision(choice);
    setShowResult(true);

    // Delay the completion to show the result
    setTimeout(() => {
      if (choice === 'save') {
        // Save queen by sacrificing a stone - get water stone
        onComplete(true, 'water');
      } else {
        // Keep stones but let queen die - still get water stone but with consequences
        onComplete(true, 'water');
      }
    }, 3000);
  };

  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8 text-center">
          {decision === 'save' ? (
            <div className="animate-fade-in">
              <Crown className="mx-auto text-royal-gold w-16 h-16 mb-4 animate-magic-glow" />
              <h1 className="text-3xl font-bold text-royal-gold mb-4">Noble Sacrifice!</h1>
              <p className="text-lg text-muted-foreground mb-4">
                The king chose to save the queen by sacrificing one of his precious stones. 
                His nobility and selflessness have earned him the Water Stone!
              </p>
              <div className="flex justify-center gap-4 mb-6">
                <div className="text-center">
                  <Heart className="mx-auto text-royal-crimson w-8 h-8 mb-2" />
                  <div className="text-sm">Queen Saved</div>
                </div>
                <div className="text-center">
                  <Gem className="mx-auto text-stone-water w-8 h-8 mb-2" />
                  <div className="text-sm">Water Stone Earned</div>
                </div>
              </div>
              <p className="text-sm text-royal-gold">
                True leadership means putting others before yourself.
              </p>
            </div>
          ) : (
            <div className="animate-fade-in">
              <Gem className="mx-auto text-stone-water w-16 h-16 mb-4 animate-magic-glow" />
              <h1 className="text-3xl font-bold text-stone-water mb-4">Difficult Choice</h1>
              <p className="text-lg text-muted-foreground mb-4">
                The king chose to keep his stones. While this preserved his power, 
                it came at a great cost. Still, he receives the Water Stone...
              </p>
              <div className="flex justify-center gap-4 mb-6">
                <div className="text-center">
                  <Heart className="mx-auto text-muted-foreground w-8 h-8 mb-2 opacity-50" />
                  <div className="text-sm text-muted-foreground">Queen Lost</div>
                </div>
                <div className="text-center">
                  <Gem className="mx-auto text-stone-water w-8 h-8 mb-2" />
                  <div className="text-sm">Water Stone Earned</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Power preserved, but at what cost?
              </p>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-royal-gold mb-4">Save the Queen</h1>
          <p className="text-xl text-muted-foreground">
            A moral dilemma awaits the king...
          </p>
        </div>

        {/* Story */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-card to-muted border-royal-gold">
          <div className="text-center mb-6">
            <Crown className="mx-auto text-royal-gold w-12 h-12 mb-4" />
            <h2 className="text-xl font-semibold text-royal-gold mb-4">The Queen is in Danger!</h2>
          </div>
          
          <p className="text-lg text-center mb-6">
            The queen has been captured by dark forces and is being held in a magical prison. 
            To free her, the king must sacrifice one of his precious elemental stones to break the spell.
          </p>
          
          <div className="bg-background p-4 rounded-lg border-2 border-royal-crimson">
            <p className="text-center text-royal-crimson font-semibold">
              ⚠️ Choose Wisely ⚠️
            </p>
            <p className="text-center text-sm text-muted-foreground mt-2">
              This choice will determine the fate of the queen and affect the king's journey.
            </p>
          </div>
        </Card>

        {/* Available Stones */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-center mb-4">Available Stones to Sacrifice:</h3>
          <div className="flex justify-center gap-4">
            {availableStones.length > 0 ? (
              availableStones.map(stone => (
                <div key={stone} className="text-center">
                  <div className={`w-12 h-12 rounded-full bg-stone-${stone} mx-auto mb-2 animate-float`} />
                  <div className="text-sm capitalize">{stone} Stone</div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground">
                No stones available to sacrifice
              </div>
            )}
          </div>
        </div>

        {/* Decision Buttons */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 text-center hover:shadow-magic transition-all duration-300">
            <Heart className="mx-auto text-royal-crimson w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold text-royal-gold mb-4">Save the Queen</h3>
            <p className="text-muted-foreground mb-6">
              Sacrifice one of your stones to free the queen. 
              This noble act will earn you the Water Stone through compassion and sacrifice.
            </p>
            <Button 
              onClick={() => handleDecision('save')}
              className="w-full bg-royal-crimson hover:bg-royal-crimson/80"
              disabled={availableStones.length === 0}
            >
              Save the Queen
            </Button>
            <div className="mt-2 text-xs text-royal-gold">
              ✓ Queen lives ✓ Water Stone earned
            </div>
            {availableStones.length === 0 && (
              <div className="mt-2 text-xs text-destructive">
                No stones to sacrifice
              </div>
            )}
          </Card>

          <Card className="p-6 text-center hover:shadow-royal transition-all duration-300">
            <Gem className="mx-auto text-royal-gold w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold text-royal-gold mb-4">Keep Your Stones</h3>
            <p className="text-muted-foreground mb-6">
              Preserve your power and keep all your stones. 
              The queen's fate is sealed, but your stones remain intact. 
              You still receive the Water Stone, but at a moral cost.
            </p>
            <Button 
              onClick={() => handleDecision('keep')}
              className="w-full bg-royal-purple hover:bg-royal-purple/80"
            >
              Keep Stones
            </Button>
            <div className="mt-2 text-xs text-royal-gold">
              ✓ Stones preserved ✓ Water Stone earned
            </div>
            <div className="text-xs text-muted-foreground">
              ✗ Queen's fate uncertain
            </div>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Choose the path that defines what kind of king you wish to be...
          </p>
        </div>
      </Card>
    </div>
  );
};
