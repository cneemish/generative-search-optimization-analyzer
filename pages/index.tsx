import React, { useState, useCallback } from "react";
import Head from "next/head";
import { GeoAnalysisResult } from "@/types/types";
import GeoAnalysisForm from "../components/searchInput";
import ComparisonResultDisplay from "../components/searchResult";
import ErrorMessage from "@/components/errorMessage";
import LoadingSpinner from "@/components/loadingSpinner";
import { LogoIcon } from "../components/icons";

const HomePage: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [keywords, setKeywords] = useState<string>("");
  const [url, setUrl] = useState<string>("");

  const [analysisResult, setAnalysisResult] =
    useState<GeoAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingRequests, setRemainingRequests] = useState<number | null>(null);
  const [requestLimit, setRequestLimit] = useState<number | null>(null);

  const handleAnalysis = useCallback(async () => {
    if (!query.trim() || !keywords.trim() || !url.trim()) {
      setError("Please fill out all fields to start the analysis.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, keywords, url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Handle rate limit error
        if (response.status === 429 && errorData.remaining !== undefined) {
          setRemainingRequests(errorData.remaining);
          setRequestLimit(errorData.limit || null);
        }
        throw new Error(
          errorData.error || `Request failed with status ${response.status}`
        );
      }

      const result: GeoAnalysisResult = await response.json();
      setAnalysisResult(result);
      setRemainingRequests(result.remaining ?? null);
      setRequestLimit(result.limit ?? null);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unknown error occurred during the analysis process.";
      setError(`An unexpected error occurred: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [query, keywords, url]);

  const handleRefresh = useCallback(() => {
    setAnalysisResult(null);
    setError(null);
    setQuery("");
    setKeywords("");
    setUrl("");
  }, []);

  return (
    <>
      <Head>
        <title>GEO & SEO Analyzer</title>
        <meta
          name="description"
          content="An application that performs GEO & SEO analysis by calling the Gemini and OpenAI (ChatGPT) APIs to provide a two-model comparison."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen bg-slate-900 text-gray-200 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-6xl mx-auto">
          <header className="flex items-center justify-center gap-3 my-8">
            <LogoIcon className="h-10 w-10 text-primary" />
            <h1 className="text-3xl sm:text-4xl font-bold text-center tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400">
              GEO &amp; SEO Analyzer
            </h1>
          </header>

          <main className="flex flex-col gap-6">
            <GeoAnalysisForm
              query={query}
              setQuery={setQuery}
              keywords={keywords}
              setKeywords={setKeywords}
              url={url}
              setUrl={setUrl}
              onAnalyze={handleAnalysis}
              isLoading={isLoading}
              remainingRequests={remainingRequests}
              requestLimit={requestLimit}
            />

            <div className="mt-2 min-h-[400px]">
              {isLoading && <LoadingSpinner />}
              {error && <ErrorMessage message={error} />}
              {analysisResult && (
                <ComparisonResultDisplay 
                  result={analysisResult} 
                  onRefresh={handleRefresh}
                />
              )}
              {!isLoading && !error && !analysisResult && (
                <div className="text-center text-slate-500 pt-16">
                  <p className="text-lg">
                    Get GEO &amp; SEO recommendations from multiple AI
                    perspectives.
                  </p>
                  <p className="text-sm mt-2">
                    Enter a query, keywords, and a URL to see how you can
                    optimize for AI-driven search.
                  </p>
                </div>
              )}
            </div>
          </main>

          <footer className="text-center text-sm text-slate-600 mt-12 pb-4">
            <p>
              Created by{" "}
              <a
                href="https://github.com/cneemish"
                target="_blank"
                rel="noopener noreferrer"
              >
                storyteller
              </a>
              . View on{" "}
              <a
                href="https://github.com/cneemish/generative-search-optimization-analyzer"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              .
            </p>
          </footer>
        </div>
      </div>
    </>
  );
};

export default HomePage;
