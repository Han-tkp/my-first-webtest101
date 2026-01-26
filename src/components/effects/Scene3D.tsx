"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function AnimatedSphere() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
        }
    });

    return (
        <Sphere ref={meshRef} args={[1, 64, 64]} scale={2.5}>
            <MeshDistortMaterial
                color="#6366f1"
                attach="material"
                distort={0.4}
                speed={2}
                roughness={0.2}
                metalness={0.8}
            />
        </Sphere>
    );
}

function FloatingParticles() {
    const particlesRef = useRef<THREE.Points>(null);
    const particleCount = 500;

    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 20;
    }

    useFrame((state) => {
        if (particlesRef.current) {
            particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
            particlesRef.current.rotation.x = state.clock.elapsedTime * 0.02;
        }
    });

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particleCount}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                color="#818cf8"
                size={0.05}
                transparent
                opacity={0.6}
                sizeAttenuation
            />
        </points>
    );
}

export function Scene3D() {
    return (
        <div className="canvas-container">
            <Canvas
                camera={{ position: [0, 0, 6], fov: 50 }}
                gl={{ antialias: true, alpha: true }}
            >
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <pointLight position={[-10, -10, -5]} intensity={0.5} color="#7c3aed" />
                <AnimatedSphere />
                <FloatingParticles />
            </Canvas>
        </div>
    );
}
