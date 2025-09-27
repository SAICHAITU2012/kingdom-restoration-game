import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { GameState, initialGameState, Stone, stoneNames, challengeNames } from '../GameState';
import { KingCharacter } from './KingCharacter';
import { Environment } from './Environment';
import { DragonTypingChallenge3D } from './challenges/DragonTypingChallenge3D';
import { ReverseRunnerChallenge3D } from './challenges/ReverseRunnerChallenge3D';
import { CricketChallenge3D } from './challenges/CricketChallenge3D';
import { SaveQueenChallenge3D } from './challenges/SaveQueenChallenge3D';
import { FireEscapeChallenge3D } from './challenges/FireEscapeChallenge3D';

export const KingdomQuest3D = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [currentChallenge, setCurrentChallenge] = useState<number | null>(null);
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([0, 5, 10]);

  const updateGameState = (updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  };

  const completeChallenge = (challengeIndex: number, stone: Stone) => {
    const newStones = { ...gameState.stones, [stone]: true };
    const allStones = Object.values(newStones).every(Boolean);
    
    updateGameState({
      currentLevel: challengeIndex + 1,
      stones: newStones,
      gameStatus: allStones ? 'won' : 'playing'
    });
    
    setCurrentChallenge(null);
    
    // Update camera for better view of kingdom growth
    setCameraPosition([0, 8 + challengeIndex * 2, 12 + challengeIndex * 2]);
  };

  const renderChallenge = () => {
    if (currentChallenge === null) return null;

    const challengeProps = {
      gameState,
      onComplete: (stone: Stone) => completeChallenge(currentChallenge, stone),
      onHealthChange: (health: number) => updateGameState({ kingHealth: health })
    };

    switch (currentChallenge) {
      case 0:
        return <DragonTypingChallenge3D {...challengeProps} />;
      case 1:
        return <ReverseRunnerChallenge3D {...challengeProps} />;
      case 2:
        return <CricketChallenge3D {...challengeProps} />;
      case 3:
        return <SaveQueenChallenge3D {...challengeProps} />;
      case 4:
        return <FireEscapeChallenge3D {...challengeProps} />;
      default:
        return null;
    }
  };

  if (currentChallenge !== null) {
    return renderChallenge();
  }

  if (gameState.gameStatus === 'won') {
    return (
      <div className="h-screen w-full">
        <Canvas camera={{ position: [0, 10, 15], fov: 60 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <pointLight position={[0, 10, 0]} intensity={0.8} color="#fbbf24" />
            
            <Environment type="kingdom" stones={5} />
            <KingCharacter position={[0, 0, 0]} animation="idle" scale={1.5} />
            
            {/* Victory celebration */}
            {Array.from({ length: 10 }).map((_, i) => (
              <mesh
                key={i}
                position={[
                  Math.cos((i / 10) * Math.PI * 2) * 8,
                  5 + Math.sin(Date.now() * 0.01 + i) * 2,
                  Math.sin((i / 10) * Math.PI * 2) * 8
                ]}
              >
                <sphereGeometry args={[0.2, 8, 8]} />
                <meshBasicMaterial color="#ffd700" />
              </mesh>
            ))}
            
            <Html center>
              <div className="text-center p-8 bg-background/90 rounded-lg backdrop-blur-sm">
                <h1 className="text-4xl font-bold text-primary mb-4">Kingdom Restored!</h1>
                <p className="text-xl text-muted-foreground mb-6">
                  The kingdom thrives with all elemental stones!
                </p>
                <Button 
                  onClick={() => {
                    setGameState(initialGameState);
                    setCameraPosition([0, 5, 10]);
                  }}
                  size="lg"
                >
                  Play Again
                </Button>
              </div>
            </Html>
            
            <OrbitControls enablePan={false} maxDistance={20} minDistance={5} />
          </Suspense>
        </Canvas>
      </div>
    );
  }

  const stones = Object.values(gameState.stones);
  const collectedStones = stones.filter(Boolean).length;

  return (
    <div className="h-screen w-full relative">
      <Canvas camera={{ position: cameraPosition, fov: 60 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[0, 8, 0]} intensity={0.5} color="#fbbf24" />
          
          <Environment type="kingdom" stones={collectedStones} />
          <KingCharacter position={[0, 0, 0]} animation="idle" />
          
          <OrbitControls enablePan={false} maxDistance={25} minDistance={8} />
        </Suspense>
      </Canvas>
      
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="flex justify-between items-start">
          <Card className="bg-background/90 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">King's Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Health</span>
                    <span>{gameState.kingHealth}%</span>
                  </div>
                  <Progress value={gameState.kingHealth} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Stones</span>
                    <span>{collectedStones}/5</span>
                  </div>
                  <Progress value={(collectedStones / 5) * 100} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-background/90 backdrop-blur-sm max-w-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Kingdom Quest</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Complete challenges to collect elemental stones and restore the kingdom!
              </p>
              <div className="grid grid-cols-1 gap-2">
                {challengeNames.map((challenge, index) => {
                  const isCompleted = gameState.currentLevel > index;
                  const isAvailable = gameState.currentLevel === index && gameState.kingHealth > 0;
                  const stoneKey = ['space', 'air', 'land', 'water', 'fire'][index] as Stone;
                  
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border transition-all ${
                        isCompleted
                          ? 'bg-green-100 border-green-300 dark:bg-green-900/20'
                          : isAvailable
                          ? 'bg-blue-100 border-blue-300 dark:bg-blue-900/20 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/30'
                          : 'bg-gray-100 border-gray-300 dark:bg-gray-900/20 opacity-50'
                      }`}
                      onClick={() => isAvailable && setCurrentChallenge(index)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-sm">{challenge}</h3>
                          <p className="text-xs text-muted-foreground">
                            {stoneNames[stoneKey]}
                          </p>
                        </div>
                        <div className="text-xs">
                          {isCompleted ? '✓' : isAvailable ? '▶' : '🔒'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};