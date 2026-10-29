import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { PATCHES, getPatch } from "@/config/patches";
import { checkPaymentStatus, getOrderNumber } from "@/api/orders";
import { countPatches, isLocked, sanitizeText, validateImage, type Order, type PatchValue } from "@/lib/patchRules";
import { renderPatch } from "@/lib/renderPatch";
export interface Patch { file?: File; url: string }
export interface JacketOptions { bodyColor: string; sleeveColor: string; text: string }
export type Student = Order;
interface DesignState {
 options: JacketOptions; order: Order; values: Record<string, PatchValue>; patches: Record<string, Patch>; patchCount: number; arabicDigits: boolean;
 selectedSlot: string | null; hoveredSlot: string | null; cameraTarget: { azimuth: number; nonce: number } | null;
 errors: Record<string,string>; setErrors: (errors: Record<string,string>) => void;
 setOrderField: (key: "size" | "fullName" | "grade" | "notes", value: string) => void;
 setPatch4Unlocked: (value: boolean) => void; setArabicDigits: (value: boolean) => void;
 setText: (id: string, text: string) => void; setCountry: (code: string) => void;
 setOption: <K extends keyof JacketOptions>(k: K, v: JacketOptions[K]) => void;
 setPatch: (id: string, file: File) => void; removePatch: (id: string) => void;
 selectSlot: (id: string | null) => void; hoverSlot: (id: string | null) => void; faceAzimuth: (angle: number) => void;
 captureViews: (() => Promise<{ front: string; back: string }>) | null;
 registerCapture: (fn: (() => Promise<{front: string; back: string}>) | null) => void;
}
const Ctx = createContext<DesignState | null>(null);
export const BODY_COLORS = ["#111111", "#1f2a5c", "#7a1f2b", "#14532d", "#4b2e83", "#c2410c"];
export const SLEEVE_COLORS = ["#333333", "#f4efe2", "#d4a72c", "#9ca3af", "#111111", "#7a1f2b"];
export function DesignProvider({ children }: { children: ReactNode }) {
 const [options, setOptions] = useState<JacketOptions>({bodyColor: BODY_COLORS[0] ?? "", sleeveColor: SLEEVE_COLORS[0] ?? "", text: ""});
 const [order, setOrder] = useState<Order>({size:"", fullName:"", grade:"", notes:"", num:"", patch4Unlocked:false});
 const [values, setValues] = useState<Record<string,PatchValue>>({});
 const [patches, setPatches] = useState<Record<string,Patch>>({});
 const [arabicDigits, setArabicDigits] = useState(false);
 const [errors, setErrors] = useState<Record<string,string>>({});
 const [selectedSlot, selectSlot] = useState<string | null>(null);
 const [hoveredSlot, hoverSlot] = useState<string | null>(null);
 const [cameraTarget, setCameraTarget] = useState<DesignState["cameraTarget"]>(null);
 const [captureViews, setCapture] = useState<DesignState["captureViews"]>(null);
 const numRef = useRef<string | null>(null);
 useEffect(() => { if (!numRef.current) numRef.current = getOrderNumber(); const num = numRef.current; setOrder(o => ({...o,num})); let live=true; checkPaymentStatus().then(paid => {if(live) setOrder(o=>({...o,patch4Unlocked:paid}));}); return ()=>{live=false;}; },[]);
 useEffect(() => {
   let live=true; const urls: string[]=[];
   Promise.all(PATCHES.map(async p => {
     if (isLocked(p,order.patch4Unlocked)) return null;
     const v=values[p.id];
     if(v?.file) { const url=URL.createObjectURL(v.file); urls.push(url); return [p.id,{file:v.file,url}] as const; }
     const url=await renderPatch(p,v,arabicDigits); return url ? [p.id,{url}] as const : null;
   })).then(entries=>{if(live) setPatches(Object.fromEntries(entries.filter(e=>e!==null)));}).catch(()=>{if(live) setErrors(e=>({...e,preview:"Could not render patch previews. Please try again."}));});
   return ()=>{live=false;urls.forEach(url=>URL.revokeObjectURL(url));};
 },[values,arabicDigits,order.patch4Unlocked]);
 const clearError = useCallback((id:string)=>setErrors(e=>{const next={...e};delete next[id];return next;}),[]);
 const setText=useCallback((id:string,text:string)=>{const p=getPatch(id);if(!p || !p.editable || isLocked(p,order.patch4Unlocked))return;setValues(v=>({...v,[id]:{text:sanitizeText(p.type,text)}}));clearError(id);},[order.patch4Unlocked,clearError]);
 const setCountry=useCallback((countryCode:string)=>{setValues(v=>({...v,country:{countryCode}}));clearError("country");},[clearError]);
 const setPatch=useCallback((id:string,file:File)=>{const p=getPatch(id);if(!p || !p.editable || isLocked(p,order.patch4Unlocked) || !["image","country"].includes(p.type))return;const error=validateImage(file);if(error){setErrors(e=>({...e,[id]:error}));return;}setValues(v=>({...v,[id]:{file}}));clearError(id);},[order.patch4Unlocked,clearError]);
 const removePatch=useCallback((id:string)=>{const p=getPatch(id);if(!p?.editable || isLocked(p,order.patch4Unlocked))return;setValues(v=>{const next={...v};delete next[id];return next;});},[order.patch4Unlocked]);
 const setOption=useCallback(<K extends keyof JacketOptions>(k:K,v:JacketOptions[K])=>setOptions(o=>({...o,[k]:v})),[]);
 const setOrderField=useCallback((key:"size"|"fullName"|"grade"|"notes",value:string)=>{if(key==="size" && !["","S","M","L"].includes(value))return;setOrder(o=>({...o,[key]:value}));clearError(key);},[clearError]);
 const setPatch4Unlocked=useCallback((value:boolean)=>{setOrder(o=>({...o,patch4Unlocked:value}));if(!value)setValues(v=>{const next={...v};delete next["patch-4"];return next;});},[]);
 const faceAzimuth=useCallback((azimuth:number)=>setCameraTarget(c=>({azimuth,nonce:(c?.nonce??0)+1})),[]);
 const registerCapture=useCallback((fn:DesignState["captureViews"])=>setCapture(()=>fn),[]);
 const value=useMemo(()=>({options,order,values,patches,patchCount:countPatches(values,order.patch4Unlocked),arabicDigits,setArabicDigits,errors,setErrors,setOrderField,setPatch4Unlocked,setText,setCountry,selectedSlot,hoveredSlot,cameraTarget,setOption,setPatch,removePatch,selectSlot,hoverSlot,faceAzimuth,captureViews,registerCapture}),[options,order,values,patches,arabicDigits,errors,setOrderField,setPatch4Unlocked,setText,setCountry,selectedSlot,hoveredSlot,cameraTarget,setOption,setPatch,removePatch,faceAzimuth,captureViews,registerCapture]);
 return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useDesignState(){const c=useContext(Ctx);if(!c)throw new Error("useDesignState must be used inside DesignProvider");return c;}
