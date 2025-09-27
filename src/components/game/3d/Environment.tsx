import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sky, Cloud, Environment as DreiEnvironment } from '@react-three/drei';
import * as THREE from 'three';

interface EnvironmentProps {
  type: 'kingdom' | 'space' | 'sky' | 'forest' | 'water' | 'fire';
  stones: number;
}

export const Environment = ({ type, stones }: EnvironmentProps) => {
  const cloudsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  const getEnvironmentColor = () => {
    switch (type) {
      case 'space': return '#1a1a2e';
      case 'sky': return '#87ceeb';
      case 'forest': return '#228b22';
      case 'water': return '#4682b4';
      case 'fire': return '#ff4500';
      default: return '#87ceeb';
    }
  };

  const getGroundColor = () => {
    switch (type) {
      case 'space': return '#2c2c54';
      case 'sky': return '#90ee90';
      case 'forest': return '#8fbc8f';
      case 'water': return '#20b2aa';
      case 'fire': return '#dc143c';
      default: return '#32cd32';
    }
  };

  return (
    <>
      {/* Sky */}
      <Sky
        distance={450000}
        sunPosition={[0, 1, 0]}
        inclination={0}
        azimuth={0.25}
      />
      
      {/* Environment lighting */}
      <DreiEnvironment preset="sunset" />
      
      {/* Ground */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshPhongMaterial color={getGroundColor()} />
      </mesh>
      
      {/* Dynamic environment based on stones collected */}
      {stones >= 1 && (
        <group ref={cloudsRef}>
          {/* Space elements */}
          {Array.from({ length: 20 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                Math.random() * 40 - 20,
                Math.random() * 20 + 5,
                Math.random() * 40 - 20
              ]}
            >
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          ))}
        </group>
      )}
      
      {stones >= 2 && (
        <group>
          {/* Air elements - floating clouds */}
          <Cloud
            position={[10, 8, -10]}
            speed={0.4}
            opacity={0.8}
            color="#ffffff"
          />
          <Cloud
            position={[-10, 6, -8]}
            speed={0.3}
            opacity={0.6}
            color="#f0f8ff"
          />
        </group>
      )}
      
      {stones >= 3 && (
        <group>
          {/* Land elements - trees */}
          {Array.from({ length: 15 }).map((_, i) => (
            <group
              key={i}
              position={[
                Math.random() * 30 - 15,
                -1,
                Math.random() * 30 - 15
              ]}
            >
              {/* Tree trunk */}
              <mesh position={[0, 1, 0]}>
                <cylinderGeometry args={[0.2, 0.3, 2, 8]} />
                <meshPhongMaterial color="#8b4513" />
              </mesh>
              {/* Tree leaves */}
              <mesh position={[0, 2.5, 0]}>
                <sphereGeometry args={[1, 8, 8]} />
                <meshPhongMaterial color="#228b22" />
              </mesh>
            </group>
          ))}
        </group>
      )}
      
      {stones >= 4 && (
        <group>
          {/* Water elements - fountains */}
          <mesh position={[5, 0, 5]}>
            <cylinderGeometry args={[2, 2, 0.5, 16]} />
            <meshPhongMaterial color="#4682b4" transparent opacity={0.7} />
          </mesh>
          <mesh position={[-5, 0, -5]}>
            <cylinderGeometry args={[1.5, 1.5, 0.3, 16]} />
            <meshPhongMaterial color="#20b2aa" transparent opacity={0.8} />
          </mesh>
        </group>
      )}
      
      {stones >= 5 && (
        <group>
          {/* Fire elements - torches */}
          {Array.from({ length: 8 }).map((_, i) => (
            <group
              key={i}
              position={[
                Math.cos((i / 8) * Math.PI * 2) * 12,
                0,
                Math.sin((i / 8) * Math.PI * 2) * 12
              ]}
            >
              {/* Torch post */}
              <mesh position={[0, 2, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 4, 8]} />
                <meshPhongMaterial color="#654321" />
              </mesh>
              {/* Fire */}
              <mesh position={[0, 4.5, 0]}>
                <sphereGeometry args={[0.3, 8, 8]} />
                <meshBasicMaterial color="#ff4500" />
              </mesh>
            </group>
          ))}
        </group>
      )}
    </>
  );
};