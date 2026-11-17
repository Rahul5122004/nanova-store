import React, { useRef, useState, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { RotateCw, ZoomIn, ZoomOut, FlipHorizontal, Eye, Palette, Sparkles, Layers } from 'lucide-react';

/**
 * Procedural Realistic 3D Streetwear Garment Mesh
 * Built with realistic draped torso curves, sloped dropped shoulders,
 * angled sleeve cuffs, ribbed crew-neck collar torus, and authentic 240+ GSM cotton shader.
 */
function GarmentModel({ frontTextureUrl, backTextureUrl, color = '#181820', isBackView = false }) {
  const groupRef = useRef();

  // Procedural single-jersey cotton bump texture
  const cottonBump = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 64, 64);
    for (let x = 0; x < 64; x += 2) {
      for (let y = 0; y < 64; y += 2) {
        const v = Math.floor(110 + Math.random() * 45);
        ctx.fillStyle = `rgb(${v},${v},${v})`;
        ctx.fillRect(x, y, 1.5, 1.5);
      }
    }
    const t = new THREE.CanvasTexture(canvas);
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(20, 20);
    return t;
  }, []);

  // Sculpted Streetwear T-Shirt Silhouette Geometry
  const garmentGeometry = useMemo(() => {
    const s = new THREE.Shape();
    // Start at left crew-neck collar point
    s.moveTo(-0.38, 1.05);
    // Crew neckline curve dip
    s.quadraticCurveTo(0, 0.88, 0.38, 1.05);
    // Right shoulder seam slope
    s.lineTo(1.18, 0.82);
    // Right sleeve outer top edge
    s.lineTo(1.70, 0.28);
    // Right sleeve cuff opening
    s.lineTo(1.42, -0.02);
    // Right underarm curve into torso
    s.quadraticCurveTo(0.98, 0.22, 0.84, 0.12);
    // Right side waist down to hem
    s.lineTo(0.86, -1.25);
    // Bottom hem curve
    s.quadraticCurveTo(0, -1.30, -0.86, -1.25);
    // Left side waist up to underarm
    s.lineTo(-0.84, 0.12);
    // Left underarm curve to sleeve
    s.quadraticCurveTo(-0.98, 0.22, -1.42, -0.02);
    // Left sleeve cuff opening
    s.lineTo(-1.70, 0.28);
    // Left shoulder seam up to collar
    s.lineTo(-1.18, 0.82);
    s.lineTo(-0.38, 1.05);

    const extrudeSettings = {
      depth: 0.26,
      bevelEnabled: true,
      bevelSegments: 8,
      bevelSize: 0.05,
      bevelThickness: 0.05,
      curveSegments: 32
    };
    const geo = new THREE.ExtrudeGeometry(s, extrudeSettings);
    geo.center();
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Load and cache textures safely
  const textureLoader = useMemo(() => new THREE.TextureLoader(), []);
  const frontTex = useMemo(() => {
    if (!frontTextureUrl) return null;
    const tex = textureLoader.load(frontTextureUrl);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [frontTextureUrl]);

  const backTex = useMemo(() => {
    if (!backTextureUrl) return null;
    const tex = textureLoader.load(backTextureUrl);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [backTextureUrl]);

  // Smooth rotation animation towards target view (0 for front, Math.PI for back)
  useFrame((state, delta) => {
    if (groupRef.current) {
      const targetRotationY = isBackView ? Math.PI : 0;
      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        targetRotationY,
        4,
        delta
      );
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.15, 0]} scale={1.12}>
      {/* 1. Main Sculpted 3D Garment Mesh */}
      <mesh geometry={garmentGeometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={color}
          roughness={0.88}
          metalness={0.04}
          bumpMap={cottonBump}
          bumpScale={0.015}
        />
      </mesh>

      {/* 2. 3D Ribbed Crew-Neck Collar Ring */}
      <mesh position={[0, 0.98, 0]} rotation={[Math.PI / 2 + 0.1, 0, 0]} castShadow>
        <torusGeometry args={[0.36, 0.045, 16, 48]} />
        <meshStandardMaterial
          color={color}
          roughness={0.92}
          bumpMap={cottonBump}
          bumpScale={0.03}
        />
      </mesh>

      {/* 3. Left Sleeve Cuff Rim */}
      <mesh position={[-1.56, 0.13, 0]} rotation={[0, 0, 0.6]}>
        <torusGeometry args={[0.18, 0.035, 16, 32]} />
        <meshStandardMaterial color={color} roughness={0.92} />
      </mesh>

      {/* 4. Right Sleeve Cuff Rim */}
      <mesh position={[1.56, 0.13, 0]} rotation={[0, 0, -0.6]}>
        <torusGeometry args={[0.18, 0.035, 16, 32]} />
        <meshStandardMaterial color={color} roughness={0.92} />
      </mesh>

      {/* 5. Front Chest Artwork / Graphic Decal */}
      {frontTex && (
        <mesh position={[0, 0.06, 0.182]}>
          <planeGeometry args={[1.05, 1.25]} />
          <meshStandardMaterial
            map={frontTex}
            transparent
            opacity={0.96}
            roughness={0.7}
            metalness={0.02}
            polygonOffset
            polygonOffsetFactor={-1}
          />
        </mesh>
      )}

      {/* 6. Back Print Artwork / Graphic Decal */}
      {backTex && (
        <mesh position={[0, 0.06, -0.182]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[1.08, 1.28]} />
          <meshStandardMaterial
            map={backTex}
            transparent
            opacity={0.96}
            roughness={0.7}
            metalness={0.02}
            polygonOffset
            polygonOffsetFactor={-1}
          />
        </mesh>
      )}
    </group>
  );
}

/**
 * High-Priority Interactive 3D Product Viewer
 */
export default function TshirtCanvas({
  frontImage,
  backImage,
  colorHex = '#181820',
  productName = 'Nanova Streetwear Garment'
}) {
  const [isBackView, setIsBackView] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(3.4);
  const [activeColor, setActiveColor] = useState(colorHex || '#181820');
  const [viewMode, setViewMode] = useState('3d'); // '3d' | 'spec'
  const [hasWebGlError, setHasWebGlError] = useState(false);

  const controlsRef = useRef();

  const handleZoom = (delta) => {
    setZoomLevel((prev) => Math.min(4.8, Math.max(2.0, prev + delta)));
  };

  const toggleView = () => setIsBackView(!isBackView);

  // Available fabric colorways for live 3D preview
  const colorways = [
    { name: 'Pitch Black', hex: '#141418' },
    { name: 'Combed White', hex: '#f4f4f6' },
    { name: 'Charcoal Grey', hex: '#2c2c36' },
    { name: 'Vintage Cream', hex: '#e8dfd1' },
    { name: 'Forest Olive', hex: '#263328' }
  ];

  return (
    <div className="relative w-full h-[480px] md:h-[580px] bg-gradient-to-b from-[#14141c] via-[#0d0d12] to-[#07070a] rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl flex flex-col justify-between text-white">
      {/* Top Floating Header & Badges */}
      <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-zinc-700/80 text-xs font-semibold text-zinc-200 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Real 3D Garment Studio</span>
          </div>

          {/* Mode Switcher: 3D Orbit vs HD Flat Spec */}
          <div className="flex items-center bg-black/80 backdrop-blur-md p-1 rounded-full border border-zinc-700/80 text-[11px] font-bold shadow-lg">
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1 rounded-full transition ${
                viewMode === '3d' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              3D Interactive
            </button>
            <button
              onClick={() => setViewMode('spec')}
              className={`px-3 py-1 rounded-full transition ${
                viewMode === 'spec' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              HD Flat Spec
            </button>
          </div>
        </div>

        {/* View Indicator Badge */}
        <div className="bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-zinc-700/80 text-xs font-bold text-zinc-200 shadow-lg pointer-events-auto">
          {isBackView ? 'BACK VIEW' : 'FRONT VIEW'}
        </div>
      </div>

      {/* Main Display: 3D Orbit Canvas OR HD Flat Spec */}
      {viewMode === '3d' && !hasWebGlError ? (
        <div className="w-full h-full cursor-grab active:cursor-grabbing">
          <Canvas
            shadows
            gl={{ antialias: true, alpha: true }}
            onCreated={({ gl }) => {
              gl.setClearColor(0x000000, 0);
            }}
            onError={() => setHasWebGlError(true)}
          >
            <PerspectiveCamera makeDefault position={[0, 0, zoomLevel]} fov={45} />
            
            {/* Studio Three-Point Lighting */}
            <ambientLight intensity={1.1} />
            <directionalLight position={[4, 7, 5]} intensity={1.9} castShadow />
            <directionalLight position={[-4, 4, -4]} intensity={0.9} color="#8a9ab0" />
            <pointLight position={[0, -2, 2.5]} intensity={0.5} color="#ffffff" />
            <directionalLight position={[0, 6, -5]} intensity={1.1} color="#ffffff" />

            <Suspense fallback={null}>
              <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.25}>
                <GarmentModel
                  frontTextureUrl={frontImage}
                  backTextureUrl={backImage || frontImage}
                  color={activeColor}
                  isBackView={isBackView}
                />
              </Float>
            </Suspense>

            <ContactShadows position={[0, -1.6, 0]} opacity={0.65} scale={4.5} blur={2.2} far={4} />

            <OrbitControls
              ref={controlsRef}
              enablePan={false}
              minDistance={2.0}
              maxDistance={4.8}
              autoRotate={autoRotate}
              autoRotateSpeed={2.2}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI - Math.PI / 4}
            />
          </Canvas>
        </div>
      ) : (
        /* HD Flat Photography Spec View */
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <div className="relative w-72 sm:w-80 h-96 rounded-2xl overflow-hidden bg-[#181822] border border-zinc-800 shadow-2xl flex items-center justify-center p-4">
            <img
              src={isBackView && backImage ? backImage : frontImage}
              alt={productName}
              className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-105"
            />
          </div>
          <p className="mt-4 text-xs font-semibold text-zinc-400">
            {isBackView ? 'High-Definition Back Print Spec' : 'High-Definition Front Chest Spec'}
          </p>
        </div>
      )}

      {/* Floating Interactive Controls Toolbar */}
      <div className="absolute bottom-5 inset-x-0 z-20 flex flex-col sm:flex-row justify-center items-center gap-3 px-4 pointer-events-none">
        {/* Colorway Presets Switcher */}
        <div className="flex items-center gap-1.5 p-1.5 bg-black/85 backdrop-blur-xl rounded-2xl border border-zinc-700/80 shadow-2xl pointer-events-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 flex items-center gap-1">
            <Palette className="w-3 h-3 text-zinc-300" />
            <span className="hidden sm:inline">Color:</span>
          </span>
          {colorways.map((c) => (
            <button
              key={c.name}
              onClick={() => setActiveColor(c.hex)}
              className={`w-6 h-6 rounded-full border transition transform active:scale-90 ${
                activeColor === c.hex ? 'border-white scale-110 shadow-md ring-2 ring-emerald-500/80' : 'border-zinc-700 hover:border-zinc-500'
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
        </div>

        {/* 3D Action Controls */}
        <div className="flex items-center gap-1.5 p-1.5 bg-black/85 backdrop-blur-xl rounded-2xl border border-zinc-700/80 shadow-2xl pointer-events-auto">
          {/* Flip Front/Back View */}
          <button
            onClick={toggleView}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white transition active:scale-95 shadow-sm"
            title="Toggle Front and Back side"
          >
            <FlipHorizontal className="w-4 h-4 text-zinc-300" />
            <span>{isBackView ? 'Front Side' : 'Back Side'}</span>
          </button>

          {/* Auto Rotate Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-xl text-xs font-semibold transition active:scale-95 shadow-sm ${
              autoRotate ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
            title="Auto 360° Rotation"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Zoom In */}
          <button
            onClick={() => handleZoom(-0.4)}
            className="p-2 rounded-xl text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition active:scale-95 shadow-sm"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={() => handleZoom(0.4)}
            className="p-2 rounded-xl text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition active:scale-95 shadow-sm"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
