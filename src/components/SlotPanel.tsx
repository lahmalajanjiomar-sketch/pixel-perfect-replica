import { useRef, useState } from "react";
import { Upload, X, RefreshCw, Trash2 } from "lucide-react";
import { getSlot } from "@/config/patchSlots";
import { useDesignState } from "@/hooks/useDesignState";
import { validateImage } from "@/lib/generatePdf";

export function SlotPanel() {
  const { selectedSlot, selectSlot, patches, setPatch, removePatch } = useDesignState();
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const slot = selectedSlot ? getSlot(selectedSlot) : null;
  if (!slot) return null;
  const patch = patches[slot.id];

  const onFile = (f?: File) => {
    if (!f) return;
    const err = validateImage(f);
    setError(err);
    if (!err) setPatch(slot.id, f);
  };

  return (
    <div role="dialog" aria-label={`${slot.label} patch`} className="panel-sheet">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="eyebrow">Patch slot</p>
          <h2 className="font-display text-2xl">{slot.label}</h2>
          <p className="text-xs text-muted-foreground">Recommended {slot.recommended.width}×{slot.recommended.height}px · PNG or JPG · max 10MB</p>
        </div>
        <button onClick={() => { selectSlot(null); setError(null); }} className="icon-btn" aria-label="Close panel"><X className="h-4 w-4" /></button>
      </div>

      <input ref={input} type="file" accept="image/png,image/jpeg" className="sr-only" aria-label={`Upload image for ${slot.label}`}
        onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />

      {patch ? (
        <div className="mt-4 space-y-3">
          <div className="grid h-44 place-items-center rounded-lg bg-muted p-2"><img src={patch.url} alt={`${slot.label} preview`} className="max-h-full max-w-full object-contain" /></div>
          <p className="truncate text-xs text-muted-foreground">{patch.file.name}</p>
          <div className="flex gap-2">
            <button className="btn-secondary flex-1" onClick={() => input.current?.click()}><RefreshCw className="h-4 w-4" />Replace</button>
            <button className="btn-danger flex-1" onClick={() => removePatch(slot.id)}><Trash2 className="h-4 w-4" />Remove</button>
          </div>
        </div>
      ) : (
        <button
          className="dropzone mt-4"
          onClick={() => input.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files?.[0]); }}
        >
          <Upload className="h-6 w-6" />
          <span className="font-medium">Upload an image</span>
          <span className="text-xs text-muted-foreground">Tap to choose or drop a file</span>
        </button>
      )}
      {error && <p role="alert" className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
