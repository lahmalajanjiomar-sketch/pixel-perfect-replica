import { NAME_MAX_LENGTH, PATCHES, QUOTE_MAX_LENGTH, type PatchConfig } from "@/config/patches";
export interface PatchValue { text?: string; countryCode?: string; file?: File }
export interface Order { size: "" | "S" | "M" | "L"; fullName: string; grade: string; notes: string; num: string; patch4Unlocked: boolean }
export const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const MAX_BYTES = 10 * 1024 * 1024;
export function validateImage(file: Pick<File, "type" | "size">): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return "Please choose a PNG, JPG or WEBP image.";
  if (file.size > MAX_BYTES) return "That image is over 10MB. Please choose a smaller one.";
  return null;
}
export function sanitizeText(type: PatchConfig["type"], input: string): string {
  if (type === "initials") return input.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2);
  if (type === "number") return input.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).replace(/[^0-9]/g, "").slice(0, 2);
  return Array.from(input).slice(0, type === "quote" ? QUOTE_MAX_LENGTH : NAME_MAX_LENGTH).join("");
}
export const displayDigits = (text: string, arabic: boolean) => arabic ? text.replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)] ?? d) : text;
export const isLocked = (p: PatchConfig, unlocked: boolean) => p.number === 11 && !unlocked;
export function isFilled(p: PatchConfig, value: PatchValue | undefined, unlocked: boolean): boolean {
  if (isLocked(p, unlocked)) return false;
  if (p.type === "standard") return true;
  if (p.type === "initials") return /^[A-Z]{2}$/.test(value?.text ?? "");
  if (p.type === "number") return /^[0-9]{1,2}$/.test(value?.text ?? "");
  if (p.type === "image") return !!value?.file;
  if (p.type === "country") return !!value?.countryCode || !!value?.file;
  return !!value?.text?.trim();
}
export const countPatches = (values: Record<string, PatchValue>, unlocked: boolean) => PATCHES.filter((p) => isFilled(p, values[p.id], unlocked)).length;
export function validateOrder(order: Order, values: Record<string, PatchValue>): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!["S", "M", "L"].includes(order.size)) errors["size"] = "Please choose your jacket size.";
  if (!order.fullName.trim()) errors["fullName"] = "Please enter your name.";
  if (!order.grade.trim()) errors["grade"] = "Please enter your grade, for example 12A.";
  for (const p of PATCHES) if (p.required && !isFilled(p, values[p.id], order.patch4Unlocked)) errors[p.id] = p.type === "initials" ? "Please enter exactly two letters." : `Please add your ${p.label.toLowerCase()}.`;
  return errors;
}