import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

interface KingCharacterProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  animation?: 'idle' | 'running' | 'jumping' | 'attacking' | 'hurt';
  scale?: number;
}

export const KingCharacter = ({ 
  position, 
  rotation = [0, 0, 0], 
  animation = 'idle',
  scale = 1 
}: KingCharacterProps) => {
  const group = useRef<THREE.Group>(null);
  const mixer = useRef<THREE.AnimationMixer>();

  // Create a simple king character using basic geometries
  const kingGeometry = new THREE.CapsuleGeometry(0.3, 1.2, 8, 16);
  const kingMaterial = new THREE.MeshPhongMaterial({ color: '#4f46e5' });
  
  const crownGeometry = new THREE.CylinderGeometry(0.4, 0.35, 0.3, 8);
  const crownMaterial = new THREE.MeshPhongMaterial({ color: '#fbbf24' });

  useFrame((state, delta) => {
    if (mixer.current) {
      mixer.current.update(delta);
    }
    
    // Simple animation based on type
    if (group.current) {
      switch (animation) {
        case 'running':
          group.current.rotation.z = Math.sin(state.clock.elapsedTime * 10) * 0.1;
          break;
        case 'jumping':
          group.current.position.y = position[1] + Math.abs(Math.sin(state.clock.elapsedTime * 5)) * 0.5;
          break;
        case 'hurt':
          group.current.rotation.x = Math.sin(state.clock.elapsedTime * 20) * 0.2;
          break;
        default:
          group.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      }
    }
  });

  return (
    <group ref={group} position={position} rotation={rotation} scale={scale}>
      {/* Body */}
      <mesh geometry={kingGeometry} material={kingMaterial} />
      
      {/* Crown */}
      <mesh position={[0, 0.9, 0]} geometry={crownGeometry} material={crownMaterial} />
      
      {/* Arms */}
      <mesh position={[-0.5, 0.2, 0]} rotation={[0, 0, -0.5]}>
        <capsuleGeometry args={[0.1, 0.8, 4, 8]} />
        <meshPhongMaterial color="#f4a261" />
      </mesh>
      <mesh position={[0.5, 0.2, 0]} rotation={[0, 0, 0.5]}>
        <capsuleGeometry args={[0.1, 0.8, 4, 8]} />
        <meshPhongMaterial color="#f4a261" />
      </mesh>
      
      {/* Legs */}
      <mesh position={[-0.2, -0.8, 0]}>
        <capsuleGeometry args={[0.15, 0.6, 4, 8]} />
        <meshPhongMaterial color="#2a9d8f" />
      </mesh>
      <mesh position={[0.2, -0.8, 0]}>
        <capsuleGeometry args={[0.15, 0.6, 4, 8]} />
        <meshPhongMaterial color="#2a9d8f" />
      </mesh>
      
      {/* Cape */}
      <mesh position={[0, 0.2, -0.3]} rotation={[0.2, 0, 0]}>
        <planeGeometry args={[0.8, 1.2]} />
        <meshPhongMaterial color="#e63946" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};