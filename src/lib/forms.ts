/** Result shape shared by form Server Actions and their client forms. */
export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  /**
   * Non-secret submitted values echoed back so fields keep their contents
   * after React resets the form. Never include passwords.
   */
  values?: Record<string, string>;
};

export const initialFormState: FormState = { status: "idle" };

/** Reads string fields from FormData, ignoring files. */
export function formValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") values[key] = value;
  }
  return values;
}
