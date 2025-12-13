"use client";

import React, { useState, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import ParticleSystem from "./ParticleSystem";
import { cardConfig } from "../config/card.config";
import { Stage } from "../types";

// --- Origin Sphere Component ---
const OriginSphere = ({
  onClick,
  stage,
}: {
  onClick: () => void;
  stage: Stage;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  // Track the current base scale for smooth transitions
  const currentScale = useRef(1);

  useFrame(({ clock }, delta) => {
    if (meshRef.current) {
      // 1. Determine Target Scale (1 if Void, 0 if others)
      const targetBaseScale = stage === Stage.Void ? 1 : 0;

      // 2. Smoothly Lerp towards target
      // Speed of 2.0 ensures it shrinks visibly but smoothly
      currentScale.current = THREE.MathUtils.lerp(
        currentScale.current,
        targetBaseScale,
        delta * 2.0
      );

      // 3. Calculate Breathing Effect (only relevant when visible)
      const t = clock.getElapsedTime();
      const breathe = 1 + Math.sin(t * 2.5) * 0.1; // Slightly faster breathing

      // 4. Apply combined scale
      const finalScale = currentScale.current * breathe;

      meshRef.current.scale.set(finalScale, finalScale, finalScale);

      // 5. Hide completely if effectively zero to save render cost
      meshRef.current.visible = finalScale > 0.01;

      // Rotation
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.z += 0.005;
    }
  });

  const isInteractable = stage === Stage.Void;

  return (
    <mesh
      ref={meshRef}
      onClick={isInteractable ? onClick : undefined}
      onPointerOver={() => {
        if (isInteractable) document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default";
      }}
    >
      <sphereGeometry args={[0.8, 32, 32]} />
      <meshStandardMaterial
        color={cardConfig.colors.originColor}
        emissive={cardConfig.colors.originColor}
        emissiveIntensity={2}
        toneMapped={false}
      />
    </mesh>
  );
};

// --- Scene Content ---
const Scene = () => {
  const [stage, setStage] = useState<Stage>(Stage.Void);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Audio Initialization
  useEffect(() => {
    // We only create the audio object on the client side
    if (typeof window !== "undefined") {
      audioRef.current = new Audio(cardConfig.musicUrl);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
    }

    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const handleNextStage = () => {
    if (stage === Stage.Void) {
      audioRef.current
        ?.play()
        .catch((e) => console.warn("Audio auto-play blocked", e));
      setStage(Stage.Cake);
    } else if (stage === Stage.Cake) {
      setStage(Stage.Message);
    } else {
      setStage(Stage.Void);
    }
  };

  return (
    <>
      <color attach="background" args={["#000000"]} />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />

      {/* Cinematic Controls: Slow auto-rotation for 3D depth */}
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        maxDistance={20}
        minDistance={2}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />

      {/* Background Stars (Static distant ones) */}
      <Stars
        radius={100}
        depth={50}
        count={2000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      {/* Interactive Elements */}
      <group>
        <ParticleSystem stage={stage} />

        {/* Click Trigger for Cake Stage */}
        {stage === Stage.Cake && (
          <mesh onClick={handleNextStage} visible={false}>
            <cylinderGeometry args={[3, 3, 5, 8]} />
            <meshBasicMaterial color="red" wireframe />
          </mesh>
        )}

        <OriginSphere onClick={handleNextStage} stage={stage} />
      </group>

      {/* Post Processing */}
      <EffectComposer enableNormalPass={false}>
        <Bloom
          luminanceThreshold={0.15} // Slightly lower threshold to catch particles better
          mipmapBlur
          intensity={1.5}
          radius={0.6}
        />
      </EffectComposer>
    </>
  );
};

const Experience = () => {
  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 0, 14], fov: 45 }}>
        <React.Suspense fallback={null}>
          <Scene />
        </React.Suspense>
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute bottom-10 left-0 w-full text-center pointer-events-none text-white/50 text-sm font-light tracking-widest animate-pulse">
        CLICK THE CENTER LIGHT
      </div>
    </div>
  );
};

export default Experience;
