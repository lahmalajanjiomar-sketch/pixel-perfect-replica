import { Check, Lock, Plus } from "lucide-react";
import { PATCHES, slotAzimuth } from "@/config/patches";
import { isFilled, isLocked } from "@/lib/patchRules";
import { useDesignState } from "@/hooks/useDesignState";
import { Button } from "@/components/ui/button";
export function ProgressChecklist() {
 const {values,patches,order,patchCount,selectedSlot,selectSlot,faceAzimuth,errors}=useDesignState();
 return <section aria-labelledby="progress-h">
  <div className="mb-3 flex justify-between items-baseline"><h3 id="progress-h" className="eyebrow">Numbered patches</h3><span className="text-xs text-muted-foreground">{patchCount}/11 filled</span></div>
    <ul className="grid grid-cols-2 gap-2">
  {PATCHES.map(p=>{const locked=isLocked(p,order.patch4Unlocked),filled=isFilled(p,values[p.id],order.patch4Unlocked);return <li key={p.id} id={`patch-${p.number}`}>
   <Button variant="outline" className="patch-tile" data-active={selectedSlot===p.id} data-locked={locked} aria-label={`${p.number}. ${p.label}, ${locked?"locked":filled?"filled":"empty"}`} aria-pressed={selectedSlot===p.id} onClick={()=>{selectSlot(p.id);faceAzimuth(slotAzimuth(p));}}>
    <span className="tile-number">{p.number}</span>
    <span className="patch-thumb">{patches[p.id] && !locked ? <img src={patches[p.id]?.url} alt={`${p.label} preview`} /> : locked ? <Lock/> : <Plus/>}</span>
    <span className="text-xs font-semibold">{p.label}</span>
    <span className="tile-status">{locked?<><Lock/>Available with upgrade</>:!p.editable?<><Lock/>Included</>:filled?<><Check/>Filled</>:"Empty"}</span>
   </Button>
   {errors[p.id] && <p role="alert" className="mt-1 text-xs text-destructive">{errors[p.id]}</p>}
  </li>;})}
  </ul>
 </section>;
}
