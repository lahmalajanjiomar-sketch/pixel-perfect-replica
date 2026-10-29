// Single source of truth for jacket patch slots. Add/edit slots here only.
export type Side = "front" | "back";

export interface PatchSlotConfig {
  id: string;
  label: string;
  side: Side;
  /** 3D position on the jacket (jacket faces +Z). */
  position: [number, number, number];
  /** Euler rotation in radians. Y rotation decides which way the patch faces. */
  rotation: [number, number, number];
  /** Width/height in world units. */
  size: [number, number];
  /** Recommended upload size in pixels. */
  recommended: { width: number; height: number };
}

export const PATCH_SLOTS: PatchSlotConfig[] = [
  { id: "left-chest", label: "Left chest", side: "front", position: [0.42, 0.45, 0.371], rotation: [0, 0, 0], size: [0.45, 0.45], recommended: { width: 1000, height: 1000 } },
  { id: "right-chest", label: "Right chest", side: "front", position: [-0.42, 0.45, 0.371], rotation: [0, 0, 0], size: [0.45, 0.45], recommended: { width: 1000, height: 1000 } },
  { id: "left-sleeve", label: "Left sleeve", side: "front", position: [1.205, 0.35, 0], rotation: [0, Math.PI / 2, 0], size: [0.34, 0.42], recommended: { width: 800, height: 1000 } },
  { id: "right-sleeve", label: "Right sleeve", side: "front", position: [-1.205, 0.35, 0], rotation: [0, -Math.PI / 2, 0], size: [0.34, 0.42], recommended: { width: 800, height: 1000 } },
  { id: "back-top", label: "Back top", side: "back", position: [0, 0.6, -0.371], rotation: [0, Math.PI, 0], size: [1.1, 0.32], recommended: { width: 1600, height: 470 } },
  { id: "back-center", label: "Back center", side: "back", position: [0, -0.05, -0.371], rotation: [0, Math.PI, 0], size: [0.85, 0.85], recommended: { width: 1400, height: 1400 } },
];

export const getSlot = (id: string) => PATCH_SLOTS.find((s) => s.id === id);

/** Camera azimuth (radians) that faces a slot head-on. */
export const slotAzimuth = (slot: PatchSlotConfig) => slot.rotation[1];
