import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { useDesignState, type Student } from "@/hooks/useDesignState";
import { generatePdf } from "@/lib/generatePdf";
import { submitDesign } from "@/api/designs";

export function SubmissionForm({ onDone }: { onDone: (pdf: Blob, id: string) => void }) {
  const { options, patches } = useDesignState();
  const [s, setS] = useState<Student>({ fullName: "", email: "", classYear: "", notes: "" });
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const count = Object.keys(patches).length;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const files = Object.fromEntries(Object.entries(patches).map(([k, p]) => [k, p.file]));
      setBusy("Building your PDF…");
      const pdf = await generatePdf(s, options, files);
      setBusy("Sending design…");
      const res = await submitDesign({ student: s, options, patches: files, pdf });
      onDone(pdf, res.id);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while submitting. Please try again.");
    } finally { setBusy(null); }
  };

  const field = (k: keyof Student, label: string, type = "text", required = true) => (
    <label className="block">
      <span className="field-label">{label}{!required && <span className="text-muted-foreground"> (optional)</span>}</span>
      {k === "notes"
        ? <textarea className="field" rows={3} value={s[k]} onChange={(e) => setS({ ...s, [k]: e.target.value })} />
        : <input className="field" type={type} required={required} value={s[k]} onChange={(e) => setS({ ...s, [k]: e.target.value })} />}
    </label>
  );

  return (
    <form onSubmit={submit} className="space-y-3">
      {field("fullName", "Full name")}
      <div className="grid grid-cols-2 gap-3">{field("email", "Email", "email")}{field("classYear", "Class year")}</div>
      {field("notes", "Notes", "text", false)}
      {count === 0 && <p className="text-xs text-muted-foreground">Tip: you haven't added any patches yet.</p>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <button type="submit" disabled={!!busy} className="btn-primary w-full">
        {busy ? <><Loader2 className="h-4 w-4 animate-spin" />{busy}</> : <><Send className="h-4 w-4" />Submit design</>}
      </button>
    </form>
  );
}
