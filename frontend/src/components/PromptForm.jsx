import { useState } from "react";
import { Lightbulb, ArrowRight, Loader2, Brain } from "lucide-react";

const SUGGESTIONS = [
  "Create a beginner React course with projects",
  "Make a MERN stack course for college students",
  "Build a DSA roadmap course for interview prep",
  "Generate a full Python course for absolute beginners",
];

export default function PromptForm({ onSubmit, isLoading = false }) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    await onSubmit(prompt);
    setPrompt("");
  };

  return (
    <div className="w-full max-w-3xl mx-auto glass-card p-6 shadow-2xl text-white">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-purple-600 shadow-lg shadow-brand-500/20">
          <Brain className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Course Generator</h2>
          <p className="text-sm text-slate-400">
            Type a course idea and generate a full structured course
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-2xl border border-slate-700/40 bg-surface-950/70 p-3 shadow-inner">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: Create a full beginner-friendly course on React with modules, lessons, and projects..."
            rows={3}
            className="w-full resize-none bg-transparent px-1 py-1 text-slate-100 placeholder:text-slate-600 outline-none"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Keep it short. Mention topic, audience, and level.
          </p>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            {isLoading ? "Generating..." : "Generate Course"}
          </button>
        </div>
      </form>

      <div className="mt-6 border-t border-slate-700/40 pt-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-300">
          <Lightbulb className="h-4 w-4 text-amber-400" />
          Suggestions
        </div>

        <div className="flex flex-wrap gap-3">
          {SUGGESTIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setPrompt(item)}
              className="rounded-full border border-slate-700/40 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:border-brand-500/40 hover:bg-brand-500/10 hover:text-white"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
