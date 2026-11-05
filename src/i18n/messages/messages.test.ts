import { describe, expect, it } from "vitest";

import { TRANSLATED_LOCALES } from "../config";

import { en } from "./en";
import { getMessages } from "./index";

/** Every leaf path with its {placeholders}, e.g. "common.dayN" → "{n}". */
function leaves(value: unknown, path = ""): Map<string, string> {
  const out = new Map<string, string>();
  if (typeof value === "string") {
    out.set(path, (value.match(/\{\w+\}/g) ?? []).sort().join(","));
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => leaves(v, `${path}[${i}]`).forEach((p, k) => out.set(k, p)));
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      leaves(v, path ? `${path}.${k}` : k).forEach((p, key) => out.set(key, p));
    }
  }
  return out;
}

describe("interface translations", () => {
  const source = leaves(en);

  it.each(TRANSLATED_LOCALES)(
    "%s has the same keys and placeholders as English",
    (locale) => {
      const target = leaves(getMessages(locale));
      expect([...target.keys()].sort()).toEqual([...source.keys()].sort());
      for (const [key, placeholders] of source) {
        expect(target.get(key), key).toBe(placeholders);
      }
    },
  );

  it.each(TRANSLATED_LOCALES)("%s is actually translated", (locale) => {
    const t = getMessages(locale);
    // ("Home" is also the Italian word, so check other phrases.)
    expect(t.nav.bookNow).not.toBe(en.nav.bookNow);
    expect(t.tour.whatToExpect).not.toBe(en.tour.whatToExpect);
  });
});
