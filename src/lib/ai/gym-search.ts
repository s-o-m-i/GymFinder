import "server-only";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_GYM_SEARCH_SYSTEM_PROMPT } from "@/lib/ai/gemini-gym-prompt";
import {
  isGeminiQuotaError,
  isGeminiRecoverableError,
  parseGymFiltersLocally,
} from "@/lib/ai/parse-gym-filters-locally";
import {
  geminiGymFiltersSchema,
  type RawGeminiGymFilters,
} from "@/lib/validations/ai-gym-search";
import type { GymSearchFilters } from "@/types/gym-search";

export type FilterExtractionSource = "gemini" | "local" | "keyword";

export type FilterExtractionResult = {
  filters: GymSearchFilters;
  source: FilterExtractionSource;
  warning?: string;
};

/** Models confirmed via ListModels + generateContent on the Gemini API. */
const DEFAULT_GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
] as const;

const MODEL_FALLBACKS = [
  "gemini-2.5-flash",
  process.env.GEMINI_MODEL?.trim(),
  ...DEFAULT_GEMINI_MODELS,
].filter((m, i, arr): m is string => Boolean(m) && arr.indexOf(m) === i);

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey?.trim()) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return new GoogleGenerativeAI(apiKey);
}

function stripMarkdownJson(raw: string): string {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenceMatch ? fenceMatch[1].trim() : trimmed;
}

function normalizeFilters(raw: RawGeminiGymFilters): GymSearchFilters {
  const filters: GymSearchFilters = {};

  if (raw.city) filters.city = raw.city;
  if (raw.area) filters.area = raw.area;
  if (raw.gymType) filters.gymType = raw.gymType;
  if (raw.ladiesStatus) filters.ladiesStatus = raw.ladiesStatus;
  if (raw.priceMin !== undefined) filters.priceMin = raw.priceMin;
  if (raw.priceMax !== undefined) filters.priceMax = raw.priceMax;
  if (raw.sizeCategory) filters.sizeCategory = raw.sizeCategory;
  if (raw.featured !== undefined) filters.featured = raw.featured;
  if (raw.ratingMin !== undefined) filters.ratingMin = raw.ratingMin;
  if (raw.disciplineNames?.length) filters.disciplineNames = raw.disciplineNames;
  if (raw.amenityNames?.length) filters.amenityNames = raw.amenityNames;
  if (raw.searchTerm) filters.searchTerm = raw.searchTerm;

  return filters;
}

function localFallback(query: string, warning?: string): FilterExtractionResult {
  const filters = parseGymFiltersLocally(query);
  const hasOnlySearch =
    Object.keys(filters).length === 1 && filters.searchTerm === query.trim();

  return {
    filters,
    source: hasOnlySearch ? "keyword" : "local",
    warning,
  };
}

async function callGeminiModel(modelName: string, query: string): Promise<GymSearchFilters> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: GEMINI_GYM_SEARCH_SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1,
      maxOutputTokens: 512,
    },
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: query }] }],
  });

  const text = result.response.text();
  if (!text) throw new Error("Empty Gemini response");

  const parsed = JSON.parse(stripMarkdownJson(text));
  const validated = geminiGymFiltersSchema.safeParse(parsed);

  if (!validated.success) {
    throw new Error("Gemini filters validation failed");
  }

  return normalizeFilters(validated.data);
}

async function extractWithGemini(query: string): Promise<GymSearchFilters> {
  let lastError: unknown;
  let lastRecoverableError: unknown;

  for (const modelName of MODEL_FALLBACKS) {
    try {
      return await callGeminiModel(modelName, query);
    } catch (err) {
      lastError = err;
      if (isGeminiRecoverableError(err)) {
        lastRecoverableError = err;
        continue;
      }
      console.warn(`Gemini model ${modelName} failed:`, err);
    }
  }

  throw lastRecoverableError ?? lastError ?? new Error("All Gemini models failed");
}

/**
 * Converts natural language into structured gym search filters.
 * Falls back to local rules when Gemini is unavailable or quota-limited.
 */
export async function extractGymFilters(query: string): Promise<FilterExtractionResult> {
  const trimmed = query.trim();
  if (!trimmed) return { filters: {}, source: "keyword" };

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return localFallback(
      trimmed,
      "AI parsing is offline — using smart keyword matching. Add GEMINI_API_KEY for full AI search."
    );
  }

  try {
    const filters = await extractWithGemini(trimmed);
    return { filters, source: "gemini" };
  } catch (err) {
    if (isGeminiQuotaError(err)) {
      console.warn("Gemini quota exceeded — using local filter parser");
      return localFallback(
        trimmed,
        "AI quota reached — results use smart keyword matching. Try again later or upgrade your Gemini API plan."
      );
    }

    if (isGeminiRecoverableError(err)) {
      return localFallback(trimmed, "AI parsing unavailable — using smart keyword matching.");
    }

    console.error("extractGymFilters error:", err);
    return localFallback(trimmed, "AI parsing failed — using smart keyword matching.");
  }
}
