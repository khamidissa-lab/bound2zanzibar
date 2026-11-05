import type { Locale } from "../config";

import { ar } from "./ar";
import { de } from "./de";
import { en, type Messages } from "./en";
import { fr } from "./fr";
import { it } from "./it";
import { tr } from "./tr";

export type { Messages };

const ALL: Record<Locale, Messages> = { en, fr, de, it, ar, tr };

/** Interface text for a language (server components and the provider). */
export function getMessages(locale: Locale): Messages {
  return ALL[locale];
}
