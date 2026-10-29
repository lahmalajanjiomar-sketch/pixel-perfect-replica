export type Side = "front" | "back";
export type PatchType = "standard" | "initials" | "name" | "quote" | "country" | "number" | "image";
export const NAME_MAX_LENGTH = 12;
export const QUOTE_MAX_LENGTH = 40;
export const TEXT_PATCH_STYLE = { font: '"Noto Sans Arabic", sans-serif', color: "#f4efe2", outline: "#1f2a5c", background: "#1f2a5c", width: 1600, height: 800 };
export interface PatchConfig {
  number: number; id: string; label: string; type: PatchType; editable: boolean; required: boolean;
  slot: string; side: Side;
  position: [number, number, number]; rotation: [number, number, number]; size: [number, number];
  recommended: { width: number; height: number };
}
// Edit position/rotation/size here only. Existing chest, sleeve and back regions are preserved.
export const PATCHES: PatchConfig[] = [
  { number: 1, id: "standard-1", label: "Standard patch #1", type: "standard", editable: false, required: false, slot: "left-chest", side: "front", position: [0.42, 0.45, 0.38], rotation: [0, 0, 0], size: [0.45, 0.45], recommended: { width: 1600, height: 1600 } },
  { number: 2, id: "standard-2", label: "Standard patch #2", type: "standard", editable: false, required: false, slot: "right-chest", side: "front", position: [-0.42, 0.45, 0.38], rotation: [0, 0, 0], size: [0.45, 0.45], recommended: { width: 1600, height: 1600 } },
  { number: 3, id: "initials", label: "INITIALS", type: "initials", editable: true, required: true, slot: "left-chest", side: "front", position: [0.42, -0.1, 0.38], rotation: [0, 0, 0], size: [0.45, 0.3], recommended: { width: 1600, height: 800 } },
  { number: 4, id: "name", label: "NAME", type: "name", editable: true, required: true, slot: "back-top", side: "back", position: [0, 0.6, -0.38], rotation: [0, Math.PI, 0], size: [1.1, 0.32], recommended: { width: 1600, height: 800 } },
  { number: 5, id: "quote", label: "QUOTE", type: "quote", editable: true, required: true, slot: "back-center", side: "back", position: [0, -0.6, -0.38], rotation: [0, Math.PI, 0], size: [1.3, 0.28], recommended: { width: 1600, height: 800 } },
  { number: 6, id: "country", label: "COUNTRY", type: "country", editable: true, required: true, slot: "right-sleeve", side: "front", position: [-1.205, 0.35, 0], rotation: [0, -Math.PI / 2, 0], size: [0.34, 0.42], recommended: { width: 1600, height: 1067 } },
  { number: 7, id: "number", label: "NUMBER", type: "number", editable: true, required: true, slot: "back-center", side: "back", position: [0, 0.05, -0.38], rotation: [0, Math.PI, 0], size: [0.65, 0.55], recommended: { width: 1600, height: 800 } },
  { number: 8, id: "patch-1", label: "PATCH 1", type: "image", editable: true, required: true, slot: "left-sleeve", side: "front", position: [1.205, 0.35, 0], rotation: [0, Math.PI / 2, 0], size: [0.34, 0.42], recommended: { width: 1600, height: 1600 } },
  { number: 9, id: "patch-2", label: "PATCH 2", type: "image", editable: true, required: true, slot: "left-sleeve", side: "front", position: [1.205, -0.25, 0], rotation: [0, Math.PI / 2, 0], size: [0.34, 0.42], recommended: { width: 1600, height: 1600 } },
  { number: 10, id: "patch-3", label: "PATCH 3", type: "image", editable: true, required: true, slot: "right-sleeve", side: "front", position: [-1.205, -0.25, 0], rotation: [0, -Math.PI / 2, 0], size: [0.34, 0.42], recommended: { width: 1600, height: 1600 } },
  { number: 11, id: "patch-4", label: "PATCH 4", type: "image", editable: true, required: false, slot: "right-chest", side: "front", position: [-0.42, -0.1, 0.38], rotation: [0, 0, 0], size: [0.45, 0.4], recommended: { width: 1600, height: 1600 } },
];
export const getPatch = (id: string) => PATCHES.find((p) => p.id === id);
export const slotAzimuth = (patch: PatchConfig) => patch.rotation[1];