import { jsPDF } from "jspdf";
import { PATCH_SLOTS } from "@/config/patchSlots";
import type { JacketOptions, Student } from "@/hooks/useDesignState";

export const ACCEPTED_TYPES = ["image/png", "image/jpeg"];
export const MAX_BYTES = 10 * 1024 * 1024;

export function validateImage(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return "Please choose a PNG or JPG image.";
  if (file.size > MAX_BYTES) return "That image is over 10MB. Please pick a smaller one.";
  return null;
}

/** Resize to max 1600px and flatten transparency onto white. */
export async function normalizeImage(file: File, max = 1600): Promise<{ dataUrl: string; width: number; height: number }> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const width = Math.round(bmp.width * scale);
  const height = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bmp, 0, 0, width, height);
  bmp.close();
  return { dataUrl: canvas.toDataURL("image/jpeg", 0.9), width, height };
}

export async function generatePdf(student: Student, options: JacketOptions, patches: Record<string, File>): Promise<Blob> {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const m = 48;
  let y = m;

  doc.setFont("helvetica", "bold").setFontSize(22).text("Senior Jacket Design", m, y + 10);
  y += 44;
  doc.setFontSize(13).text("Student", m, y);
  doc.setFont("helvetica", "normal").setFontSize(11);
  for (const [k, v] of [["Name", student.fullName], ["Email", student.email], ["Class year", student.classYear], ["Notes", student.notes || "—"]]) {
    y += 18;
    const lines = doc.splitTextToSize(`${k}: ${v}`, W - m * 2);
    doc.text(lines, m, y);
    y += (lines.length - 1) * 14;
  }
  y += 30;
  doc.setFont("helvetica", "bold").setFontSize(13).text("Jacket", m, y);
  doc.setFont("helvetica", "normal").setFontSize(11);
  const swatch = (label: string, hex: string) => {
    y += 20;
    doc.setFillColor(hex).rect(m, y - 10, 12, 12, "F");
    doc.text(`${label}: ${hex}`, m + 20, y);
  };
  swatch("Body color", options.bodyColor);
  swatch("Sleeve color", options.sleeveColor);
  y += 18;
  doc.text(`Text: ${options.text || "—"}`, m, y);
  y += 30;
  doc.setFont("helvetica", "bold").setFontSize(13).text("Patches", m, y);
  doc.setFont("helvetica", "normal").setFontSize(11);
  for (const s of PATCH_SLOTS) {
    y += 18;
    doc.text(`${patches[s.id] ? "[x]" : "[ ]"}  ${s.label}${patches[s.id] ? ` — ${patches[s.id].name}` : " — empty"}`, m, y);
  }

  for (const s of PATCH_SLOTS) {
    const f = patches[s.id];
    if (!f) continue;
    doc.addPage();
    doc.setFont("helvetica", "bold").setFontSize(18).text(s.label, m, m + 10);
    const img = await normalizeImage(f);
    const maxW = W - m * 2, maxH = H - m * 2 - 40;
    const sc = Math.min(maxW / img.width, maxH / img.height);
    const w = img.width * sc, h = img.height * sc;
    doc.addImage(img.dataUrl, "JPEG", (W - w) / 2, m + 40, w, h);
  }
  return doc.output("blob");
}
