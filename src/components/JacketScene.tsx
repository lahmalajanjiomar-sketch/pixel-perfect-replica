import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OC } from "three-stdlib";
import { useDesignState } from "@/hooks/useDesignState";
import { JacketModel } from "./JacketModel";

function CameraRig({ controls }: { controls: React.RefObject<OC | null> }) {
  const { cameraTarget } = useDesignState();
  const target = useRef<number | null>(null);
  const { camera } = useThree();
  useEffect(() => { if (cameraTarget) target.current = cameraTarget.azimuth; }, [cameraTarget]);
  useFrame((_, delta) => {
    const c = controls.current;
    if (target.current === null || !c) return;
    const cur = c.getAzimuthalAngle();
    let diff = target.current - cur;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    if (Math.abs(diff) < 0.002) { target.current = null; return; }
    const next = cur + diff * (1 - Math.exp(-8 * Math.min(delta, 0.05)));
    const off = camera.position.clone().sub(c.target);
    const r = Math.hypot(off.x, off.z);
    camera.position.set(c.target.x + Math.sin(next) * r, camera.position.y, c.target.z + Math.cos(next) * r);
    c.update();
  });
  return null;
}

export default function JacketScene() {
  const controls = useRef<OC | null>(null);
  const [ready, setReady] = useState(false);
  const { selectSlot } = useDesignState();
  return (
    <div className="relative h-full w-full" data-scene-ready={ready ? "" : undefined}>
      {!ready && <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">Loading jacket…</div>}
      <Canvas camera={{ position: [0, 0.4, 5], fov: 38 }} dpr={[1, 2]} onCreated={() => setReady(true)} onPointerMissed={() => selectSlot(null)} aria-label="3D jacket preview">
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 5, 4]} intensity={1.6} />
        <directionalLight position={[-4, 2, -4]} intensity={0.8} />
        <Environment>
          <Lightformer intensity={2} position={[0, 5, 0]} scale={[10, 10, 1]} />
          <Lightformer intensity={1} color="#ffe9c4" position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[20, 1, 1]} />
        </Environment>
        <JacketModel />
        <ContactShadows position={[0, -1.05, 0]} opacity={0.4} scale={6} blur={2.5} />
        <OrbitControls ref={controls} enablePan={false} minDistance={3.2} maxDistance={7} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 1.9} />
        <CameraRig controls={controls} />
      </Canvas>
    </div>
  );
}
