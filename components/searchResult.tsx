import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SparklesIcon, RefreshIcon } from "./icons";
import { GeoAnalysisResult } from "@/types/types";

const markdownComponents = {
  h1: (props: any) => (
    <h1 className="text-3xl font-bold my-4 text-white" {...props} />
  ),
  h2: (props: any) => (
    <h2 className="text-2xl font-bold my-3 text-white" {...props} />
  ),
  h3: (props: any) => (
    <h3 className="text-xl font-bold my-2 text-slate-200" {...props} />
  ),
  p: (props: any) => (
    <p className="my-4 text-slate-300 leading-relaxed" {...props} />
  ),
  ul: (props: any) => (
    <ul className="list-disc list-inside my-4 pl-4 space-y-2" {...props} />
  ),
  ol: (props: any) => (
    <ol className="list-decimal list-inside my-4 pl-4 space-y-2" {...props} />
  ),
  li: (props: any) => <li className="text-slate-300" {...props} />,
  a: (props: any) => (
    <a
      className="text-primary hover:underline"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  strong: (props: any) => (
    <strong className="font-semibold text-white" {...props} />
  ),
  blockquote: (props: any) => (
    <blockquote
      className="border-l-4 border-slate-600 pl-4 italic text-slate-400 my-4"
      {...props}
    />
  ),
  code: (props: any) => (
    <code
      className="bg-slate-900 text-emerald-300 rounded px-1.5 py-1 text-sm font-mono"
      {...props}
    />
  ),
  pre: (props: any) => (
    <pre className="bg-slate-900 rounded p-4 overflow-x-auto my-4" {...props} />
  ),
};

interface ComparisonResultDisplayProps {
  result: GeoAnalysisResult;
  onRefresh?: () => void;
}

const ComparisonResultDisplay: React.FC<ComparisonResultDisplayProps> = ({
  result,
  onRefresh,
}) => {
  const renderCard = (title: string, content: string, borderColor: string) => (
    <div
      className={`bg-slate-800/50 border ${borderColor} rounded-xl p-6 flex flex-col`}
    >
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl font-bold text-slate-200">{title}</h2>
      </div>
      <div className="prose prose-invert prose-sm max-w-none text-slate-300">
        <ReactMarkdown
          children={content}
          remarkPlugins={[remarkGfm]}
          components={markdownComponents}
        />
      </div>
    </div>
  );

  const formatResetTime = (resetAt?: number) => {
    if (!resetAt) return "";
    const resetDate = new Date(resetAt);
    const now = new Date();
    const diffMs = resetDate.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `in ${diffHours} hour${diffHours > 1 ? 's' : ''} ${diffMinutes > 0 ? `and ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}` : ''}`;
    }
    return `in ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  };

  return (
    <div className="animate-[fadeIn_0.5s_ease-in-out]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <SparklesIcon className="h-8 w-8 text-primary" />
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
            GEO &amp; SEO Analysis
          </h2>
        </div>
        <div className="flex items-center gap-4">
          {result.remaining !== undefined && result.limit !== undefined && (
            <div className="text-sm text-slate-400">
              <span className="font-semibold text-primary">{result.remaining}</span>
              <span className="text-slate-500"> / {result.limit} requests remaining</span>
              {result.resetAt && (
                <span className="text-slate-500 text-xs block mt-1">
                  Resets {formatResetTime(result.resetAt)}
                </span>
              )}
            </div>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-indigo-500 text-white rounded-lg transition-colors duration-300 text-sm font-medium"
              title="Start a new analysis"
            >
              <RefreshIcon className="h-4 w-4" />
              <span>New Analysis</span>
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderCard("Gemini Analysis", result.gemini, "border-primary/50")}
        {renderCard("ChatGPT Analysis", result.chatgpt, "border-secondary/50")}
      </div>
    </div>
  );
};

export default ComparisonResultDisplay;
