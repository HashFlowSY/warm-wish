"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import { useFrame, extend, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { FontLoader, TextGeometry } from "three-stdlib";
import { cardConfig } from "../config/card.config";
import { Stage } from "../types";

extend({ TextGeometry });

// --- Constants ---
const PARTICLE_COUNT = 8000;
const CANDLE_COUNT = 150; // Reserved particles for flame
const PARTICLE_SIZE = 0.12;
const MORPH_SPEED = 0.05; // Slightly slower for more dramatic transitions
const FONT_URL =
  "https://threejs.org/examples/fonts/helvetiker_bold.typeface.json";

// --- Types ---
interface ParticleSystemProps {
  stage: Stage;
}

// --- Shader Definition ---
const particleVertexShader = `
  attribute float size;
  attribute vec3 customColor;
  varying vec3 vColor;
  
  void main() {
    vColor = customColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    // Scale size by depth for perspective
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const particleFragmentShader = `
  varying vec3 vColor;
  
  void main() {
    // Circle Shape
    float strength = distance(gl_PointCoord, vec2(0.5));
    if (strength > 0.5) discard;
    
    // Soft edge
    float alpha = 1.0 - (strength * 2.0);
    gl_FragColor = vec4(vColor, alpha);
  }
`;

// --- Helper: Triangle Area ---
const getTriangleArea = (
  a: THREE.Vector3,
  b: THREE.Vector3,
  c: THREE.Vector3
) => {
  const v1 = new THREE.Vector3().subVectors(b, a);
  const v2 = new THREE.Vector3().subVectors(c, a);
  return v1.cross(v2).length() * 0.5;
};

// --- Helper: Weighted Sampling ---
const sampleGeometry = (
  geometry: THREE.BufferGeometry,
  count: number
): Float32Array => {
  const posAttribute = geometry.attributes.position;
  const indexAttribute = geometry.index;
  const triangles: {
    a: THREE.Vector3;
    b: THREE.Vector3;
    c: THREE.Vector3;
    area: number;
    cumulative: number;
  }[] = [];
  let totalArea = 0;

  // 1. Extract Triangles
  if (indexAttribute) {
    for (let i = 0; i < indexAttribute.count; i += 3) {
      const a = new THREE.Vector3().fromBufferAttribute(
        posAttribute,
        indexAttribute.getX(i)
      );
      const b = new THREE.Vector3().fromBufferAttribute(
        posAttribute,
        indexAttribute.getX(i + 1)
      );
      const c = new THREE.Vector3().fromBufferAttribute(
        posAttribute,
        indexAttribute.getX(i + 2)
      );
      const area = getTriangleArea(a, b, c);
      totalArea += area;
      triangles.push({ a, b, c, area, cumulative: totalArea });
    }
  } else {
    for (let i = 0; i < posAttribute.count; i += 3) {
      const a = new THREE.Vector3().fromBufferAttribute(posAttribute, i);
      const b = new THREE.Vector3().fromBufferAttribute(posAttribute, i + 1);
      const c = new THREE.Vector3().fromBufferAttribute(posAttribute, i + 2);
      const area = getTriangleArea(a, b, c);
      totalArea += area;
      triangles.push({ a, b, c, area, cumulative: totalArea });
    }
  }

  const output = new Float32Array(count * 3);

  // 2. Sample Points
  if (triangles.length > 0) {
    for (let i = 0; i < count; i++) {
      const r = Math.random() * totalArea;
      // Binary Search for weighted selection
      let low = 0;
      let high = triangles.length - 1;
      let selectedTri = triangles[0];

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (triangles[mid].cumulative >= r) {
          selectedTri = triangles[mid];
          high = mid - 1;
        } else {
          low = mid + 1;
        }
      }

      // Barycentric Random Point
      const r1 = Math.random();
      const r2 = Math.random();
      const sqrtR1 = Math.sqrt(r1);
      const u = 1 - sqrtR1;
      const v = sqrtR1 * (1 - r2);
      const w = sqrtR1 * r2;

      output[i * 3] =
        u * selectedTri.a.x + v * selectedTri.b.x + w * selectedTri.c.x;
      output[i * 3 + 1] =
        u * selectedTri.a.y + v * selectedTri.b.y + w * selectedTri.c.y;
      output[i * 3 + 2] =
        u * selectedTri.a.z + v * selectedTri.b.z + w * selectedTri.c.z;
    }
  }

  return output;
};

const ParticleSystem: React.FC<ParticleSystemProps> = ({ stage }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const font = useLoader(FontLoader, FONT_URL);

  const [targetPositions, setTargetPositions] = useState<Float32Array>(
    new Float32Array(PARTICLE_COUNT * 3)
  );
  const [targetColors, setTargetColors] = useState<Float32Array>(
    new Float32Array(PARTICLE_COUNT * 3)
  );

  // Initialize Memory
  const { initialPositions, initialColors, sizes } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const cols = new Float32Array(PARTICLE_COUNT * 3);
    const sz = new Float32Array(PARTICLE_COUNT);

    const starColor = new THREE.Color(cardConfig.colors.starColor);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Void Stage: Large Sphere Cloud
      const r = 25 * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      cols[i * 3] = starColor.r;
      cols[i * 3 + 1] = starColor.g;
      cols[i * 3 + 2] = starColor.b;

      sz[i] = PARTICLE_SIZE * (0.5 + Math.random());
    }
    return { initialPositions: pos, initialColors: cols, sizes: sz };
  }, []);

  // --- Layout Generators ---

  const generateCakePositions = () => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const cols = new Float32Array(PARTICLE_COUNT * 3);
    const cakeColor = new THREE.Color(cardConfig.colors.cakeColor);

    // HDR Colors for Bloom Pop
    const flameColorInner = new THREE.Color(1.5, 1.2, 0.1); // Bright Yellow
    const flameColorOuter = new THREE.Color(2.0, 0.3, 0.0); // Intense Orange/Red

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // --- 1. CANDLE FLAME (Top Priority) ---
      if (i < CANDLE_COUNT) {
        const p = i / CANDLE_COUNT; // 0 to 1
        // Lifted Y position slightly to sit perfectly on top cap
        const y = 2.15 + p * 0.6;

        const rBase = 0.12;
        const r = rBase * Math.sin(p * Math.PI);

        const theta = Math.random() * Math.PI * 2;
        const jitter = 0.02;

        pos[i * 3] = r * Math.cos(theta) + (Math.random() - 0.5) * jitter;
        pos[i * 3 + 1] = y + (Math.random() - 0.5) * jitter;
        pos[i * 3 + 2] = r * Math.sin(theta) + (Math.random() - 0.5) * jitter;

        const fCol = p < 0.4 ? flameColorOuter : flameColorInner;
        cols[i * 3] = fCol.r;
        cols[i * 3 + 1] = fCol.g;
        cols[i * 3 + 2] = fCol.b;

        continue;
      }

      // --- 2. CAKE BODY ---
      const rand = Math.random();
      const frostedNoise = (Math.random() - 0.5) * 0.1;

      // Geometry Dimensions
      const bottomR = 3.0;
      const topR = 1.8;
      const bottomH = 1.4;
      const topH = 1.6;
      const bottomY = -1.5;
      const midY = bottomY + bottomH; // ~ -0.1
      const topY = midY + topH; // ~ 1.5

      let x = 0,
        y = 0,
        z = 0;

      // Optimized Probabilities for Solid Look (Caps need ample particles)
      // 0.0 - 0.35: Bottom Wall
      // 0.35 - 0.60: Top Wall
      // 0.60 - 0.80: Shoulder (Ring)
      // 0.80 - 0.95: Top Cap
      // 0.95 - 1.00: Internal Volume

      if (rand < 0.35) {
        // A. Bottom Wall
        const r = bottomR + frostedNoise;
        const theta = Math.random() * Math.PI * 2;
        const h = Math.random() * bottomH;
        x = r * Math.cos(theta);
        y = bottomY + h;
        z = r * Math.sin(theta);
      } else if (rand < 0.6) {
        // B. Top Wall
        const r = topR + frostedNoise;
        const theta = Math.random() * Math.PI * 2;
        const h = Math.random() * topH;
        x = r * Math.cos(theta);
        y = midY + h;
        z = r * Math.sin(theta);
      } else if (rand < 0.8) {
        // C. Shoulder (Exposed Ring on Bottom Tier)
        // Uniform Ring Sampling: sqrt(r_min^2 + (r_max^2 - r_min^2) * rand)
        const rMin2 = topR * topR;
        const rMax2 = bottomR * bottomR;
        const r =
          Math.sqrt(rMin2 + (rMax2 - rMin2) * Math.random()) + frostedNoise;
        const theta = Math.random() * Math.PI * 2;

        x = r * Math.cos(theta);
        y = midY;
        z = r * Math.sin(theta);
      } else if (rand < 0.95) {
        // D. Top Cap (Full Disk)
        // Uniform Disk Sampling: R * sqrt(rand)
        const r = topR * Math.sqrt(Math.random()) + frostedNoise;
        const theta = Math.random() * Math.PI * 2;
        x = r * Math.cos(theta);
        y = topY;
        z = r * Math.sin(theta);
      } else {
        // E. Volume/Filling (Inside)
        const r = bottomR * Math.sqrt(Math.random());
        const theta = Math.random() * Math.PI * 2;
        const h = Math.random() * (bottomH + topH);
        x = r * Math.cos(theta);
        y = bottomY + h;
        z = r * Math.sin(theta);
        if (y > midY) {
          const newR = topR * Math.sqrt(Math.random());
          x = newR * Math.cos(theta);
          z = newR * Math.sin(theta);
        }
      }

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      cols[i * 3] = cakeColor.r;
      cols[i * 3 + 1] = cakeColor.g;
      cols[i * 3 + 2] = cakeColor.b;
    }
    return { pos, cols };
  };

  const generateTextPositions = () => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const cols = new Float32Array(PARTICLE_COUNT * 3);
    const color = new THREE.Color(cardConfig.colors.textColor);

    const wishText = cardConfig.wishes[0];
    const nameText = cardConfig.name;

    const totalChars = wishText.length + nameText.length;
    const wishCount = Math.floor(
      PARTICLE_COUNT * (wishText.length / totalChars)
    );
    const nameCount = PARTICLE_COUNT - wishCount;

    // 1. Generate Wish Geometry
    const wishGeo = new TextGeometry(wishText, {
      font: font as any,
      size: 1.5,
      height: 0.1,
      curveSegments: 6,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.01,
      bevelSegments: 2,
    } as any);
    wishGeo.center();

    // 2. Generate Name Geometry
    const nameGeo = new TextGeometry(nameText, {
      font: font as any,
      size: 1.8,
      height: 0.1,
      curveSegments: 6,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.01,
      bevelSegments: 2,
    } as any);
    nameGeo.center();

    // 3. Sample Points
    const wishPoints = sampleGeometry(wishGeo, wishCount);
    const namePoints = sampleGeometry(nameGeo, nameCount);

    // 4. Merge and Offset
    let ptr = 0;

    // Fill Wish
    for (let i = 0; i < wishCount; i++) {
      pos[ptr * 3] = wishPoints[i * 3];
      pos[ptr * 3 + 1] = wishPoints[i * 3 + 1] + 1.0;
      pos[ptr * 3 + 2] = wishPoints[i * 3 + 2];

      cols[ptr * 3] = color.r;
      cols[ptr * 3 + 1] = color.g;
      cols[ptr * 3 + 2] = color.b;
      ptr++;
    }

    // Fill Name
    for (let i = 0; i < nameCount; i++) {
      pos[ptr * 3] = namePoints[i * 3];
      pos[ptr * 3 + 1] = namePoints[i * 3 + 1] - 0.8;
      pos[ptr * 3 + 2] = namePoints[i * 3 + 2];

      cols[ptr * 3] = color.r;
      cols[ptr * 3 + 1] = color.g;
      cols[ptr * 3 + 2] = color.b;
      ptr++;
    }

    wishGeo.dispose();
    nameGeo.dispose();
    return { pos, cols };
  };

  // --- State Machine ---
  useEffect(() => {
    let newPos: Float32Array;
    let newCols: Float32Array;

    if (stage === Stage.Void) {
      const { initialPositions: p, initialColors: c } = {
        initialPositions,
        initialColors,
      };
      newPos = p;
      newCols = c;
    } else if (stage === Stage.Cake) {
      const { pos, cols } = generateCakePositions();
      newPos = pos;
      newCols = cols;
    } else if (stage === Stage.Message) {
      const { pos, cols } = generateTextPositions();
      newPos = pos;
      newCols = cols;
    } else {
      newPos = initialPositions;
      newCols = initialColors;
    }

    setTargetPositions(newPos);
    setTargetColors(newCols);
  }, [stage, font]);

  // --- Animation Loop ---
  useFrame(({ clock }) => {
    if (!pointsRef.current) return;

    const attributes = pointsRef.current.geometry.attributes;
    const currentPositions = attributes.position.array as Float32Array;
    const currentColors = attributes.customColor.array as Float32Array;

    const time = clock.getElapsedTime();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // Target Position
      const tx = targetPositions[i3];
      const ty = targetPositions[i3 + 1];
      const tz = targetPositions[i3 + 2];

      // Current Position
      const cx = currentPositions[i3];
      const cy = currentPositions[i3 + 1];
      const cz = currentPositions[i3 + 2];

      // Distance to target
      const dx = tx - cx;
      const dy = ty - cy;
      const dz = tz - cz;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      // --- 1. TRANSITION NOISE (Explosion Effect) ---
      // If the particle is far from target (transitioning), add turbulence.
      // This prevents the "implosion" effect where particles collapse to the center line.
      // Instead, they take a chaotic, curved path.
      if (dist > 0.5) {
        const noiseAmp = 0.08; // Magnitude of turbulence
        currentPositions[i3] += (Math.random() - 0.5) * noiseAmp;
        currentPositions[i3 + 1] += (Math.random() - 0.5) * noiseAmp;
        currentPositions[i3 + 2] += (Math.random() - 0.5) * noiseAmp;
      }

      // --- 2. IDLE SHIMMER (Wobble) ---
      const wobbleX = Math.sin(time * 2.0 + i * 0.01) * 0.05;
      const wobbleY = Math.cos(time * 1.5 + i * 0.02) * 0.05;
      const wobbleZ = Math.sin(time * 1.0 + i * 0.03) * 0.05;

      // Lerp towards Target + Wobble
      currentPositions[i3] += (tx + wobbleX - cx) * MORPH_SPEED;
      currentPositions[i3 + 1] += (ty + wobbleY - cy) * MORPH_SPEED;
      currentPositions[i3 + 2] += (tz + wobbleZ - cz) * MORPH_SPEED;

      // --- 3. SPARKLE & FLAME EFFECT ---
      let sparkleSpeed = 4.0;
      let sparkleIntensity = 0.2;

      // Flame Flicker Override
      if (stage === Stage.Cake && i < CANDLE_COUNT) {
        sparkleSpeed = 15.0; // Rapid flickering for fire
        sparkleIntensity = 0.4;
      }

      // Base target color
      const tr = targetColors[i3];
      const tg = targetColors[i3 + 1];
      const tb = targetColors[i3 + 2];

      // Fluctuate brightness
      const sparkle =
        1.0 + Math.sin(time * sparkleSpeed + i) * sparkleIntensity;

      const finalR = tr * sparkle;
      const finalG = tg * sparkle;
      const finalB = tb * sparkle;

      // Lerp Color
      const colorSpeed = 0.1;
      currentColors[i3] += (finalR - currentColors[i3]) * colorSpeed;
      currentColors[i3 + 1] += (finalG - currentColors[i3 + 1]) * colorSpeed;
      currentColors[i3 + 2] += (finalB - currentColors[i3 + 2]) * colorSpeed;
    }

    attributes.position.needsUpdate = true;
    attributes.customColor.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[initialPositions, 3]}
        />
        <bufferAttribute
          attach="attributes-customColor"
          args={[initialColors, 3]}
        />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        attach="material"
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        transparent={true}
        vertexColors={true}
      />
    </points>
  );
};

export default ParticleSystem;
