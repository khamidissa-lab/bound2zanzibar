import {
  IBM_Plex_Sans_Arabic,
  Instrument_Sans,
  Instrument_Serif,
  Noto_Naskh_Arabic,
} from "next/font/google";

// Display: Instrument Serif (high-contrast editorial serif, with italics).
// Body/UI: Instrument Sans (the grotesque designed as its companion).
// latin-ext covers French, German, Italian and Turkish letters (ç, ß, ğ, ş, ı…).
export const serif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin", "latin-ext"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const sans = Instrument_Sans({
  variable: "--font-sans-latin",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

// Arabic pages (dir="rtl") switch to these; not preloaded on other pages.
export const arabicDisplay = Noto_Naskh_Arabic({
  variable: "--font-ar-display",
  subsets: ["arabic"],
  weight: ["400", "600"],
  display: "swap",
  preload: false,
});

export const arabicBody = IBM_Plex_Sans_Arabic({
  variable: "--font-ar-body",
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
  display: "swap",
  preload: false,
});

export const fontVariables = [serif, sans, arabicDisplay, arabicBody]
  .map((f) => f.variable)
  .join(" ");
