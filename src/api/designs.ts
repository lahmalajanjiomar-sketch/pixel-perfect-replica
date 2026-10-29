// All network logic lives in src/api/.
import type { JacketOptions, Student } from "@/hooks/useDesignState";
import type { PatchValue } from "@/lib/patchRules";

export interface SubmitDesignPayload {
  student: Student;
  options: JacketOptions;
  patches: Record<string, PatchValue>;
  pdf: Blob;
}

export interface SubmitDesignResult { ok: true; id: string }

// TODO: Replace this stub with a real API call (e.g. upload PDF + patches to the backend).
export async function submitDesign(payload: SubmitDesignPayload): Promise<SubmitDesignResult> {
  void payload;
  await new Promise((r) => setTimeout(r, 1200));
  return { ok: true, id: `JKT-${Date.now().toString(36).toUpperCase()}` };
}
