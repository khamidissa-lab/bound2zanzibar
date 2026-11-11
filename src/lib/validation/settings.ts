import { z } from "zod";

/** A currency the business quotes prices in (ISO 4217 code). */
export const currencySchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, { error: "Use the 3-letter ISO code, e.g. EUR." })
    .refine(
      (code) => {
        try {
          new Intl.NumberFormat("en-US", { style: "currency", currency: code });
          return Intl.supportedValuesOf("currency").includes(code);
        } catch {
          return false;
        }
      },
      { error: "That isn't a recognised currency code." },
    ),
  name: z
    .string()
    .trim()
    .min(1, { error: "Enter a name." })
    .max(60, { error: "Use at most 60 characters." }),
  sortOrder: z.coerce
    .number({ error: "Enter the display order." })
    .int({ error: "Order must be a whole number." })
    .min(0, { error: "Order must be at least 0." })
    .max(1000, { error: "Order must be at most 1000." }),
  isActive: z
    .string()
    .optional()
    .transform((v) => v === "on"),
});
