import { TEXT_PATCH_STYLE, type PatchConfig } from "@/config/patches";
import { displayDigits, type PatchValue } from "./patchRules";
export async function renderPatch(patch: PatchConfig, value: PatchValue | undefined, arabicDigits: boolean): Promise<string | null> {
  if (value?.file) return null;
  let text = value?.text ?? "";
  if (patch.type === "number") text = displayDigits(text, arabicDigits);
  if (patch.type === "standard") text = patch.number === 1 ? "S" : "★";
  if (patch.type === "country") {
    if (!value?.countryCode) return null;
    const flag = await import(`country-flag-icons/string/3x2`);
    const svg = (flag as Record<string, string>)[value.countryCode];
    return svg ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` : null;
  }
  if (!text.trim()) return null;
  await document.fonts.load(`600 100px ${TEXT_PATCH_STYLE.font}`);
  const c = document.createElement("canvas");
  c.width = TEXT_PATCH_STYLE.width; c.height = patch.type === "standard" ? TEXT_PATCH_STYLE.width : TEXT_PATCH_STYLE.height;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("Could not create patch preview.");
  if (patch.type === "standard") {
    ctx.fillStyle = TEXT_PATCH_STYLE.background;
    ctx.beginPath(); ctx.moveTo(c.width * 0.15, c.height * 0.1); ctx.lineTo(c.width * 0.85, c.height * 0.1); ctx.lineTo(c.width * 0.8, c.height * 0.65); ctx.lineTo(c.width * 0.5, c.height * 0.92); ctx.lineTo(c.width * 0.2, c.height * 0.65); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = TEXT_PATCH_STYLE.color; ctx.lineWidth = 35; ctx.stroke();
  }
  ctx.direction = /^[^A-Za-z\u0600-\u06ff]*[\u0600-\u06ff]/u.test(text) ? "rtl" : "ltr";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  let size = patch.type === "standard" ? 850 : 420;
  ctx.font = `600 ${size}px ${TEXT_PATCH_STYLE.font}`;
  while (ctx.measureText(text).width > c.width * 0.88 && size > 24) { size -= 4; ctx.font = `600 ${size}px ${TEXT_PATCH_STYLE.font}`; }
  ctx.lineWidth = Math.max(6, size / 32); ctx.lineJoin = "round"; ctx.strokeStyle = TEXT_PATCH_STYLE.outline; ctx.fillStyle = TEXT_PATCH_STYLE.color;
  ctx.strokeText(text, c.width / 2, c.height / 2); ctx.fillText(text, c.width / 2, c.height / 2);
  return c.toDataURL("image/png");
}