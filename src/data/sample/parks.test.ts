import { describe, expect, it } from "vitest";

import { sampleDestinations } from "./destinations";
import { newParks, parkTourDestinations } from "./parks";
import { sampleTours } from "./tours";

describe("safari park content", () => {
  const parks = sampleDestinations.filter((d) => d.region === "mainland");

  it("covers all ten parks from the brief", () => {
    expect(parks.map((p) => p.slug).sort()).toEqual(
      [
        "arusha-national-park",
        "gombe-stream",
        "lake-manyara",
        "mahale-mountains",
        "mikumi",
        "ngorongoro-crater",
        "nyerere",
        "ruaha",
        "serengeti-ngorongoro",
        "tarangire",
      ].sort(),
    );
  });

  it("gives every park wildlife and a best time to visit, and Zanzibar none", () => {
    for (const p of parks) {
      expect(p.wildlife.length, p.slug).toBeGreaterThan(0);
      expect(p.bestTime, p.slug).not.toBe("");
    }
    for (const d of sampleDestinations.filter((x) => x.region === "zanzibar")) {
      expect(d.wildlife).toEqual([]);
    }
  });

  it("keeps the new parks as drafts for the owner to review", () => {
    expect(newParks.every((p) => p.status === "draft")).toBe(true);
  });

  it("links each park safari to an existing park page", () => {
    const slugs = new Set(sampleDestinations.map((d) => d.slug));
    for (const [tour, park] of Object.entries(parkTourDestinations)) {
      expect(slugs.has(park), park).toBe(true);
      expect(sampleTours.find((t) => t.slug === tour)?.destinationSlug, tour).toBe(park);
    }
  });
});
