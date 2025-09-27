import { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Html, OrbitControls } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { GameState, Stone } from '../../GameState';
import { KingCharacter } from '../KingCharacter';
import * as THREE from 'three';

interface FireEscapeChallenge3DProps {
  gameState: GameState;
  onComplete: (stone: Stone) => void;
  onHealthChange: (health: number) => void;
}

interface Fireball {
  id: number;
  position: [number, number, number];
  velocity: [number, number, number];
  size: number;
}

const Fireball = ({ fireball }: { fireball: Fireball }) => {
  const fireballRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (fireballRef.current) {
      fireballRef.current.position.x += fireball.velocity[0] * delta;
      fireballRef.current.position.y += fireball.velocity[1] * delta;
      fireballRef.current.position.z += fireball.velocity[2] * delta;
      
      // Rotate for visual effect
      fireballRef.current.rotation.x += delta * 2;
      fireballRef.current.rotation.y += delta * 3;
      
      // Pulsing effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.2;
      fireballRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={fireballRef} position={fireball.position}>
      {/* Main fireball */}
      <mesh>
        <sphereGeometry args={[fireball.size, 16, 16]} />
        <meshBasicMaterial color="#ff4500" />
      </mesh>
      
      {/* Inner core */}
      <mesh>
        <sphereGeometry args={[fireball.size * 0.7, 12, 12]} />
        <meshBasicMaterial color="#ffff00" />
      </mesh>
      
      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[fireball.size * 1.3, 8, 8]} />
        <meshBasicMaterial color="#ff6600" transparent opacity={0.3} />
      </mesh>
      
      {/* Particle trail */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh
          key={i}
          position={[-i * 0.3, Math.sin(Date.now() * 0.01 + i) * 0.2, 0]}
        >
          <sphereGeometry args={[fireball.size * (0.5 - i * 0.08), 8, 8]} />
          <meshBasicMaterial 
            color="#ff4500" 
            transparent 
            opacity={0.8 - i * 0.15} 
          />
        </mesh>
      ))}
    </group>
  );
};

const FireArena = () => {
  return (
    <group>
      {/* Arena floor */}
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshPhongMaterial color="#2c1810" />
      </mesh>
      
      {/* Arena walls */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i / 20) * Math.PI * 2) * 12,
            2,
            Math.sin((i / 20) * Math.PI * 2) * 12
          ]}
        >
          <boxGeometry args={[1, 4, 0.5]} />
          <meshPhongMaterial color="#8b0000" />
        </mesh>
      ))}
      
      {/* Fire torches around arena */}
      {Array.from({ length: 8 }).map((_, i) => (
        <group
          key={i}
          position={[
            Math.cos((i / 8) * Math.PI * 2) * 10,
            0,
            Math.sin((i / 8) * Math.PI * 2) * 10
          ]}
        >
          {/* Torch post */}
          <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
            <meshPhongMaterial color="#654321" />
          </mesh>
          {/* Torch fire */}
          <mesh position={[0, 3.2, 0]}>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshBasicMaterial color="#ff4500" />
          </mesh>
        </group>
      ))}
      
      {/* Lava cracks on ground */}
      {Array.from({ length: 15 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 20,
            -0.9,
            (Math.random() - 0.5) * 20
          ]}
          rotation={[-Math.PI / 2, 0, Math.random() * Math.PI]}
        >
          <planeGeometry args={[Math.random() * 3 + 1, 0.2]} />
          <meshBasicMaterial color="#ff6600" />
        </mesh>
      ))}
    </group>
  );
};

