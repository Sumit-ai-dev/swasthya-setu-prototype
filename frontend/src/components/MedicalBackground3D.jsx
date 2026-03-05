import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Renders an animated DNA-like helix composed of small colored spheres.
 *
 * The helix is positioned at the provided coordinates and continuously rotates around the Y axis while gently oscillating up and down.
 *
 * @param {Object} props
 * @param {number[]} props.position - XYZ coordinates for the helix origin as [x, y, z].
 * @returns {JSX.Element} A group containing the helix sphere meshes. 
 */
function DNAHelix({ position }) {
    const groupRef = useRef();
    
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.005;
            groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
        }
    });

    const helixPoints = useMemo(() => {
        const points = [];
        for (let i = 0; i < 50; i++) {
            const angle = (i / 50) * Math.PI * 4;
            const x = Math.cos(angle) * 0.3;
            const y = (i / 50) * 3 - 1.5;
            const z = Math.sin(angle) * 0.3;
            points.push(new THREE.Vector3(x, y, z));
        }
        return points;
    }, []);

    return (
        <group ref={groupRef} position={position}>
            {helixPoints.map((point, i) => (
                <mesh key={i} position={[point.x, point.y, point.z]}>
                    <sphereGeometry args={[0.05, 8, 8]} />
                    <meshStandardMaterial 
                        color={i % 2 === 0 ? "#3b82f6" : "#8b5cf6"} 
                        emissive={i % 2 === 0 ? "#3b82f6" : "#8b5cf6"}
                        emissiveIntensity={0.3}
                    />
                </mesh>
            ))}
        </group>
    );
}

/**
 * Render an animated field of floating medical particles as 3D octahedron meshes.
 *
 * Each particle is initialized with a random position, upward speed, and size. Particles
 * move upward each frame, wrap to y = -10 when their y position exceeds 10, and continuously
 * rotate around the X and Y axes.
 *
 * @returns {JSX.Element} A group containing the animated particle meshes.
 */
function MedicalParticles() {
    const particlesRef = useRef();
    const count = 100;

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            temp.push({
                position: [
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 10
                ],
                speed: Math.random() * 0.02 + 0.01,
                size: Math.random() * 0.1 + 0.05
            });
        }
        return temp;
    }, []);

    useFrame((state) => {
        if (particlesRef.current) {
            particlesRef.current.children.forEach((particle, i) => {
                particle.position.y += particles[i].speed;
                if (particle.position.y > 10) particle.position.y = -10;
                
                particle.rotation.x += 0.01;
                particle.rotation.y += 0.01;
            });
        }
    });

    return (
        <group ref={particlesRef}>
            {particles.map((particle, i) => (
                <mesh key={i} position={particle.position}>
                    <octahedronGeometry args={[particle.size, 0]} />
                    <meshStandardMaterial 
                        color="#06b6d4"
                        transparent
                        opacity={0.6}
                        emissive="#06b6d4"
                        emissiveIntensity={0.2}
                    />
                </mesh>
            ))}
        </group>
    );
}

/**
 * Render a pulsating, rotating torus mesh positioned in 3D space.
 *
 * @param {{position: number[]}} props - Component props.
 * @param {number[]} props.position - The `[x, y, z]` world-space position of the ring.
 * @returns {JSX.Element} The torus mesh used as a heartbeat-style pulse ring.
 */
function PulseRing({ position }) {
    const ringRef = useRef();
    
    useFrame((state) => {
        if (ringRef.current) {
            const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
            ringRef.current.scale.set(scale, scale, scale);
            ringRef.current.rotation.x += 0.01;
            ringRef.current.rotation.y += 0.005;
        }
    });

    return (
        <mesh ref={ringRef} position={position}>
            <torusGeometry args={[1, 0.1, 16, 32]} />
            <meshStandardMaterial 
                color="#ec4899"
                emissive="#ec4899"
                emissiveIntensity={0.5}
                transparent
                opacity={0.7}
            />
        </mesh>
    );
}

/**
 * Render an animated medical cross at the specified 3D position.
 *
 * The cross slowly rotates around the Y axis and vertically oscillates while positioned at the given coordinates.
 *
 * @param {number[]} position - [x, y, z] world coordinates for the cross; the `y` component is used as the base for the vertical oscillation.
 * @returns {JSX.Element} The React Three Fiber group containing the animated cross meshes.
 */
function MedicalCross({ position }) {
    const crossRef = useRef();
    
    useFrame((state) => {
        if (crossRef.current) {
            crossRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
            crossRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.2;
        }
    });

    return (
        <group ref={crossRef} position={position}>
            {/* Vertical bar */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.2, 1, 0.2]} />
                <meshStandardMaterial 
                    color="#10b981"
                    emissive="#10b981"
                    emissiveIntensity={0.3}
                />
            </mesh>
            {/* Horizontal bar */}
            <mesh position={[0, 0.2, 0]}>
                <boxGeometry args={[0.8, 0.2, 0.2]} />
                <meshStandardMaterial 
                    color="#10b981"
                    emissive="#10b981"
                    emissiveIntensity={0.3}
                />
            </mesh>
        </group>
    );
}

/**
 * Render a fixed, full-screen 3D medical-themed background scene.
 *
 * The scene is drawn into a transparent Canvas and includes ambient and point/spot lighting,
 * two DNA helixes, a field of floating medical particles, two pulsating rings, and three medical crosses.
 *
 * @returns {JSX.Element} A React element containing the full-screen 3D Canvas with the composed scene.
 */
export default function MedicalBackground3D() {
    return (
        <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
            <Canvas
                camera={{ position: [0, 0, 8], fov: 60 }}
                style={{ background: 'transparent', width: '100%', height: '100%' }}
                gl={{ alpha: true, antialias: true }}
            >
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#3b82f6" />
                <pointLight position={[-10, -10, -10]} intensity={0.8} color="#8b5cf6" />
                <spotLight position={[0, 10, 0]} intensity={0.8} color="#06b6d4" />

                {/* DNA Helixes */}
                <DNAHelix position={[-4, 0, -3]} />
                <DNAHelix position={[4, -2, -4]} />
                
                {/* Medical Particles */}
                <MedicalParticles />
                
                {/* Pulse Rings */}
                <PulseRing position={[-3, 2, -2]} />
                <PulseRing position={[3, -1, -3]} />
                
                {/* Medical Crosses */}
                <MedicalCross position={[0, 3, -5]} />
                <MedicalCross position={[-5, -2, -4]} />
                <MedicalCross position={[5, 1, -5]} />
            </Canvas>
        </div>
    );
}
