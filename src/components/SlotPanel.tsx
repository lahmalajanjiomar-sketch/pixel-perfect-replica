import { useRef, useState } from "react";
import { Upload, X, RefreshCw, Trash2, Lock } from "lucide-react";
import { countries } from "country-flag-icons";
import { getPatch, NAME_MAX_LENGTH, QUOTE_MAX_LENGTH } from "@/config/patches";
import { useDesignState } from "@/hooks/useDesignState";
import { isLocked } from "@/lib/patchRules";
import { Button } from "@/components/ui/button";
const names = new Intl.DisplayNames(["en"],{type:"region"});
const countryList=countries.map(code=>({code,name:names.of(code)??code})).sort((a,b)=>a.name.localeCompare(b.name));
export function SlotPanel(){
 const {selectedSlot,selectSlot,order,values,patches,setText,setCountry,setPatch,removePatch,arabicDigits,setArabicDigits,errors}=useDesignState();
 const input=useRef<HTMLInputElement>(null); const [search,setSearch]=useState("");const [own,setOwn]=useState(false);
 const p=selectedSlot?getPatch(selectedSlot):null;if(!p)return null;
 const value=values[p.id],preview=patches[p.id],locked=isLocked(p,order.patch4Unlocked);
 const upload=<><input ref={input} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" aria-label={`Upload image for ${p.label}`} onChange={e=>{const f=e.target.files?.[0];if(f)setPatch(p.id,f);e.target.value="";}}/>
  {value?.file?<><p className="truncate text-xs text-muted-foreground">{value.file.name}</p><div className="flex gap-2"><Button variant="secondary" className="flex-1" onClick={()=>input.current?.click()}><RefreshCw/>Replace</Button><Button variant="destructive" className="flex-1" onClick={()=>removePatch(p.id)}><Trash2/>Remove</Button></div></>:<Button variant="outline" className="dropzone h-auto whitespace-normal" onClick={()=>input.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files?.[0];if(f)setPatch(p.id,f);}}><Upload/><span>Upload an image</span><span className="text-xs text-muted-foreground">PNG / JPG / WEBP · max 10MB</span></Button>}</>;
 return <div role="dialog" aria-label={`${p.label} patch`} className="panel-sheet" key={p.id}>
  <div className="flex justify-between gap-2 mb-4"><div><p className="eyebrow">Patch {p.number}</p><h2 className="font-display text-2xl">{p.label}</h2></div><Button variant="ghost" size="icon" aria-label="Close panel" onClick={()=>selectSlot(null)}><X/></Button></div>
  {preview && !locked && <div className="patch-preview mb-4"><img src={preview.url} alt={`${p.label} live preview`}/></div>}
  {locked?<p className="flex items-center gap-2 text-muted-foreground"><Lock className="h-4 w-4"/>Available with upgrade</p>:!p.editable?<p className="flex items-center gap-2 text-muted-foreground"><Lock className="h-4 w-4"/>Included</p>:p.type==="country"?<div className="space-y-3">
    <input className="field" aria-label="Search countries" placeholder="Search countries" value={search} onChange={e=>setSearch(e.target.value)}/>
    <select className="field" aria-label="Country" value={own||value?.file?"upload":value?.countryCode??""} onChange={e=>{if(e.target.value==="upload"){setOwn(true);removePatch(p.id);}else{setOwn(false);setCountry(e.target.value);}}}><option value="">Choose a country</option><option value="upload">Upload my own</option>{countryList.filter(c=>`${c.name} ${c.code}`.toLowerCase().includes(search.toLowerCase())).map(c=><option key={c.code} value={c.code}>{c.name}</option>)}</select>
    {(own||value?.file)&&upload}
   </div>:p.type==="image"?<div className="space-y-3">{upload}</div>:<div className="space-y-3">
    <label className="block"><span className="field-label">{p.label}</span><input autoFocus className="field bilingual" dir="auto" aria-label={`${p.label} patch text`} inputMode={p.type==="number"?"numeric":"text"} maxLength={p.type==="initials"||p.type==="number"?2:p.type==="quote"?QUOTE_MAX_LENGTH:NAME_MAX_LENGTH} value={value?.text??""} onChange={e=>setText(p.id,e.target.value)}/></label>
    <p className="text-xs text-muted-foreground">{p.type==="initials"?"Exactly 2 letters (A–Z)":p.type==="number"?"1–2 digits · 00–99":`${Array.from(value?.text??"").length}/${p.type==="quote"?QUOTE_MAX_LENGTH:NAME_MAX_LENGTH} characters`}</p>
    {p.type==="number"&&<label className="flex gap-2 items-center text-sm"><input type="checkbox" checked={arabicDigits} onChange={e=>setArabicDigits(e.target.checked)}/>Arabic digits (٢٧)</label>}
   </div>}
  {errors[p.id]&&<p role="alert" className="mt-3 text-sm text-destructive">{errors[p.id]}</p>}
 </div>;
}