export const FireEscapeChallenge3D = ({
  gameState,
  onComplete,
  onHealthChange,
}: FireEscapeChallenge3DProps) => {
  const [kingPosition, setKingPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [fireballs, setFireballs] = useState<Fireball[]>([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const [kingHealth, setKingHealth] = useState(gameState.kingHealth);
  const [gameSpeed, setGameSpeed] = useState(1);
  const [kingAnimation, setKingAnimation] = useState<'idle' | 'running' | 'hurt'>('idle');

  // Generate fireballs
  const generateFireball = () => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 12;
    const newFireball: Fireball = {
      id: Date.now() + Math.random(),
      position: [
        Math.cos(angle) * distance,
        Math.random() * 3 + 1,
        Math.sin(angle) * distance
      ],
      velocity: [
        -Math.cos(angle) * (3 + Math.random() * 2) * gameSpeed,
        -1,
        -Math.sin(angle) * (3 + Math.random() * 2) * gameSpeed
      ],
      size: 0.3 + Math.random() * 0.4
    };
    
    setFireballs(prev => [...prev, newFireball]);
  };

  // Game timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onComplete('fire');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onComplete]);

  // Fireball generation
  useEffect(() => {
    const fireballTimer = setInterval(() => {
      generateFireball();
      setGameSpeed(prev => Math.min(prev + 0.05, 2.5));
    }, 1000 / gameSpeed);

    return () => clearInterval(fireballTimer);
  }, [gameSpeed]);

  // Update fireballs and check collisions
  useEffect(() => {
    const gameLoop = setInterval(() => {
      setFireballs(prev => {
        const activeFireballs = prev.filter(fireball => {
          const distance = Math.sqrt(
            Math.pow(fireball.position[0], 2) + 
            Math.pow(fireball.position[2], 2)
          );
          return distance > 1; // Remove fireballs that reached center
        });

        // Check collisions with king
        activeFireballs.forEach(fireball => {
          const kingDistance = Math.sqrt(
            Math.pow(fireball.position[0] - kingPosition[0], 2) +
            Math.pow(fireball.position[2] - kingPosition[2], 2)
          );
          
          if (kingDistance < fireball.size + 0.5) {
            const newHealth = Math.max(0, kingHealth - 15);
            setKingHealth(newHealth);
            onHealthChange(newHealth);
            setKingAnimation('hurt');
            
            setTimeout(() => setKingAnimation('idle'), 500);
            
            if (newHealth <= 0) {
              setTimeout(() => onComplete('fire'), 1000);
            }
          }
        });

        return activeFireballs;
      });
    }, 50);

    return () => clearInterval(gameLoop);
  }, [kingPosition, kingHealth, onHealthChange, onComplete]);

  // King movement
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const moveSpeed = 0.8;
      let moved = false;
      
      switch (event.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          setKingPosition(prev => {
            const newX = Math.max(prev[0] - moveSpeed, -8);
            return [newX, prev[1], prev[2]];
          });
          moved = true;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          setKingPosition(prev => {
            const newX = Math.min(prev[0] + moveSpeed, 8);
            return [newX, prev[1], prev[2]];
          });
          moved = true;
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          setKingPosition(prev => {
            const newZ = Math.max(prev[2] - moveSpeed, -8);
            return [prev[0], prev[1], newZ];
          });
          moved = true;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          setKingPosition(prev => {
            const newZ = Math.min(prev[2] + moveSpeed, 8);
            return [prev[0], prev[1], newZ];
          });
          moved = true;
          break;
      }
      
      if (moved) {
        setKingAnimation('running');
        setTimeout(() => setKingAnimation('idle'), 200);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="h-screen w-full">
      <Canvas camera={{ position: [0, 12, 12], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={0.5} />
        <pointLight position={[0, 8, 0]} intensity={2} color="#ff4500" />
        
        <FireArena />
        <KingCharacter position={kingPosition} animation={kingAnimation} />
        
        {fireballs.map(fireball => (
          <Fireball key={fireball.id} fireball={fireball} />
        ))}
        
        <Html center>
          <div className="absolute top-4 left-4 right-4">
            <div className="flex justify-between items-start">
              <Card className="bg-background/90 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Fire Escape Challenge</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Time Left</span>
                        <span className="text-orange-500 font-bold">{timeLeft}s</span>
                      </div>
                      <Progress value={(timeLeft / 15) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>King's Health</span>
                        <span>{kingHealth}%</span>
                      </div>
                      <Progress value={kingHealth} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Game Speed</span>
                        <span>{gameSpeed.toFixed(1)}x</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-background/90 backdrop-blur-sm max-w-xs">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🔥 SURVIVE! 🔥</div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Dodge the fireballs for 15 seconds!
                    </p>
                    <div className="text-xs space-y-1">
                      <div>WASD or Arrow keys: Move</div>
                      <div className="text-orange-500">
                        Fireballs get faster over time!
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Html>
        
        <OrbitControls enablePan={false} maxDistance={25} minDistance={15} />
      </Canvas>
      
      <div className="absolute bottom-4 right-4">
        <Button variant="outline" onClick={() => onComplete('fire')}>
          Give Up
        </Button>
      </div>
    </div>
  );
};