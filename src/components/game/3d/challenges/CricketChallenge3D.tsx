import { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Html, OrbitControls } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { GameState, Stone } from '../../GameState';
import { KingCharacter } from '../KingCharacter';
import * as THREE from 'three';

interface CricketChallenge3DProps {
  gameState: GameState;
  onComplete: (stone: Stone) => void;
  onHealthChange: (health: number) => void;
}

interface Ball {
  id: number;
  position: [number, number, number];
  velocity: [number, number, number];
  active: boolean;
}

const CricketBall = ({ ball, onHit }: { ball: Ball; onHit: (id: number) => void }) => {
  const ballRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (ballRef.current && ball.active) {
      ballRef.current.position.x += ball.velocity[0] * delta;
      ballRef.current.position.y += ball.velocity[1] * delta;
      ballRef.current.position.z += ball.velocity[2] * delta;
      
      // Add gravity
      ball.velocity[1] -= 9.8 * delta;
      
      // Check if ball reached the king's position
      if (ballRef.current.position.z <= -8) {
        onHit(ball.id);
      }
    }
  });

  return (
    <mesh ref={ballRef} position={ball.position}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshPhongMaterial color="#ff0000" />
    </mesh>
  );
};

const CricketBat = ({ position, rotation }: { 
  position: [number, number, number]; 
  rotation: [number, number, number];
}) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Bat handle */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
        <meshPhongMaterial color="#8b4513" />
      </mesh>
      {/* Bat blade */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.3, 1, 0.1]} />
        <meshPhongMaterial color="#deb887" />
      </mesh>
    </group>
  );
};

const CricketField = () => {
  return (
    <group>
      {/* Ground */}
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshPhongMaterial color="#228b22" />
      </mesh>
      
      {/* Pitch */}
      <mesh position={[0, -0.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 20]} />
        <meshPhongMaterial color="#deb887" />
      </mesh>
      
      {/* Wickets */}
      {Array.from({ length: 3 }).map((_, i) => (
        <mesh key={i} position={[i * 0.3 - 0.3, 0, -8]}>
          <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
          <meshPhongMaterial color="#8b4513" />
        </mesh>
      ))}
      
      {/* Boundary rope */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i / 20) * Math.PI * 2) * 15,
            -0.5,
            Math.sin((i / 20) * Math.PI * 2) * 15
          ]}
        >
          <cylinderGeometry args={[0.1, 0.1, 0.5, 8]} />
          <meshPhongMaterial color="#ffffff" />
        </mesh>
      ))}
    </group>
  );
};

export const CricketChallenge3D = ({
  gameState,
  onComplete,
  onHealthChange,
}: CricketChallenge3DProps) => {
  const [balls, setBalls] = useState<Ball[]>([]);
  const [currentBall, setCurrentBall] = useState(0);
  const [hitsRequired] = useState(0); // Changed from 3 to 0 as requested
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [batPosition, setBatPosition] = useState(0);
  const [batRotation, setBatRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [kingAnimation, setKingAnimation] = useState<'idle' | 'attacking'>('idle');

  // Auto-complete when hits required is 0
  useEffect(() => {
    if (hitsRequired === 0) {
      setTimeout(() => onComplete('land'), 1000);
    }
  }, [hitsRequired, onComplete]);

  const bowlBall = () => {
    if (currentBall >= 5 || hitsRequired === 0) return;

    const newBall: Ball = {
      id: Date.now(),
      position: [0, 2, 15],
      velocity: [
        (Math.random() - 0.5) * 2,
        -2,
        -8
      ],
      active: true
    };

    setBalls(prev => [...prev, newBall]);
    setCurrentBall(prev => prev + 1);
  };

  useEffect(() => {
    if (currentBall === 0 && hitsRequired > 0) {
      bowlBall();
    }
  }, []);

  const handleBallHit = (ballId: number) => {
    setBalls(prev => prev.map(ball => 
      ball.id === ballId ? { ...ball, active: false } : ball
    ));

    const ball = balls.find(b => b.id === ballId);
    if (!ball) return;

    // Check if ball is in hitting range
    const distance = Math.abs(ball.position[0] - batPosition);
    
    if (distance < 1) {
      setHits(prev => prev + 1);
      setKingAnimation('attacking');
      setTimeout(() => setKingAnimation('idle'), 500);
      
      if (hits + 1 >= hitsRequired) {
        setTimeout(() => onComplete('land'), 1000);
        return;
      }
    } else {
      setMisses(prev => prev + 1);
    }

    if (currentBall < 5) {
      setTimeout(bowlBall, 1500);
    } else if (hits < hitsRequired) {
      // Failed challenge - lose a stone
      const stones = Object.keys(gameState.stones).filter(
        stone => gameState.stones[stone as Stone]
      );
      if (stones.length > 0) {
        // In a real implementation, you would remove a stone here
      }
      setTimeout(() => onComplete('land'), 1000);
    }
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (hitsRequired === 0) return;

      switch (event.key) {
        case 'ArrowLeft':
          setBatPosition(prev => Math.max(prev - 0.5, -2));
          break;
        case 'ArrowRight':
          setBatPosition(prev => Math.min(prev + 0.5, 2));
          break;
        case ' ':
          setKingAnimation('attacking');
          setBatRotation([0, 0, -Math.PI / 4]);
          setTimeout(() => {
            setBatRotation([0, 0, 0]);
            setKingAnimation('idle');
          }, 200);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [hitsRequired]);

  return (
    <div className="h-screen w-full">
      <Canvas camera={{ position: [0, 8, -12], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[0, 5, 0]} intensity={0.8} color="#90ee90" />
        
        <CricketField />
        <KingCharacter position={[batPosition, -0.5, -8]} animation={kingAnimation} />
        <CricketBat 
          position={[batPosition + 0.5, 0, -8]} 
          rotation={batRotation}
        />
        
        {balls.filter(ball => ball.active).map(ball => (
          <CricketBall key={ball.id} ball={ball} onHit={handleBallHit} />
        ))}
        
        <Html center>
          <div className="absolute top-4 left-4 right-4">
            <div className="flex justify-between items-start">
              <Card className="bg-background/90 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Cricket Challenge</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Hits Required</span>
                        <span>{hits}/{hitsRequired}</span>
                      </div>
                      <Progress value={(hits / Math.max(hitsRequired, 1)) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Balls Left</span>
                        <span>{5 - currentBall}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Misses</span>
                        <span>{misses}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {hitsRequired > 0 ? (
                <Card className="bg-background/90 backdrop-blur-sm max-w-xs">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        Hit {hitsRequired} balls out of 5!
                      </p>
                      <div className="text-xs space-y-1">
                        <div>← → Arrow keys: Move</div>
                        <div>Space: Swing bat</div>
                      </div>
                      <p className="text-xs text-red-500 mt-2">
                        Failing will cost you a stone!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-background/90 backdrop-blur-sm max-w-xs">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl mb-2">🎉</div>
                      <p className="text-sm text-green-600">
                        Challenge completed automatically!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </Html>
        
        <OrbitControls enablePan={false} maxDistance={25} minDistance={10} />
      </Canvas>
      
      <div className="absolute bottom-4 right-4">
        <Button variant="outline" onClick={() => onComplete('land')}>
          Give Up
        </Button>
      </div>
    </div>
  );
};