import { Check } from "lucide-react";
import { PATCH_SLOTS, slotAzimuth } from "@/config/patchSlots";
import { useDesignState } from "@/hooks/useDesignState";

export function ProgressChecklist() {
  const { patches, selectedSlot, selectSlot, faceAzimuth } = useDesignState();
  const filled = PATCH_SLOTS.filter((s) => patches[s.id]).length;
  return (
    <section aria-labelledby="progress-h">
      <div className="mb-2 flex items-baseline justify-between">
        <h3 id="progress-h" className="eyebrow">Patches</h3>
        <span className="text-xs text-muted-foreground">{filled}/{PATCH_SLOTS.length} filled</span>
      </div>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-all" style={{ width: `${(filled / PATCH_SLOTS.length) * 100}%` }} /></div>
      <ul className="grid grid-cols-2 gap-1.5">
        {PATCH_SLOTS.map((s) => {
          const done = !!patches[s.id];
          return (
            <li key={s.id}>
              <button
                aria-pressed={selectedSlot === s.id}
                aria-label={`${s.label}, ${done ? "filled" : "empty"}`}
                onClick={() => { selectSlot(s.id); faceAzimuth(slotAzimuth(s)); }}
                className="check-item"
                data-active={selectedSlot === s.id}
              >
                <span className="check-dot" data-done={done}>{done && <Check className="h-3 w-3" />}</span>
                <span className="truncate">{s.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
