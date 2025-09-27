import { useState, useEffect, useCallback, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Html, OrbitControls } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { GameState, Stone } from '../../GameState';
import { KingCharacter } from '../KingCharacter';
import * as THREE from 'three';

interface ReverseRunnerChallenge3DProps {
  gameState: GameState;
  onComplete: (stone: Stone) => void;
  onHealthChange: (health: number) => void;
}

interface Obstacle {
  id: number;
  position: [number, number, number];
  type: 'spike' | 'rock' | 'pit';
}

const Obstacle = ({ obstacle }: { obstacle: Obstacle }) => {
  const obstacleRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (obstacleRef.current) {
      obstacleRef.current.rotation.y = state.clock.elapsedTime * 2;
    }
  });

  const renderObstacle = () => {
    switch (obstacle.type) {
      case 'spike':
        return (
          <mesh>
            <coneGeometry args={[0.3, 1, 8]} />
            <meshPhongMaterial color="#8b0000" />
          </mesh>
        );
      case 'rock':
        return (
          <mesh>
            <dodecahedronGeometry args={[0.5]} />
            <meshPhongMaterial color="#696969" />
          </mesh>
        );
      case 'pit':
        return (
          <mesh position={[0, -0.3, 0]}>
            <cylinderGeometry args={[0.8, 0.8, 0.5, 16]} />
            <meshPhongMaterial color="#2f2f2f" />
          </mesh>
        );
      default:
        return null;
    }
  };

  return (
    <group ref={obstacleRef} position={obstacle.position}>
      {renderObstacle()}
    </group>
  );
};

const Track = () => {
  return (
    <group>
      {/* Main track */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 50]} />
        <meshPhongMaterial color="#4682b4" />
      </mesh>
      
      {/* Track borders */}
      <mesh position={[3.2, 0, 0]}>
        <boxGeometry args={[0.4, 1, 50]} />
        <meshPhongMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-3.2, 0, 0]}>
        <boxGeometry args={[0.4, 1, 50]} />
        <meshPhongMaterial color="#ffffff" />
      </mesh>
      
      {/* Track lines */}
      {Array.from({ length: 25 }).map((_, i) => (
        <mesh key={i} position={[0, 0.01, i * 2 - 25]}>
          <boxGeometry args={[0.2, 0.02, 1]} />
          <meshPhongMaterial color="#ffffff" />
        </mesh>
      ))}
    </group>
  );
};

export const ReverseRunnerChallenge3D = ({
  gameState,
  onComplete,
  onHealthChange,
}: ReverseRunnerChallenge3DProps) => {
  const [kingPosition, setKingPosition] = useState<[number, number, number]>([0, 0, -20]);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [distance, setDistance] = useState(0);
  const [kingHealth, setKingHealth] = useState(gameState.kingHealth);
  const [gameSpeed, setGameSpeed] = useState(1);
  const targetDistance = 10;

  const generateObstacles = useCallback(() => {
    const newObstacles: Obstacle[] = [];
    for (let i = 0; i < 20; i++) {
      const types: Obstacle['type'][] = ['spike', 'rock', 'pit'];
      newObstacles.push({
        id: Date.now() + i,
        position: [
          (Math.random() - 0.5) * 4,
          0,
          i * 3 - 10
        ],
        type: types[Math.floor(Math.random() * types.length)]
      });
    }
    setObstacles(newObstacles);
  }, []);

  useEffect(() => {
    generateObstacles();
  }, [generateObstacles]);

  useEffect(() => {
    const gameLoop = setInterval(() => {
      setDistance(prev => {
        const newDistance = prev + gameSpeed * 0.1;
        if (newDistance >= targetDistance) {
          onComplete('air');
          return targetDistance;
        }
        return newDistance;
      });
      
      setGameSpeed(prev => Math.min(prev + 0.01, 3));
      
      // Move obstacles
      setObstacles(prev => 
        prev.map(obstacle => ({
          ...obstacle,
          position: [
            obstacle.position[0],
            obstacle.position[1],
            obstacle.position[2] - gameSpeed * 0.1
          ] as [number, number, number]
        })).filter(obstacle => obstacle.position[2] > -30)
      );
    }, 50);

    return () => clearInterval(gameLoop);
  }, [gameSpeed, targetDistance, onComplete]);

  // Collision detection
  useEffect(() => {
    obstacles.forEach(obstacle => {
      const kingX = kingPosition[0];
      const kingZ = kingPosition[2];
      const obstacleX = obstacle.position[0];
      const obstacleZ = obstacle.position[2];
      
      const distance = Math.sqrt(
        Math.pow(kingX - obstacleX, 2) + Math.pow(kingZ - obstacleZ, 2)
      );
      
      if (distance < 0.8) {
        const newHealth = Math.max(0, kingHealth - 20);
        setKingHealth(newHealth);
        onHealthChange(newHealth);
        
        if (newHealth <= 0) {
          onComplete('air');
        }
      }
    });
  }, [kingPosition, obstacles, kingHealth, onHealthChange, onComplete]);

  // Reverse controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const moveSpeed = 0.5;
      const currentX = kingPosition[0];
      
      switch (event.key) {
        case 'ArrowLeft':
          // Reverse: left key moves right
          setKingPosition(prev => [
            Math.min(prev[0] + moveSpeed, 2.5),
            prev[1],
            prev[2]
          ]);
          break;
        case 'ArrowRight':
          // Reverse: right key moves left
          setKingPosition(prev => [
            Math.max(prev[0] - moveSpeed, -2.5),
            prev[1],
            prev[2]
          ]);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [kingPosition]);

  return (
    <div className="h-screen w-full">
      <Canvas camera={{ position: [0, 8, -15], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[0, 5, 0]} intensity={0.8} color="#87ceeb" />
        
        {/* Sky environment */}
        {Array.from({ length: 20 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              (Math.random() - 0.5) * 100,
              Math.random() * 20 + 10,
              (Math.random() - 0.5) * 100
            ]}
          >
            <sphereGeometry args={[Math.random() * 2 + 1, 8, 8]} />
            <meshPhongMaterial color="#ffffff" transparent opacity={0.8} />
          </mesh>
        ))}
        
        <Track />
        <KingCharacter position={kingPosition} animation="running" />
        
        {obstacles.map(obstacle => (
          <Obstacle key={obstacle.id} obstacle={obstacle} />
        ))}
        
        <Html center>
          <div className="absolute top-4 left-4 right-4">
            <div className="flex justify-between items-start">
              <Card className="bg-background/90 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Reverse Runner Challenge</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Distance</span>
                        <span>{distance.toFixed(1)}/{targetDistance}</span>
                      </div>
                      <Progress value={(distance / targetDistance) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Speed</span>
                        <span>{gameSpeed.toFixed(1)}x</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>King's Health</span>
                        <span>{kingHealth}%</span>
                      </div>
                      <Progress value={kingHealth} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-background/90 backdrop-blur-sm max-w-xs">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl mb-2">⚠️ REVERSE CONTROLS ⚠️</div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Use arrow keys to avoid obstacles
                    </p>
                    <div className="text-xs">
                      <div>← Left Key = Move RIGHT</div>
                      <div>→ Right Key = Move LEFT</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Html>
        
        <OrbitControls enablePan={false} maxDistance={25} minDistance={10} />
      </Canvas>
      
      <div className="absolute bottom-4 right-4">
        <Button variant="outline" onClick={() => onComplete('air')}>
          Give Up
        </Button>
      </div>
    </div>
  );
};