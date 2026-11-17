import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows, PerspectiveCamera, Sparkles, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Gift, Sparkles as SparklesIcon, RotateCw } from 'lucide-react';

function LuxuryGiftBoxModel({ isOpen, onToggleOpen }) {
  const boxGroupRef = useRef();
  const lidRef = useRef();

  // Smooth open/close lid animation
  useFrame((state, delta) => {
    if (lidRef.current) {
      const targetLidY = isOpen ? 1.4 : 0.65;
      const targetRotX = isOpen ? -0.4 : 0;
      lidRef.current.position.y = THREE.MathUtils.damp(lidRef.current.position.y, targetLidY, 6, delta);
      lidRef.current.rotation.x = THREE.MathUtils.damp(lidRef.current.rotation.x, targetRotX, 6, delta);
    }
    if (boxGroupRef.current) {
      boxGroupRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <group ref={boxGroupRef} position={[0, -0.4, 0]} onClick={onToggleOpen}>
      {/* Box Base (Deep Velvet) */}
      <mesh castShadow receiveShadow position={[0, -0.1, 0]}>
        <boxGeometry args={[1.5, 1.2, 1.5]} />
        <meshStandardMaterial
          color="#1e1822"
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>

      {/* Gold Satin Cross Ribbons on Base */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[0.22, 1.21, 1.52]} />
        <meshStandardMaterial color="#c99a3e" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[1.52, 1.21, 0.22]} />
        <meshStandardMaterial color="#c99a3e" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Inside Treasure Glowing Light & Core */}
      {isOpen && (
        <group position={[0, 0.3, 0]}>
          <pointLight color="#fde047" intensity={3.5} distance={3} />
          <mesh>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial color="#fef08a" emissive="#eab308" emissiveIntensity={2} />
          </mesh>
          <Sparkles count={40} scale={2.5} size={3} speed={0.8} color="#fef08a" />
        </group>
      )}

      {/* Box Lid (Lifting / Rotating) */}
      <group ref={lidRef} position={[0, 0.65, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.58, 0.3, 1.58]} />
          <meshStandardMaterial color="#261e2a" roughness={0.65} metalness={0.25} />
        </mesh>

        {/* Gold Ribbon on Lid */}
        <mesh position={[0, 0.01, 0]}>
          <boxGeometry args={[0.24, 0.32, 1.6]} />
          <meshStandardMaterial color="#d4af37" roughness={0.25} metalness={0.85} />
        </mesh>
        <mesh position={[0, 0.01, 0]}>
          <boxGeometry args={[1.6, 0.32, 0.24]} />
          <meshStandardMaterial color="#d4af37" roughness={0.25} metalness={0.85} />
        </mesh>

        {/* Ribbon Bow on Top */}
        <mesh position={[-0.2, 0.24, 0]} rotation={[0, 0, -0.5]}>
          <torusGeometry args={[0.2, 0.06, 16, 32]} />
          <meshStandardMaterial color="#e5c158" roughness={0.2} metalness={0.9} />
        </mesh>
        <mesh position={[0.2, 0.24, 0]} rotation={[0, 0, 0.5]}>
          <torusGeometry args={[0.2, 0.06, 16, 32]} />
          <meshStandardMaterial color="#e5c158" roughness={0.2} metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#fef08a" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}

export default function GiftBoxCanvas({
  title = 'Surprise Nanova Box',
  subtitle = 'Tap to Unbox Special Moments'
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full h-[460px] md:h-[560px] bg-gradient-to-b from-[#1c1722] via-[#120f18] to-[#0a080d] rounded-2xl overflow-hidden border border-amber-900/40 shadow-xl flex items-center justify-center">
      {/* Top Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-700/50 text-xs font-semibold text-amber-200 shadow-sm">
        <SparklesIcon className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
        <span>Interactive 3D Gifting Experience</span>
      </div>

      <div className="w-full h-full cursor-pointer">
        <Canvas shadows gl={{ antialias: true, alpha: true }}>
          <PerspectiveCamera makeDefault position={[0, 1.2, 3.4]} fov={45} />

          {/* Warm Luxury Ambiance */}
          <ambientLight intensity={1.4} />
          <directionalLight position={[5, 8, 4]} intensity={2.0} color="#fff1db" castShadow />
          <pointLight position={[-4, 2, -3]} intensity={1.2} color="#f59e0b" />
          <pointLight position={[3, -2, 2]} intensity={0.8} color="#e11d48" />

          <Suspense fallback={null}>
            <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
              <LuxuryGiftBoxModel isOpen={isOpen} onToggleOpen={() => setIsOpen(!isOpen)} />
            </Float>
            <Sparkles count={25} scale={3.5} size={2} speed={0.4} color="#fef08a" />
          </Suspense>

          <ContactShadows position={[0, -1.3, 0]} opacity={0.7} scale={3.8} blur={2.2} color="#000000" />
        </Canvas>
      </div>

      {/* Floating Action Button */}
      <div className="absolute bottom-5 inset-x-0 z-20 flex flex-col items-center gap-2 pointer-events-none">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-lg shadow-amber-500/30 active:scale-95 transition font-extrabold"
        >
          <Gift className="w-4 h-4" />
          <span>{isOpen ? 'Close Surprise Box' : 'Click to Unbox Surprise'}</span>
        </button>
        <span className="text-[11px] text-amber-200/60 font-medium">Click on the box to lift the lid</span>
      </div>
    </div>
  );
}
