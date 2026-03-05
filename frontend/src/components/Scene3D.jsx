import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, MeshDistortMaterial } from '@react-three/drei';

/**
 * Render an animated, distorted sphere mesh used as a scene centerpiece.
 *
 * The mesh applies time-based rotation and a subtle vertical bob to create continuous motion,
 * and uses a MeshDistortMaterial for a wavy, metallic appearance.
 * @returns {JSX.Element} A mesh containing a distorted sphere with time-driven rotation and vertical offset.
 */
function AnimatedSphere() {
    const meshRef = useRef();
    
    useFrame((state) => {
        if (meshRef.current) {
            const t = state.clock.getElapsedTime();
            meshRef.current.rotation.x = Math.sin(t / 4) / 8;
            meshRef.current.rotation.y = Math.sin(t / 2) / 4;
            meshRef.current.position.y = Math.sin(t / 1.5) / 10;
        }
    });

    return (
        <mesh ref={meshRef} scale={2.5}>
            <sphereGeometry args={[1, 64, 64]} />
            <MeshDistortMaterial
                color="#4F46E5"
                attach="material"
                distort={0.4}
                speed={2}
                roughness={0.2}
                metalness={0.8}
            />
        </mesh>
    );
}

/**
 * Render three decorative 3D icon meshes positioned in the scene.
 *
 * The fragment contains:
 * - a cyan torus at [-2, 1, 0]
 * - a purple octahedron at [2, -0.5, 0]
 * - a pink icosahedron at [1.5, 1.5, -1]
 *
 * @returns {JSX.Element} A React fragment with three positioned meshes for use as decorative health icons.
 */
function HealthIcons() {
    return (
        <>
            <mesh position={[-2, 1, 0]}>
                <torusGeometry args={[0.3, 0.1, 16, 32]} />
                <meshStandardMaterial color="#06B6D4" metalness={0.8} roughness={0.2} />
            </mesh>
            
            <mesh position={[2, -0.5, 0]}>
                <octahedronGeometry args={[0.4]} />
                <meshStandardMaterial color="#8B5CF6" metalness={0.8} roughness={0.2} />
            </mesh>
            
            <mesh position={[1.5, 1.5, -1]}>
                <icosahedronGeometry args={[0.3]} />
                <meshStandardMaterial color="#EC4899" metalness={0.8} roughness={0.2} />
            </mesh>
        </>
    );
}

/**
 * Render a full-size 3D scene containing a distorted animated sphere, decorative health icons, and constrained orbit controls.
 *
 * The scene includes ambient, directional, and point lights; the AnimatedSphere and HealthIcons components; and OrbitControls
 * configured to auto-rotate, disable zoom and pan, and lock the camera to the equatorial plane (polar angle = π/2).
 *
 * @returns {JSX.Element} A Canvas-based React element composing the described 3D scene.
 */
export default function Scene3D() {
    return (
        <Canvas
            camera={{ position: [0, 0, 5], fov: 50 }}
            style={{ height: '100%', width: '100%' }}
        >
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#4F46E5" />
            <pointLight position={[0, 0, 5]} intensity={0.5} color="#06B6D4" />
            
            <AnimatedSphere />
            <HealthIcons />
            
            <OrbitControls 
                enableZoom={false} 
                enablePan={false}
                autoRotate
                autoRotateSpeed={0.5}
                maxPolarAngle={Math.PI / 2}
                minPolarAngle={Math.PI / 2}
            />
        </Canvas>
    );
}
