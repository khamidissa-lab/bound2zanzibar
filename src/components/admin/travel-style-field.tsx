import { CheckboxField } from "@/components/admin/editor-controls";
import { TRAVEL_STYLES } from "@/lib/discovery";
import type { TravelStyle } from "@/types/content";

const LABELS: Record<TravelStyle, string> = {
  luxury: "Luxury",
  adventure: "Adventure",
  romantic: "Romantic",
  family: "Family",
  cultural: "Cultural",
  relaxation: "Relaxation",
  wildlife: "Wildlife & safari",
};

/** Travel styles used by the website's filters and trip finder. */
export function TravelStyleField({
  selected,
  error,
}: {
  selected: readonly string[];
  error?: string;
}) {
  return (
    <fieldset className="sm:col-span-2">
      <legend className="mb-1 text-sm font-medium">Travel styles</legend>
      <p className="mb-2 text-xs text-muted-foreground">
        Tick only the styles this trip genuinely suits. Visitors filter and get trip
        suggestions by these.
      </p>
      <div className="grid gap-2 rounded-lg border p-3 sm:grid-cols-4">
        {TRAVEL_STYLES.map((style) => (
          <CheckboxField
            key={style}
            name="travelStyles"
            value={style}
            label={LABELS[style]}
            defaultChecked={selected.includes(style)}
          />
        ))}
      </div>
      {error ? <p className="mt-1 text-sm text-destructive">{error}</p> : null}
    </fieldset>
  );
}
