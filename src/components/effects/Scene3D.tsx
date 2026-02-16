"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function ChemicalSprayParticles() {
    const particlesRef = useRef<THREE.InstancedMesh>(null);
    const particleCount = 1500;

    const { particles } = useMemo(() => {
        const particles = [];

        for (let i = 0; i < particleCount; i++) {
            // กระจายจากจุดกลางออกไปรอบๆ (เหมือนการพ่นสารเคมี)
            const radius = Math.random() * 8 + 2;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;

            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);

            // ขนาดแตกต่างกันเพื่อสร้างความลึก
            const size = Math.random() * 0.15 + 0.05;

            // ความเร็วในการเคลื่อนที่
            const vx = (Math.random() - 0.5) * 0.003;
            const vy = (Math.random() - 0.5) * 0.003;
            const vz = (Math.random() - 0.5) * 0.003;

            particles.push({ x, y, z, size, vx, vy, vz });
        }

        return { particles };
    }, []);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame(() => {
        if (particlesRef.current) {
            particles.forEach((particle, i) => {
                // เคลื่อนที่
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.z += particle.vz;

                // Reset ถ้าลอยไกลเกินไป
                const distance = Math.sqrt(
                    particle.x ** 2 +
                    particle.y ** 2 +
                    particle.z ** 2
                );

                if (distance > 12) {
                    const radius = Math.random() * 2 + 1;
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.random() * Math.PI;

                    particle.x = radius * Math.sin(phi) * Math.cos(theta);
                    particle.y = radius * Math.sin(phi) * Math.sin(theta);
                    particle.z = radius * Math.cos(phi);
                }

                // อัพเดท matrix
                dummy.position.set(particle.x, particle.y, particle.z);
                dummy.scale.set(particle.size, particle.size, particle.size);
                dummy.updateMatrix();
                particlesRef.current!.setMatrixAt(i, dummy.matrix);
            });

            particlesRef.current.instanceMatrix.needsUpdate = true;

            // หมุนช้าๆ
            particlesRef.current.rotation.y += 0.0005;
            particlesRef.current.rotation.x += 0.0002;
        }
    });

    return (
        <instancedMesh ref={particlesRef} args={[undefined, undefined, particleCount]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial
                color="#6366f1"
                emissive="#4f46e5"
                emissiveIntensity={0.5}
                metalness={0.3}
                roughness={0.4}
                transparent
                opacity={0.85}
            />
        </instancedMesh>
    );
}

// อนุภาคเล็กๆ เพิ่มเติม
function AmbientParticles() {
    const particlesRef = useRef<THREE.InstancedMesh>(null);
    const particleCount = 600;

    const { particles } = useMemo(() => {
        const particles = [];
        for (let i = 0; i < particleCount; i++) {
            const x = (Math.random() - 0.5) * 25;
            const y = (Math.random() - 0.5) * 25;
            const z = (Math.random() - 0.5) * 25;
            const size = Math.random() * 0.08 + 0.03;
            particles.push({ x, y, z, size });
        }
        return { particles };
    }, []);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state) => {
        if (particlesRef.current) {
            particles.forEach((particle, i) => {
                dummy.position.set(particle.x, particle.y, particle.z);
                dummy.scale.set(particle.size, particle.size, particle.size);
                dummy.updateMatrix();
                particlesRef.current!.setMatrixAt(i, dummy.matrix);
            });

            particlesRef.current.rotation.y = state.clock.elapsedTime * 0.03;
            particlesRef.current.rotation.x = state.clock.elapsedTime * 0.01;
        }
    });

    return (
        <instancedMesh ref={particlesRef} args={[undefined, undefined, particleCount]}>
            <sphereGeometry args={[1, 6, 6]} />
            <meshStandardMaterial
                color="#818cf8"
                emissive="#6366f1"
                emissiveIntensity={0.3}
                metalness={0.2}
                roughness={0.5}
                transparent
                opacity={0.7}
            />
        </instancedMesh>
    );
}

export function Scene3D() {
    return (
        <div className="canvas-container">
            <Canvas
                camera={{ position: [0, 0, 10], fov: 50 }}
                gl={{ antialias: true, alpha: true }}
            >
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 10]} intensity={1.2} color="#ffffff" />
                <pointLight position={[5, 5, 5]} intensity={1} color="#6366f1" />
                <pointLight position={[-5, -5, -5]} intensity={0.8} color="#818cf8" />
                <ChemicalSprayParticles />
                <AmbientParticles />
            </Canvas>
        </div>
    );
}
