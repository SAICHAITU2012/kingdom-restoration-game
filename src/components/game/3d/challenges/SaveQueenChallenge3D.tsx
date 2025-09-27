import { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Html, OrbitControls } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GameState, Stone } from '../../GameState';
import { KingCharacter } from '../KingCharacter';
import * as THREE from 'three';

interface SaveQueenChallenge3DProps {
  gameState: GameState;
  onComplete: (stone: Stone) => void;
  onHealthChange: (health: number) => void;
}

const Queen = ({ position, animation }: { 
  position: [number, number, number]; 
  animation: 'idle' | 'danger' | 'saved';
}) => {
  const queenRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (queenRef.current) {
      switch (animation) {
        case 'danger':
          queenRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 10) * 0.1;
          queenRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 8) * 0.2;
          break;
        case 'saved':
          queenRef.current.rotation.y = state.clock.elapsedTime * 2;
          break;
        default:
          queenRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      }
    }
  });

  return (
    <group ref={queenRef} position={position}>
      {/* Queen body */}
      <mesh position={[0, 0, 0]}>
        <capsuleGeometry args={[0.25, 1, 8, 16]} />
        <meshPhongMaterial color="#ff69b4" />
      </mesh>
      
      {/* Queen crown */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.35, 0.3, 0.25, 8]} />
        <meshPhongMaterial color="#ffd700" />
      </mesh>
      
      {/* Crown jewels */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i / 8) * Math.PI * 2) * 0.32,
            0.9,
            Math.sin((i / 8) * Math.PI * 2) * 0.32
          ]}
        >
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color={i % 2 === 0 ? "#ff0000" : "#0000ff"} />
        </mesh>
      ))}
      
      {/* Queen dress */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.6, 0.3, 0.8, 12]} />
        <meshPhongMaterial color="#800080" />
      </mesh>
      
      {/* Arms */}
      <mesh position={[-0.4, 0.1, 0]} rotation={[0, 0, -0.3]}>
        <capsuleGeometry args={[0.08, 0.6, 4, 8]} />
        <meshPhongMaterial color="#ffdbac" />
      </mesh>
      <mesh position={[0.4, 0.1, 0]} rotation={[0, 0, 0.3]}>
        <capsuleGeometry args={[0.08, 0.6, 4, 8]} />
        <meshPhongMaterial color="#ffdbac" />
      </mesh>
      
      {animation === 'danger' && (
        <Html center position={[0, 2, 0]}>
          <div className="text-red-500 text-xl font-bold animate-pulse">
            HELP!
          </div>
        </Html>
      )}
    </group>
  );
};

const Cage = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      {/* Cage bars */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i / 8) * Math.PI * 2) * 1.2,
            1,
            Math.sin((i / 8) * Math.PI * 2) * 1.2
          ]}
        >
          <cylinderGeometry args={[0.05, 0.05, 2.5, 8]} />
          <meshPhongMaterial color="#2c2c2c" />
        </mesh>
      ))}
      
      {/* Cage top */}
      <mesh position={[0, 2.3, 0]}>
        <cylinderGeometry args={[1.3, 1.3, 0.1, 16]} />
        <meshPhongMaterial color="#2c2c2c" />
      </mesh>
      
      {/* Cage base */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[1.3, 1.3, 0.2, 16]} />
        <meshPhongMaterial color="#2c2c2c" />
      </mesh>
    </group>
  );
};

const DangerousEnvironment = () => {
  return (
    <group>
      {/* Volcanic ground */}
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshPhongMaterial color="#8b0000" />
      </mesh>
      
      {/* Lava pools */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 20,
            -0.8,
            (Math.random() - 0.5) * 20
          ]}
        >
          <cylinderGeometry args={[Math.random() * 2 + 1, Math.random() * 2 + 1, 0.3, 16]} />
          <meshBasicMaterial color="#ff4500" />
        </mesh>
      ))}
      
      {/* Dangerous spikes */}
      {Array.from({ length: 15 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 30,
            0,
            (Math.random() - 0.5) * 30
          ]}
        >
          <coneGeometry args={[0.3, 2, 8]} />
          <meshPhongMaterial color="#2c2c2c" />
        </mesh>
      ))}
    </group>
  );
};

