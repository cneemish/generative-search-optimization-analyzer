import React from "react";
import { SearchIcon, LinkIcon } from "./icons";
import e from "express";

interface GeoFormProps {
  query: string;
  setQuery: (query: string) => void;
  keywords: string;
  setKeywords: (keywords: string) => void;
  url: string;
  setUrl: (url: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

const GeoAnalysisForm: React.FC<GeoFormProps> = ({
  query,
  setQuery,
  keywords,
  setKeywords,
  url,
  setUrl,
  onAnalyze,
  isLoading,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="query"
            className="block text-sm font-medium text-slate-400 mb-2"
          >
            User Question / Query
          </label>
          <input
            id="query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., How to make sourdough bread?"
            disabled={isLoading}
            required
            className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-gray-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
          />
        </div>
        <div>
          <label
            htmlFor="keywords"
            className="block text-sm font-medium text-slate-400 mb-2"
          >
            Target Keywords
          </label>
          <input
            id="keywords"
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g., sourdough, baking, starter, recipe"
            disabled={isLoading}
            required
            className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-gray-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="url"
          className="block text-sm font-medium text-slate-400 mb-2"
        >
          Website URL to Analyze
        </label>
        <div className="relative">
          <LinkIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/sourdough-recipe"
            disabled={isLoading}
            required
            className="w-full p-3 pl-10 bg-slate-800 border border-slate-600 rounded-lg text-gray-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
          />
        </div>
      </div>
      <div className="relative">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-indigo-500 disabled:bg-indigo-800/60 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 mt-2 text-lg group"
        >
          <SearchIcon className="h-5 w-5" />
          <span>Analyze GEO & SEO</span>
        </button>
      </div>
    </form>
  );
};

export default GeoAnalysisForm;
