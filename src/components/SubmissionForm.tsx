import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { useDesignState } from "@/hooks/useDesignState";
import { PATCHES, slotAzimuth } from "@/config/patches";
import { validateOrder } from "@/lib/patchRules";
import { generatePdf } from "@/lib/generatePdf";
import { submitDesign } from "@/api/designs";
import { Button } from "@/components/ui/button";
export function SubmissionForm({onDone}:{onDone:(pdf:Blob,id:string)=>void}){
 const {options,order,values,patches,patchCount,errors,setErrors,setOrderField,selectSlot,faceAzimuth,captureViews,setPatch4Unlocked}=useDesignState();
 const [busy,setBusy]=useState<string|null>(null);
 const submit=async(e:React.FormEvent)=>{e.preventDefault();const missing=validateOrder(order,values);setErrors(missing);const first=Object.keys(missing)[0];if(first){const p=PATCHES.find(p=>p.id===first);if(p){selectSlot(p.id);faceAzimuth(slotAzimuth(p));document.getElementById(`patch-${p.number}`)?.scrollIntoView({behavior:"smooth",block:"center"});}else{document.getElementById(`order-${first}`)?.scrollIntoView({behavior:"smooth",block:"center"});document.getElementById(`order-${first}`)?.focus();}return;}
 try{setBusy("Building your PDF…");if(!captureViews)throw new Error("Jacket still loading");const views=await captureViews();const pdf=await generatePdf(order,options,values,patches,views);setBusy("Sending design…");const res=await submitDesign({student:order,options,patches:values,pdf});onDone(pdf,res.id);}catch{setErrors({submit:"Something went wrong while submitting. Please try again."});}finally{setBusy(null);}};
 const field=(key:"fullName"|"grade"|"notes",label:string)=> <label className="block"><span className="field-label">{label}</span>{key==="notes"?<textarea id={`order-${key}`} className="field bilingual" dir="auto" rows={3} value={order[key]} onChange={e=>setOrderField(key,e.target.value)}/>:<input id={`order-${key}`} className="field bilingual" dir="auto" value={order[key]} aria-invalid={!!errors[key]} onChange={e=>setOrderField(key,e.target.value)}/>} {errors[key]&&<span role="alert" className="text-xs text-destructive">{errors[key]}</span>}</label>;
 return <form onSubmit={submit} noValidate className="space-y-3" aria-label="Order details">
  <div className="grid grid-cols-2 gap-3"><label><span className="field-label">NUM</span><input aria-label="NUM" readOnly className="field" value={order.num}/></label><label><span className="field-label">SIZE</span><select id="order-size" aria-label="SIZE" className="field" value={order.size} aria-invalid={!!errors["size"]} onChange={e=>setOrderField("size",e.target.value)}><option value="">Choose size</option>{["S","M","L"].map(s=><option key={s}>{s}</option>)}</select>{errors["size"]&&<span role="alert" className="text-xs text-destructive">{errors["size"]}</span>}</label></div>
  {field("fullName","NAME")}
  <div className="grid grid-cols-2 gap-3"><label><span className="field-label">PATCH NUM</span><input aria-label="PATCH NUM" readOnly className="field" value={patchCount}/></label>{field("grade","GRADE")}</div>
  {field("notes","NOTE (optional)")}
  {import.meta.env.DEV&&<label className="flex items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" aria-label="Dev: paid upgrade" checked={order.patch4Unlocked} onChange={e=>setPatch4Unlocked(e.target.checked)}/>Dev: paid upgrade</label>}
  {(errors["submit"]||errors["preview"])&&<p role="alert" className="text-sm text-destructive">{errors["submit"]||errors["preview"]}</p>}
  <Button type="submit" className="w-full" disabled={!!busy}>{busy?<><Loader2 className="animate-spin"/>{busy}</>:<><Send/>Submit design</>}</Button>
 </form>;
}
