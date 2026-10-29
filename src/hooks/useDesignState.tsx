import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export interface Patch { file: File; url: string }
export interface JacketOptions { bodyColor: string; sleeveColor: string; text: string }
export interface Student { fullName: string; email: string; classYear: string; notes: string }

interface DesignState {
  options: JacketOptions;
  patches: Record<string, Patch>;
  selectedSlot: string | null;
  hoveredSlot: string | null;
  /** Camera azimuth request; nonce forces re-trigger. */
  cameraTarget: { azimuth: number; nonce: number } | null;
  setOption: <K extends keyof JacketOptions>(k: K, v: JacketOptions[K]) => void;
  setPatch: (slotId: string, file: File) => void;
  removePatch: (slotId: string) => void;
  selectSlot: (id: string | null) => void;
  hoverSlot: (id: string | null) => void;
  faceAzimuth: (azimuth: number) => void;
}

const Ctx = createContext<DesignState | null>(null);

export const BODY_COLORS = ["#1f2a5c", "#7a1f2b", "#14532d", "#111111", "#4b2e83", "#c2410c"];
export const SLEEVE_COLORS = ["#f4efe2", "#d4a72c", "#9ca3af", "#111111", "#7a1f2b", "#1f2a5c"];

export function DesignProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<JacketOptions>({ bodyColor: BODY_COLORS[0]!, sleeveColor: SLEEVE_COLORS[0]!, text: "CLASS OF 2027" });
  const [patches, setPatches] = useState<Record<string, Patch>>({});
  const [selectedSlot, selectSlot] = useState<string | null>(null);
  const [hoveredSlot, hoverSlot] = useState<string | null>(null);
  const [cameraTarget, setCameraTarget] = useState<DesignState["cameraTarget"]>(null);

  const setOption = useCallback(<K extends keyof JacketOptions>(k: K, v: JacketOptions[K]) => setOptions((o) => ({ ...o, [k]: v })), []);
  const setPatch = useCallback((slotId: string, file: File) => {
    setPatches((p) => {
      if (p[slotId]) URL.revokeObjectURL(p[slotId].url);
      return { ...p, [slotId]: { file, url: URL.createObjectURL(file) } };
    });
  }, []);
  const removePatch = useCallback((slotId: string) => {
    setPatches((p) => {
      if (!p[slotId]) return p;
      URL.revokeObjectURL(p[slotId].url);
      const { [slotId]: _, ...rest } = p;
      return rest;
    });
  }, []);
  const faceAzimuth = useCallback((azimuth: number) => setCameraTarget((c) => ({ azimuth, nonce: (c?.nonce ?? 0) + 1 })), []);

  const value = useMemo(
    () => ({ options, patches, selectedSlot, hoveredSlot, cameraTarget, setOption, setPatch, removePatch, selectSlot, hoverSlot, faceAzimuth }),
    [options, patches, selectedSlot, hoveredSlot, cameraTarget, setOption, setPatch, removePatch, faceAzimuth],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDesignState() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useDesignState must be used inside DesignProvider");
  return c;
}
