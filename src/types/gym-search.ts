import type { GymType, LadiesStatus, SizeCategory } from "@prisma/client";

/** Structured filters extracted from natural language by Gemini. */
export interface GymSearchFilters {
  city?: string;
  area?: string;
  gymType?: GymType;
  ladiesStatus?: LadiesStatus;
  priceMin?: number;
  priceMax?: number;
  sizeCategory?: SizeCategory;
  featured?: boolean;
  ratingMin?: number;
  disciplineNames?: string[];
  amenityNames?: string[];
  searchTerm?: string;
}

export interface AiGymSearchResult {
  filters: GymSearchFilters;
  resultsCount: number;
}