export const SaveQueenChallenge3D = ({
  gameState,
  onComplete,
  onHealthChange,
}: SaveQueenChallenge3DProps) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [decision, setDecision] = useState<'save' | 'keep' | null>(null);
  const [queenAnimation, setQueenAnimation] = useState<'idle' | 'danger' | 'saved'>('danger');

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up - queen dies, king keeps stones
          setDecision('keep');
          setTimeout(() => onComplete('water'), 2000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onComplete]);

  const handleSaveQueen = () => {
    setDecision('save');
    setQueenAnimation('saved');
    
    // Sacrifice a stone - in a real implementation, you would remove a stone
    const stones = Object.keys(gameState.stones).filter(
      stone => gameState.stones[stone as Stone]
    );
    
    setTimeout(() => onComplete('water'), 2000);
  };

  const handleKeepStones = () => {
    setDecision('keep');
    setQueenAnimation('danger'); // Queen remains in danger
    
    setTimeout(() => onComplete('water'), 2000);
  };

  const availableStones = Object.keys(gameState.stones).filter(
    stone => gameState.stones[stone as Stone]
  ).length;

  return (
    <div className="h-screen w-full">
      <Canvas camera={{ position: [0, 8, 12], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <pointLight position={[0, 5, 0]} intensity={1} color="#ff4500" />
        
        <DangerousEnvironment />
        
        <KingCharacter position={[-5, 0, 0]} animation="idle" rotation={[0, Math.PI / 4, 0]} />
        
        <Cage position={[5, 0, 0]} />
        <Queen position={[5, 0, 0]} animation={queenAnimation} />
        
        {/* Dramatic lighting effects */}
        <pointLight position={[5, 3, 0]} intensity={2} color="#ff0000" />
        
        <Html center>
          <div className="absolute top-4 left-4 right-4">
            <div className="flex justify-between items-start">
              <Card className="bg-background/90 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Save the Queen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Time Left</span>
                        <span className="text-red-500 font-bold">{timeLeft}s</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Available Stones</span>
                        <span>{availableStones}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-background/90 backdrop-blur-sm max-w-md">
                <CardContent className="pt-6">
                  <div className="text-center">
                    {decision === null ? (
                      <>
                        <div className="text-xl mb-4">⚔️ MORAL CHOICE ⚔️</div>
                        <p className="text-sm text-muted-foreground mb-4">
                          The queen is trapped! You can save her by sacrificing one of your elemental stones, 
                          or let her perish to keep your power.
                        </p>
                        <div className="space-y-2">
                          <Button 
                            onClick={handleSaveQueen}
                            disabled={availableStones === 0}
                            className="w-full"
                          >
                            💎 Save Queen (Lose 1 Stone)
                          </Button>
                          <Button 
                            onClick={handleKeepStones}
                            variant="destructive"
                            className="w-full"
                          >
                            👑 Keep Stones (Queen Dies)
                          </Button>
                        </div>
                        {availableStones === 0 && (
                          <p className="text-xs text-yellow-500 mt-2">
                            No stones to sacrifice!
                          </p>
                        )}
                      </>
                    ) : decision === 'save' ? (
                      <div>
                        <div className="text-2xl mb-2">✨ HEROIC CHOICE ✨</div>
                        <p className="text-green-600">
                          You saved the queen! Your sacrifice shows true nobility.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="text-2xl mb-2">💀 DARK CHOICE 💀</div>
                        <p className="text-red-600">
                          You chose power over compassion. The queen's fate is sealed.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Html>
        
        <OrbitControls enablePan={false} maxDistance={20} minDistance={10} />
      </Canvas>
    </div>
  );
};
