import { jsPDF } from "jspdf";
import { PATCHES, TEXT_PATCH_STYLE } from "@/config/patches";
import { countPatches, isLocked, type Order, type PatchValue } from "./patchRules";
export { validateImage, ACCEPTED_TYPES, MAX_BYTES } from "./patchRules";
export async function normalizeImage(source: File | string): Promise<{dataUrl:string;width:number;height:number}> {
 const image = new Image(); let url = typeof source === "string" ? source : URL.createObjectURL(source);
 try {
  await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error("Image could not be opened"));image.src=url;});
  const c=document.createElement("canvas");c.width=image.naturalWidth;c.height=image.naturalHeight;
  const ctx=c.getContext("2d");if(!ctx)throw new Error("Image rendering unavailable");
  ctx.fillStyle="#ffffff";ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(image,0,0);
  return {dataUrl:c.toDataURL("image/png"),width:c.width,height:c.height};
 } finally {if(typeof source!=="string") URL.revokeObjectURL(url);}
}
async function textImage(text:string,width=1500,height=110):Promise<string>{
 await document.fonts.load(`600 70px ${TEXT_PATCH_STYLE.font}`);
 const c=document.createElement("canvas");c.width=width;c.height=height;const ctx=c.getContext("2d");if(!ctx)throw new Error("Text rendering unavailable");
 ctx.fillStyle="#ffffff";ctx.fillRect(0,0,width,height);ctx.fillStyle="#111111";ctx.font=`600 60px ${TEXT_PATCH_STYLE.font}`;ctx.textBaseline="middle";
 ctx.direction=/[\u0600-\u06ff]/.test(text)?"rtl":"ltr";ctx.textAlign=ctx.direction==="rtl"?"right":"left";
 ctx.fillText(text,ctx.direction==="rtl"?width-10:10,height/2,width-20);return c.toDataURL("image/png");
}
export async function generatePdf(order:Order, options:{bodyColor:string;sleeveColor:string}, values:Record<string,PatchValue>, patches:Record<string,{url:string;file?:File}>, views:{front:string;back:string}):Promise<Blob>{
 const doc=new jsPDF({unit:"pt",format:"letter"});const W=612,H=792,m=28;
 doc.setFont("helvetica","bold").setFontSize(20).text("SENIOR JACKET ORDER",m,42);
 const addFit=async(source:File|string,x:number,y:number,w:number,h:number)=>{const img=await normalizeImage(source);const scale=Math.min(w/img.width,h/img.height);const iw=img.width*scale,ih=img.height*scale;doc.addImage(img.dataUrl,"PNG",x+(w-iw)/2,y+(h-ih)/2,iw,ih);};
 const leftW=246,rightX=296,tileW=128,tileH=76;
 await addFit(views.front,m,68,leftW,292); await addFit(views.back,m,372,leftW,292);
 doc.setFontSize(10).text("FRONT",m+100,365).text("BACK",m+102,669);
 for(let i=0;i<PATCHES.length;i++){
  const p=PATCHES[i];if(!p)continue;const x=rightX+(i%2)*tileW,y=68+Math.floor(i/2)*tileH;
  doc.setDrawColor(190).setFillColor(232,232,232).roundedRect(x,y,tileW-6,tileH-5,7,7,"FD");doc.setFontSize(9).text(String(p.number).padStart(2,"0"),x+5,y+11);
  const patch=patches[p.id];if(patch&&!isLocked(p,order.patch4Unlocked))await addFit(patch.file??patch.url,x+22,y+5,tileW-34,48);
  doc.setFontSize(7).text(p.label,x+5,y+65);
  if(isLocked(p,order.patch4Unlocked))doc.text("LOCKED",x+34,y+37);
 }
 const details=[`NUM : ${order.num}`,`SIZE : ${order.size}`,`NAME : ${order.fullName}`,`PATCH NUM : ${countPatches(values,order.patch4Unlocked)}`,`GRADE : ${order.grade}`];
 let y=524;for(const detail of details){doc.addImage(await textImage(detail),"PNG",rightX,y,265,22);y+=25;}
 const notes=order.notes||"—";const noteLines=Array.from(notes.matchAll(/[^\n]{1,32}|\n/g)).map(m=>m[0]);
 const visibleNotes=noteLines.slice(0,4);for(const [i,line]of visibleNotes.entries()){doc.addImage(await textImage(`${i===0?"NOTE: ":""}${line}`),"PNG",rightX,y,265,22);y+=23;}
 doc.setFontSize(9).text(`Body: ${options.bodyColor}   Sleeves: ${options.sleeveColor}`,m,H-35);
 if(noteLines.length>4){doc.addPage();doc.setFontSize(16).text(`ORDER ${order.num} — NOTES`,m,44);let ny=72;for(const line of noteLines){if(ny>H-45){doc.addPage();ny=45;}doc.addImage(await textImage(line),"PNG",m,ny,W-m*2,32);ny+=36;}}
 for(const p of PATCHES){const patch=patches[p.id];if(!patch||isLocked(p,order.patch4Unlocked))continue;
  doc.addPage();doc.setFontSize(17).text(`${p.number}. ${p.label}`,m,42);doc.addImage(await textImage(`NUM: ${order.num}     NAME: ${order.fullName}`),"PNG",m,52,W-m*2,35);
  await addFit(patch.file??patch.url,m,110,W-m*2,H-140);
 }
 return doc.output("blob");
}
