import { toTravelStyles } from "@/lib/discovery";
import type { TourLength, TravelStyle } from "@/types/content";

/*
 * Filter data for the sample tours and packages: how long each takes and
 * which travel styles it suits, read from each one's own duration and
 * description (2026-11-05). "luxury" is deliberately unused: nothing in the
 * existing descriptions supports it. Owner to review in the admin.
 */

type Discovery = { length: TourLength | null; travelStyles: TravelStyle[] };

const d = (length: TourLength | null, ...travelStyles: TravelStyle[]): Discovery => ({
  length,
  travelStyles: toTravelStyles(travelStyles),
});

export const tourDiscovery: Record<string, Discovery> = {
  "stone-town-city-tour": d("half_day", "cultural", "family"),
  "prison-island-tour": d("half_day", "family", "wildlife", "cultural"),
  "spice-farm-tour": d("half_day", "cultural", "family"),
  "jozani-forest-tour": d("half_day", "wildlife", "family"),
  "mnemba-island-snorkelling": d("half_day", "adventure", "wildlife"),
  "safari-blue-menai-bay": d("full_day", "relaxation", "family"),
  "nakupenda-sandbank": d("half_day", "relaxation", "romantic", "family"),
  "sunset-dhow-cruise": d("hours", "romantic", "relaxation"),
  "nungwi-kendwa-beach-experience": d("full_day", "relaxation", "romantic"),
  "kizimkazi-dolphin-experience": d("half_day", "wildlife", "family"),
  "mikumi-day-safari": d("full_day", "wildlife", "adventure"),
  "stone-town-food-tour": d("hours", "cultural"),
  "mangapwani-slave-caves": d("half_day", "cultural"),
  "kuza-cave-jambiani-village": d("half_day", "cultural", "family"),
  "blue-lagoon-snorkelling": d("half_day", "family", "relaxation"),
  "mnarani-turtle-aquarium": d("hours", "wildlife", "family"),
  "zanzibar-cooking-class": d("half_day", "cultural", "family"),
  "kwale-island-day-trip": d("full_day", "relaxation", "family"),
  "the-rock-michamvi-sunset": d("half_day", "romantic", "relaxation"),
  "ngorongoro-crater-day-safari": d("full_day", "wildlife", "adventure"),
  "nyerere-selous-day-safari": d("full_day", "wildlife", "adventure"),
  "pungume-island-sandbank": d("full_day", "relaxation", "family"),
  "jet-ski-experience": d("hours", "adventure"),
  "parasailing-experience": d("hours", "adventure"),
  "salaam-cave-experience": d("hours", "wildlife", "family"),
  "horse-riding-swimming": d("hours", "adventure", "romantic"),
  "serengeti-national-park-safari": d("multi_day", "wildlife"),
  "tarangire-national-park-safari": d("multi_day", "wildlife"),
  "lake-manyara-national-park-safari": d("multi_day", "wildlife"),
  "arusha-national-park-safari": d("multi_day", "wildlife"),
  "ruaha-national-park-safari": d("multi_day", "wildlife", "adventure"),
  "gombe-stream-national-park": d("multi_day", "wildlife", "adventure"),
  "mahale-mountains-national-park": d("multi_day", "wildlife", "adventure"),
  "great-wildebeest-migration-safari": d("multi_day", "wildlife"),
  "hot-air-balloon-safari-serengeti": d("hours", "wildlife", "romantic"),
};

export const packageTravelStyles: Record<string, TravelStyle[]> = {
  "zanzibar-highlights-4-days": toTravelStyles(["cultural", "relaxation", "family"]),
  "zanzibar-island-explorer-6-days": toTravelStyles(["family", "cultural", "relaxation"]),
  "zanzibar-mikumi-safari-5-days": toTravelStyles(["wildlife", "relaxation"]),
  "serengeti-ngorongoro-zanzibar-8-days": toTravelStyles(["wildlife", "relaxation"]),
};
