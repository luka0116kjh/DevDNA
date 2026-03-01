import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

const ROWS = 7;
const MIN_COLS = 52;
const CELL_GAP = 0.58;
const BASE_HEIGHT = 0.32;

function GrassBlades({ data }) {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  const darkColor = useMemo(() => new THREE.Color('#1a2f14'), []);
  const lowColor = useMemo(() => new THREE.Color('#2f8f2a'), []);
  const highColor = useMemo(() => new THREE.Color('#7dff5a'), []);
  const days = useMemo(() => data?.days ?? [], [data?.days]);

  const { totalInstances, cols, mappedDays } = useMemo(() => {
    const resolvedCols = Math.max(MIN_COLS, Math.ceil(days.length / ROWS));
    const total = resolvedCols * ROWS;

    const safeDays = Array.from({ length: total }, (_, index) => {
      const day = days[index];
      const count = Number(day?.count) || 0;
      return {
        count,
        height: count > 0 ? Math.min(9.2, count * 0.48 + BASE_HEIGHT) : BASE_HEIGHT
      };
    });

    return {
      totalInstances: total,
      cols: resolvedCols,
      mappedDays: safeDays
    };
  }, [days]);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    for (let index = 0; index < totalInstances; index += 1) {
      const col = Math.floor(index / ROWS);
      const row = index % ROWS;
      const { count, height } = mappedDays[index];
      const normalized = Math.max(0.12, Math.min(count, 20) / 20);

      dummy.position.set(
        (col - cols / 2) * CELL_GAP,
        height / 2,
        (row - ROWS / 2) * CELL_GAP
      );
      dummy.scale.set(1, height, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);

      if (count > 0) {
        color.copy(lowColor).lerp(highColor, normalized);
      } else {
        color.copy(darkColor);
      }
      mesh.setColorAt(index, color);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  }, [totalInstances, cols, mappedDays, dummy, color, darkColor, lowColor, highColor]);

  return (
    <instancedMesh ref={meshRef} args={[null, null, totalInstances]}>
      <boxGeometry args={[0.46, 1, 0.46]} />
      <meshStandardMaterial
        vertexColors
        roughness={0.18}
        metalness={0.12}
        emissive="#11310b"
        emissiveIntensity={0.72}
      />
    </instancedMesh>
  );
}

export default function Grass3D({ data }) {
  return (
    <div className="canvas-container">
      <Canvas camera={{ position: [0, 9, 13], fov: 46 }}>
        <fog attach="fog" args={['#061006', 8, 30]} />
        <ambientLight intensity={1.2} />
        <hemisphereLight args={['#c9ffb4', '#081106', 1.1]} />
        <directionalLight position={[10, 18, 10]} intensity={2.6} color="#ffffff" />
        <pointLight position={[0, 10, 8]} intensity={2.35} color="#7dff5a" />
        <pointLight position={[-10, 4, -6]} intensity={1.4} color="#9cff86" />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <planeGeometry args={[42, 16]} />
          <meshStandardMaterial color="#081206" emissive="#0f2a0a" emissiveIntensity={0.35} />
        </mesh>
        <gridHelper args={[42, 56, '#2e8d2a', '#143114']} position={[0, 0.03, 0]} />

        <group position={[0, 1.05, 0]}>
          <GrassBlades data={data} />
        </group>
      </Canvas>
    </div>
  );
}
