/**
 * Photos whose licence requires a visible credit (for example Creative
 * Commons BY-SA). Shown on the public /photo-credits page, linked from the
 * footer. Full records for every photo are in docs/PHOTO_CREDITS.md.
 *
 * When adding a photo here, keep the title, author, source and licence
 * exactly as on the photo's source page.
 */
export type AttributedPhoto = {
  /** Local copy shown on the site. */
  src: string;
  title: string;
  author: string;
  /** The photo's page at its source (where the licence is stated). */
  sourceUrl: string;
  licence: string;
  licenceUrl: string;
  /** Where the photo appears on this site. */
  usedOn: { label: string; href: string };
};

export const attributedPhotos: readonly AttributedPhoto[] = [
  {
    src: "/images/tours/kizimkazi-dolphin-tour.jpg",
    title: "Dolphin tour in Zanzibar",
    author: "Prof. Chen Hualin",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Dolphin_tour_in_Zanzibar.jpg",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    usedOn: {
      label: "Kizimkazi Dolphin Experience",
      href: "/tours/kizimkazi-dolphin-experience",
    },
  },
];
