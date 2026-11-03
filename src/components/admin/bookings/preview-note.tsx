import { FlaskConical } from "lucide-react";

/** Banner for the development-only booking and enquiry previews. */
export function PreviewNote() {
  return (
    <div
      role="note"
      className="mb-6 flex items-start gap-3 rounded-2xl border border-dashed border-gold bg-gold/10 px-4 py-3 text-sm text-ocean-deep"
    >
      <FlaskConical
        className="mt-0.5 size-4 shrink-0 text-gold-deep"
        aria-hidden="true"
      />
      <span>
        <strong>Development preview</strong> — not available on the live site. Everything
        here is <strong>EXAMPLE DATA</strong> for design review; nothing can be saved or
        exported.
      </span>
    </div>
  );
}
