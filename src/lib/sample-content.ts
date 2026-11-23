type MaybeSample = {
  isSample: boolean;
  prices?: readonly { isIllustrative: boolean }[];
};

/**
 * True while any item is still sample content (not yet reviewed and saved in
 * the admin) or has an example ("illustrative") price. List pages show their
 * "sample" notice only while this is true, so the notice disappears by
 * itself once the owner has confirmed every item and price on the page.
 */
export function hasExampleContent(items: readonly MaybeSample[]): boolean {
  return items.some(
    (item) => item.isSample || (item.prices ?? []).some((p) => p.isIllustrative),
  );
}
