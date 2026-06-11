"use client";
/**
 * Twin3D — visor 3D del gemelo digital.
 *
 * Carga el avatar GLB generado con Ready Player Me (a partir de la selfie del
 * usuario) y le aplica la expresión del estado metabólico vía morph targets
 * ARKit + postura de huesos:
 *   happy   → sonrisa amplia, cejas arriba, postura erguida
 *   neutral → rostro relajado
 *   tired   → ceño, párpados caídos, cabeza y torso encorvados
 *
 * Render 100 % client-side (three.js + react-three-fiber) → compatible con
 * el deploy estático/serverless de Vercel. Importar siempre con
 * next/dynamic { ssr: false }.
 */
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import type { Mood } from "@/lib/types";
import { palettes } from "./twinStates";

/** Influencias por estado. Cada clave se busca entre los morphs disponibles
 *  del GLB (ARKit si la URL pidió ?morphTargets=ARKit; si no, caen los
 *  básicos de RPM: mouthSmile / mouthOpen). */
const MOOD_MORPHS: Record<Mood, Record<string, number>> = {
  happy: {
    mouthSmile: 0.75,
    mouthSmileLeft: 0.65,
    mouthSmileRight: 0.65,
    cheekSquintLeft: 0.35,
    cheekSquintRight: 0.35,
    browInnerUp: 0.25,
  },
  neutral: {
    mouthSmile: 0.12,
    mouthSmileLeft: 0.1,
    mouthSmileRight: 0.1,
  },
  tired: {
    mouthFrownLeft: 0.45,
    mouthFrownRight: 0.45,
    browDownLeft: 0.4,
    browDownRight: 0.4,
    eyeSquintLeft: 0.5,
    eyeSquintRight: 0.5,
    eyesClosed: 0.25,
    mouthSmile: 0,
  },
};

/** Rotación X extra de huesos por estado (encorvado al estar en riesgo). */
const MOOD_POSE: Record<Mood, { spine: number; neck: number; head: number }> = {
  happy: { spine: -0.02, neck: -0.02, head: -0.02 },
  neutral: { spine: 0.02, neck: 0.02, head: 0.01 },
  tired: { spine: 0.1, neck: 0.14, head: 0.12 },
};

function AvatarModel({ url, mood }: { url: string; mood: Mood }) {
  const { scene } = useGLTF(url);
  const group = useRef<THREE.Group>(null);

  // Meshes con morph targets + huesos de postura + pose base
  const { morphMeshes, bones, baseRotation, cameraTargetY } = useMemo(() => {
    const meshes: THREE.Mesh[] = [];
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && m.morphTargetDictionary && m.morphTargetInfluences) {
        meshes.push(m);
      }
    });
    const find = (name: string) =>
      (scene.getObjectByName(name) as THREE.Bone | undefined) ?? null;
    const bonesFound = {
      spine: find("Spine2") ?? find("Spine1") ?? find("Spine"),
      neck: find("Neck"),
      head: find("Head"),
    };
    const base = {
      spine: bonesFound.spine?.rotation.x ?? 0,
      neck: bonesFound.neck?.rotation.x ?? 0,
      head: bonesFound.head?.rotation.x ?? 0,
    };
    // Punto de enfoque: el hueso Head si existe; si no, el tope del bounding box
    let targetY = 1.55;
    if (bonesFound.head) {
      const v = new THREE.Vector3();
      bonesFound.head.getWorldPosition(v);
      targetY = v.y + 0.05;
    } else {
      const box = new THREE.Box3().setFromObject(scene);
      targetY = box.max.y - 0.12;
    }
    return { morphMeshes: meshes, bones: bonesFound, baseRotation: base, cameraTargetY: targetY };
  }, [scene]);

  // Exponer el target de cámara al padre vía userData (lo lee CameraRig)
  useEffect(() => {
    scene.userData.cameraTargetY = cameraTargetY;
  }, [scene, cameraTargetY]);

  // Animación por frame: interpola morphs hacia el estado + respiración + postura
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const targets = MOOD_MORPHS[mood];

    for (const mesh of morphMeshes) {
      const dict = mesh.morphTargetDictionary!;
      const inf = mesh.morphTargetInfluences!;
      for (const [name, idx] of Object.entries(dict)) {
        const goal = targets[name] ?? 0;
        inf[idx] = THREE.MathUtils.lerp(inf[idx], goal, 0.08);
      }
    }

    const pose = MOOD_POSE[mood];
    if (bones.spine)
      bones.spine.rotation.x = THREE.MathUtils.lerp(
        bones.spine.rotation.x, baseRotation.spine + pose.spine, 0.06);
    if (bones.neck)
      bones.neck.rotation.x = THREE.MathUtils.lerp(
        bones.neck.rotation.x, baseRotation.neck + pose.neck, 0.06);
    if (bones.head)
      bones.head.rotation.x = THREE.MathUtils.lerp(
        bones.head.rotation.x, baseRotation.head + pose.head, 0.06);

    // Respiración sutil
    if (group.current) {
      group.current.position.y = Math.sin(t * 1.4) * 0.008;
      const s = 1 + Math.sin(t * 1.4 + Math.PI / 3) * 0.004;
      group.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}

function Rig({ targetY }: { targetY: number }) {
  useFrame((state) => {
    state.camera.position.lerp(new THREE.Vector3(0, targetY + 0.02, 0.78), 0.08);
    state.camera.lookAt(0, targetY - 0.04, 0);
  });
  return null;
}

interface Twin3DProps {
  glbUrl: string;
  mood: Mood;
  size?: number;
  className?: string;
}

export default function Twin3D({ glbUrl, mood, size = 260, className = "" }: Twin3DProps) {
  const p = palettes[mood];

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Aura del estado (mismo lenguaje visual que el avatar 2D) */}
      <div
        className="absolute inset-0 rounded-full animate-aura pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${p.glow}55 0%, ${p.glow}1c 45%, transparent 72%)`,
          filter: "blur(4px)",
          transition: "background 500ms",
        }}
      />
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 1.6, 0.8], fov: 32 }}
        gl={{ alpha: true, antialias: true }}
        style={{ borderRadius: "50%" }}
      >
        <ambientLight intensity={0.85} />
        <directionalLight position={[1.5, 2.5, 2]} intensity={1.4} />
        {/* Luz de borde con el color del estado metabólico */}
        <pointLight position={[-1.6, 1.7, -1]} intensity={2.2} color={p.color} />
        <Suspense fallback={null}>
          <AvatarHead url={glbUrl} mood={mood} />
        </Suspense>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2.4}
          maxPolarAngle={Math.PI / 1.9}
          target={[0, 1.55, 0]}
        />
      </Canvas>
    </div>
  );
}

/** Envuelve AvatarModel + cámara enfocada a la cabeza una vez cargado. */
function AvatarHead({ url, mood }: { url: string; mood: Mood }) {
  const { scene } = useGLTF(url);
  const targetY = useMemo(() => {
    const head = scene.getObjectByName("Head");
    if (head) {
      const v = new THREE.Vector3();
      head.getWorldPosition(v);
      return v.y + 0.04;
    }
    const box = new THREE.Box3().setFromObject(scene);
    return Math.max(0.4, box.max.y - 0.12);
  }, [scene]);

  return (
    <>
      <AvatarModel url={url} mood={mood} />
      <Rig targetY={targetY} />
    </>
  );
}

// Evita el warning de preload dinámico
useGLTF.preload;
