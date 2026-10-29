import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { PATCH_SLOTS } from "@/config/patchSlots";
import { useDesignState } from "@/hooks/useDesignState";
import { PatchSlot } from "./PatchSlot";

/** Varsity jacket and matching pants built from primitives. Patch positions live in patches.ts. */
export function JacketModel() {
  const { options } = useDesignState();

  const textTex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024; c.height = 192;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  useEffect(() => {
    const c = textTex.image as HTMLCanvasElement;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.font = "bold 110px Georgia, serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.lineWidth = 10; ctx.strokeStyle = options.bodyColor;
    ctx.fillStyle = options.sleeveColor;
    ctx.strokeText(options.text.toUpperCase(), 512, 96);
    ctx.fillText(options.text.toUpperCase(), 512, 96);
    textTex.needsUpdate = true;
  }, [options.text, options.sleeveColor, options.bodyColor, textTex]);

  const body = <meshStandardMaterial color={options.bodyColor} roughness={0.85} />;
  const sleeve = <meshStandardMaterial color={options.sleeveColor} roughness={0.6} />;
  const rib = <meshStandardMaterial color={options.bodyColor} roughness={0.95} />;

  return (
    <group position={[0, 0.1, 0]}>
      {/* torso */}
      <RoundedBox args={[1.7, 1.9, 0.74]} radius={0.12} smoothness={4} castShadow>{body}</RoundedBox>
      {/* collar */}
      <mesh position={[0, 0.98, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.3, 0.07, 12, 32]} />{rib}</mesh>
      {/* waist band */}
      <mesh position={[0, -0.95, 0]}><boxGeometry args={[1.72, 0.14, 0.76]} />{rib}</mesh>
      {/* front zip line */}
      <mesh position={[0, 0, 0.372]}><planeGeometry args={[0.03, 1.8]} /><meshStandardMaterial color="#d9d4c5" metalness={0.6} roughness={0.3} /></mesh>
      {/* sleeves */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 1.0, 0.15, 0]}>
          <mesh rotation={[0, 0, s * 0.06]} castShadow><cylinderGeometry args={[0.2, 0.18, 1.7, 24]} />{sleeve}</mesh>
          <mesh position={[0, -0.88, 0]}><cylinderGeometry args={[0.19, 0.19, 0.14, 24]} />{rib}</mesh>
        </group>
      ))}
      {/* Matching tapered pant legs keep the lower-body patches on the garment. */}
      <mesh position={[0, -1.18, 0]} castShadow><RoundedBox args={[1.02, 0.22, 0.52]} radius={0.08} smoothness={3}>{body}</RoundedBox></mesh>
      {[-1, 1].map((s) => (
        <group key={`pant-${s}`} position={[s * 0.31, -2.02, 0]}>
          <mesh castShadow><cylinderGeometry args={[0.34, 0.22, 1.7, 32]} />{body}</mesh>
          <mesh position={[0, -0.86, 0]}><cylinderGeometry args={[0.23, 0.23, 0.16, 24]} />{rib}</mesh>
        </group>
      ))}
      {/* back text */}
      <mesh position={[0, -0.62, -0.372]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.4, 0.26]} />
        <meshStandardMaterial map={textTex} transparent />
      </mesh>
      {PATCH_SLOTS.map((s) => <PatchSlot key={s.id} slot={s} />)}
    </group>
  );
}
