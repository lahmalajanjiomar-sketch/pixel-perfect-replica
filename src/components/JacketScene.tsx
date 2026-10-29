import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OC } from "three-stdlib";
import { useDesignState } from "@/hooks/useDesignState";
import { JacketModel } from "./JacketModel";
import * as THREE from "three";

function CaptureRig({ controls }: { controls: React.RefObject<OC | null> }) {
  const { gl, scene, camera } = useThree();
  const { registerCapture } = useDesignState();
  useEffect(() => {
    registerCapture(async () => {
      const c = controls.current;
      if (!c) throw new Error("Jacket is still loading.");
      const original = camera.position.clone();
      const target = c.target.clone();
      const enabled = c.enabled;
      const oldBackground = scene.background;
      c.enabled = false;
      scene.background = new THREE.Color("#ffffff");
      const view = (back: boolean) => {
        camera.position.set(0, -0.25, back ? -7 : 7); c.target.set(0, -0.75, 0); camera.lookAt(c.target); c.update();
        gl.render(scene, camera); return gl.domElement.toDataURL("image/png");
      };
      try { return { front: view(false), back: view(true) }; }
      finally { scene.background = oldBackground; camera.position.copy(original); c.target.copy(target); c.enabled = enabled; c.update(); }
    });
    return () => registerCapture(null);
  }, [gl, scene, camera, controls, registerCapture]);
  return null;
}

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
      <Canvas gl={{ preserveDrawingBuffer: true }} camera={{ position: [0, -0.25, 7], fov: 38 }} dpr={[1, 2]} onCreated={() => setReady(true)} onPointerMissed={() => selectSlot(null)} aria-label="3D jacket and pants preview">
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 5, 4]} intensity={1.6} />
        <directionalLight position={[-4, 2, -4]} intensity={0.8} />
        <Environment>
          <Lightformer intensity={2} position={[0, 5, 0]} scale={[10, 10, 1]} />
          <Lightformer intensity={1} color="#ffe9c4" position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[20, 1, 1]} />
        </Environment>
        <JacketModel />
        <ContactShadows position={[0, -2.95, 0]} opacity={0.4} scale={4} blur={2.5} />
        <OrbitControls ref={controls} target={[0, -0.75, 0]} enablePan={false} minDistance={5.5} maxDistance={9} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 1.9} />
        <CameraRig controls={controls} />
        <CaptureRig controls={controls} />
      </Canvas>
    </div>
  );
}
