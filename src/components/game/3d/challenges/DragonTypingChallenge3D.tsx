import { useState, useEffect, useCallback, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Html, OrbitControls } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { GameState, Stone } from '../../GameState';
import { KingCharacter } from '../KingCharacter';
import * as THREE from 'three';

interface DragonTypingChallenge3DProps {
  gameState: GameState;
  onComplete: (stone: Stone) => void;
  onHealthChange: (health: number) => void;
}

const Dragon = ({ position, targetLetter, isHit }: { 
  position: [number, number, number]; 
  targetLetter: string;
  isHit: boolean;
}) => {
  const dragonRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (dragonRef.current) {
      dragonRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.2;
      dragonRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.5;
      
      if (isHit) {
        dragonRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 20) * 0.3;
      }
    }
  });

  return (
    <group ref={dragonRef} position={position}>
      {/* Dragon body */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshPhongMaterial color={isHit ? "#ff0000" : "#ff6b6b"} />
      </mesh>
      
      {/* Dragon head */}
      <mesh position={[1.5, 0.3, 0]}>
        <sphereGeometry args={[0.8, 12, 12]} />
        <meshPhongMaterial color={isHit ? "#cc0000" : "#e55555"} />
      </mesh>
      
      {/* Dragon wings */}
      <mesh position={[-0.5, 0.5, 1]} rotation={[0, 0, Math.sin(Date.now() * 0.01) * 0.3]}>
        <planeGeometry args={[2, 1]} />
        <meshPhongMaterial color="#8b4513" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-0.5, 0.5, -1]} rotation={[0, 0, -Math.sin(Date.now() * 0.01) * 0.3]}>
        <planeGeometry args={[2, 1]} />
        <meshPhongMaterial color="#8b4513" side={THREE.DoubleSide} />
      </mesh>
      
      {/* Letter display */}
      <Text
        position={[1.5, 1.5, 0]}
        fontSize={1}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/roboto.woff"
      >
        {targetLetter}
      </Text>
      
      {/* Fire breath */}
      {!isHit && (
        <group position={[2.5, 0.3, 0]}>
          {Array.from({ length: 5 }).map((_, i) => (
            <mesh
              key={i}
              position={[i * 0.3, Math.sin(Date.now() * 0.01 + i) * 0.2, 0]}
            >
              <sphereGeometry args={[0.1 + i * 0.05, 8, 8]} />
              <meshBasicMaterial color="#ff4500" transparent opacity={0.8 - i * 0.15} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};

const Arrow = ({ position, target }: { 
  position: [number, number, number]; 
  target: [number, number, number];
}) => {
  const arrowRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (arrowRef.current) {
      // Move arrow towards target
      const direction = new THREE.Vector3().subVectors(
        new THREE.Vector3(...target),
        new THREE.Vector3(...position)
      ).normalize();
      
      arrowRef.current.position.add(direction.multiplyScalar(delta * 10));
    }
  });

  return (
    <group ref={arrowRef} position={position}>
      <mesh rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
        <meshPhongMaterial color="#8b4513" />
      </mesh>
      <mesh position={[1, 0, 0]}>
        <coneGeometry args={[0.1, 0.3, 8]} />
        <meshPhongMaterial color="#c0c0c0" />
      </mesh>
    </group>
  );
};

export const DragonTypingChallenge3D = ({
  gameState,
  onComplete,
  onHealthChange,
}: DragonTypingChallenge3DProps) => {
  const [targetLetter, setTargetLetter] = useState('');
  const [score, setScore] = useState(0);
  const [kingHealth, setKingHealth] = useState(gameState.kingHealth);
  const [isHit, setIsHit] = useState(false);
  const [arrows, setArrows] = useState<Array<{ id: number; position: [number, number, number] }>>([]);
  const [kingAnimation, setKingAnimation] = useState<'idle' | 'attacking' | 'hurt'>('idle');

  const generateLetter = useCallback(() => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    setTargetLetter(letters[Math.floor(Math.random() * letters.length)]);
    setIsHit(false);
  }, []);

  useEffect(() => {
    generateLetter();
  }, [generateLetter]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const pressedKey = event.key.toUpperCase();
      
      if (pressedKey === targetLetter) {
        setScore(prev => prev + 1);
        setIsHit(true);
        setKingAnimation('attacking');
        
        // Add arrow
        const newArrow = {
          id: Date.now(),
          position: [-8, 0, 0] as [number, number, number]
        };
        setArrows(prev => [...prev, newArrow]);
        
        setTimeout(() => {
          generateLetter();
          setKingAnimation('idle');
          setArrows(prev => prev.filter(arrow => arrow.id !== newArrow.id));
        }, 1000);
        
        if (score + 1 >= 5) {
          setTimeout(() => onComplete('space'), 1500);
        }
      } else {
        const newHealth = Math.max(0, kingHealth - 10);
        setKingHealth(newHealth);
        onHealthChange(newHealth);
        setKingAnimation('hurt');
        
        setTimeout(() => setKingAnimation('idle'), 500);
        
        if (newHealth <= 0) {
          setTimeout(() => onComplete('space'), 1000);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [targetLetter, score, kingHealth, generateLetter, onComplete, onHealthChange]);

  return (
    <div className="h-screen w-full">
      <Canvas camera={{ position: [0, 2, 12], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[0, 5, 0]} intensity={0.8} color="#ffd700" />
        
        {/* Starry background */}
        {Array.from({ length: 100 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              (Math.random() - 0.5) * 100,
              (Math.random() - 0.5) * 50,
              (Math.random() - 0.5) * 100
            ]}
          >
            <sphereGeometry args={[0.05, 4, 4]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}
        
        {/* Ground */}
        <mesh position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[50, 50]} />
          <meshPhongMaterial color="#2c2c54" />
        </mesh>
        
        <KingCharacter position={[-8, -2, 0]} animation={kingAnimation} rotation={[0, Math.PI / 4, 0]} />
        <Dragon position={[8, 2, 0]} targetLetter={targetLetter} isHit={isHit} />
        
        {/* Arrows */}
        {arrows.map(arrow => (
          <Arrow
            key={arrow.id}
            position={arrow.position}
            target={[8, 2, 0]}
          />
        ))}
        
        <Html center>
          <div className="absolute top-4 left-4 right-4">
            <div className="flex justify-between items-start">
              <Card className="bg-background/90 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Dragon Typing Challenge</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Score</span>
                        <span>{score}/5</span>
                      </div>
                      <Progress value={(score / 5) * 100} className="h-2" />
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
              
              <Card className="bg-background/90 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Press the letter to shoot the dragon:</p>
                    <div className="text-4xl font-bold text-primary mb-2">{targetLetter}</div>
                    <p className="text-xs text-muted-foreground">
                      Wrong key hurts the king!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Html>
        
        <OrbitControls enablePan={false} maxDistance={20} minDistance={8} />
      </Canvas>
      
      <div className="absolute bottom-4 right-4">
        <Button variant="outline" onClick={() => onComplete('space')}>
          Give Up
        </Button>
      </div>
    </div>
  );
};