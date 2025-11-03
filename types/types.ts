export interface GeoAnalysisResult {
  gemini: string;
  chatgpt: string;
  remaining?: number;
  resetAt?: number;
  limit?: number;
}