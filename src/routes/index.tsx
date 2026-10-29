import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { CheckCircle2, Download, Moon, Sun } from "lucide-react";
import { BODY_COLORS, DesignProvider, SLEEVE_COLORS, useDesignState } from "@/hooks/useDesignState";
import { ProgressChecklist } from "@/components/ProgressChecklist";
import { SlotPanel } from "@/components/SlotPanel";
import { SubmissionForm } from "@/components/SubmissionForm";

const JacketScene = lazy(() => import("@/components/JacketScene"));

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Senior Jacket Designer" },
      { name: "description", content: "Design your senior varsity jacket in 3D: pick colors, add patches, and submit." },
      { property: "og:title", content: "Senior Jacket Designer" },
      { property: "og:description", content: "Design your senior varsity jacket in 3D and submit it in minutes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <DesignProvider><App /></DesignProvider>,
});

function Swatches({ label, colors, value, onChange }: { label: string; colors: string[]; value: string; onChange: (c: string) => void }) {
  return (
    <fieldset>
      <legend className="eyebrow mb-2">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {colors.map((c) => (
          <button key={c} type="button" aria-label={`${label} ${c}`} aria-pressed={value === c} className="swatch" data-active={value === c} style={{ background: c }} onClick={() => onChange(c)} />
        ))}
        <label className="swatch swatch-custom" aria-label={`Custom ${label}`}>
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="sr-only" />+
        </label>
      </div>
    </fieldset>
  );
}

function App() {
  const { options, setOption, faceAzimuth } = useDesignState();
  const [done, setDone] = useState<{ url: string; id: string } | null>(null);
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(window.matchMedia("(prefers-color-scheme: dark)").matches); }, []);
  useEffect(() => { document.documentElement.classList.toggle("dark", dark); }, [dark]);

  if (done) {
    return (
      <main className="grid min-h-screen place-items-center bg-background p-6">
        <div className="card max-w-md text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
          <h1 className="font-display mt-4 text-4xl">Design submitted!</h1>
          <p className="mt-2 text-muted-foreground">Reference <span className="font-mono text-foreground">{done.id}</span>. We'll be in touch.</p>
          <a href={done.url} download="senior-jacket-design.pdf" className="btn-primary mt-6 w-full"><Download className="h-4 w-4" />Download my PDF</a>
          <button className="btn-secondary mt-2 w-full" onClick={() => setDone(null)}>Back to my design</button>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:h-screen lg:grid-cols-[1fr_420px]">
      <section className="stage relative h-[58vh] lg:h-full">
        <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4">
          <div>
            <p className="eyebrow text-primary">Class spirit</p>
            <h1 className="font-display text-2xl leading-none sm:text-3xl">Senior Jacket Designer</h1>
          </div>
          <button className="icon-btn" onClick={() => setDark((d) => !d)} aria-label="Toggle dark mode">{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
        </header>
        <Suspense fallback={<div className="grid h-full place-items-center text-sm text-muted-foreground">Loading jacket…</div>}><JacketScene /></Suspense>
        <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center gap-2">
          <button className="btn-pill" onClick={() => faceAzimuth(0)}>Front</button>
          <button className="btn-pill" onClick={() => faceAzimuth(Math.PI)}>Back</button>
        </div>
        <p className="pointer-events-none absolute bottom-16 w-full text-center text-xs text-muted-foreground">Drag to rotate · tap a patch outline</p>
      </section>

      <aside className="space-y-6 overflow-y-auto border-l border-border bg-card p-5 lg:h-screen">
        <ProgressChecklist />
        <section className="space-y-4">
          <Swatches label="Body color" colors={BODY_COLORS} value={options.bodyColor} onChange={(c) => setOption("bodyColor", c)} />
          <Swatches label="Sleeve color" colors={SLEEVE_COLORS} value={options.sleeveColor} onChange={(c) => setOption("sleeveColor", c)} />
          <label className="block">
            <span className="eyebrow mb-2 block">Name / class year (back)</span>
            <input className="field" maxLength={18} value={options.text} onChange={(e) => setOption("text", e.target.value)} onFocus={() => faceAzimuth(Math.PI)} />
          </label>
        </section>
        <section>
          <h3 className="eyebrow mb-3">Submit</h3>
          <SubmissionForm onDone={(pdf, id) => setDone({ url: URL.createObjectURL(pdf), id })} />
        </section>
      </aside>
      <SlotPanel />
    </div>
  );
}
