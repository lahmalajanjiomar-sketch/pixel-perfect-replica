import { useEffect, useState } from "react";
import * as THREE from "three";
import { Edges } from "@react-three/drei";
import type { PatchSlotConfig } from "@/config/patchSlots";
import { useDesignState } from "@/hooks/useDesignState";
import { isLocked } from "@/lib/patchRules";

export function PatchSlot({ slot }: { slot: PatchSlotConfig }) {
  const { patches, order, selectedSlot, hoveredSlot, selectSlot, hoverSlot } = useDesignState();
  const locked = isLocked(slot, order.patch4Unlocked);
  const patch = patches[slot.id];
  const [tex, setTex] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!patch || locked) { setTex(null); return; }
    let live = true;
    let t: THREE.Texture | null = null;
    new THREE.TextureLoader().load(patch.url, (loaded) => {
      loaded.colorSpace = THREE.SRGBColorSpace;
      if (!live) { loaded.dispose(); return; }
      t = loaded;
      setTex(loaded);
    });
    return () => { live = false; t?.dispose(); };
  }, [patch, locked]);

  const active = selectedSlot === slot.id;
  const hovered = hoveredSlot === slot.id;
  const edge = active ? "#f5c542" : hovered ? "#ffffff" : "#e8e2cf";

  // Fit image inside slot preserving aspect.
  let [w, h] = slot.size;
  if (tex?.image) {
    const img = tex.image as { width: number; height: number };
    const a = img.width / img.height;
    if (a > w / h) h = w / a; else w = h * a;
  }

  return (
    <mesh
      position={slot.position}
      rotation={slot.rotation}
      onPointerOver={(e) => { e.stopPropagation(); hoverSlot(slot.id); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { hoverSlot(null); document.body.style.cursor = ""; }}
      onClick={(e) => { e.stopPropagation(); selectSlot(slot.id); }}
    >
      <planeGeometry args={tex ? [w, h] : slot.size} />
      {tex ? (
        <meshStandardMaterial map={tex} roughness={0.7} polygonOffset polygonOffsetFactor={-1} />
      ) : (
        <meshBasicMaterial color={edge} transparent opacity={active || hovered ? 0.35 : 0.12} depthWrite={false} />
      )}
      {(!tex || active || hovered) && <Edges color={edge} lineWidth={active ? 3 : 1.5} />}
    </mesh>
  );
}
