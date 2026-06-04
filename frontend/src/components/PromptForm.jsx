import { useState } from "react";
import { Sparkles, Lightbulb, ArrowRight, Loader2 } from "lucide-react";

export default function PromptForm({ onSubmit, isLoading = false }) {
  const [prompt, setPrompt] = useState("");

  const suggestions = [
    "Create a beginner React course with projects",
    "Make a MERN stack course for college students",
    "Build a DSA roadmap course for interview prep",
    "Generate a full Python course for absolute beginners",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    await onSubmit(prompt);
    setPrompt("");
  };

  return (
    <div className="w-full max-w-3xl mx-auto rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl text-white">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/20">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Course Generator</h2>
          <p className="text-sm text-slate-400">
            Type a course idea and generate a full structured course
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3 shadow-inner">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: Create a full beginner-friendly course on React with modules, lessons, projects, and quizzes..."
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
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-3 font-semibold text-white shadow-lg shadow-purple-500/25 transition hover:-translate-y-0.5 hover:from-purple-500 hover:to-pink-500 disabled:opacity-70 disabled:cursor-not-allowed"
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

      <div className="mt-6 border-t border-white/10 pt-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-300">
          <Lightbulb className="h-4 w-4 text-yellow-400" />
          Suggestions
        </div>

        <div className="flex flex-wrap gap-3">
          {suggestions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setPrompt(item)}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-white"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}