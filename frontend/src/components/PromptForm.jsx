import { useState } from 'react';
import { ArrowRight, Loader2, Sparkles } from 'lucide-react';

const EXAMPLES = [
  'A beginner React course with small projects',
  'A practical Python course for data analysis',
  'A DSA interview preparation course',
];

export default function PromptForm({ onSubmit, isLoading = false }) {
  const [prompt, setPrompt] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    const value = prompt.trim();
    if (!value) return;

    const succeeded = await onSubmit(value);
    if (succeeded !== false) setPrompt('');
  }

  return (
    <form onSubmit={handleSubmit} className="group rounded-2xl border border-white/10 bg-[#090c1c]/80 p-2 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl transition focus-within:border-brand-400/40 focus-within:shadow-[0_24px_90px_rgba(79,70,229,0.18)]">
      <label className="block">
        <span className="sr-only">What course do you want to create?</span>
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="I want to master product design, from fundamentals to a portfolio project..."
          disabled={isLoading}
          maxLength={2000}
          rows={3}
          className="w-full resize-none border-0 bg-transparent px-4 py-4 text-base leading-7 text-white outline-none placeholder:text-slate-600 sm:text-lg"
        />
      </label>

      <div className="flex flex-wrap gap-2 px-3 pb-3">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setPrompt(example)}
            disabled={isLoading}
            className="rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-xs text-slate-500 transition hover:border-brand-400/30 hover:bg-brand-500/10 hover:text-brand-200"
          >
            {example}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2">
        <span className="flex items-center gap-2 text-xs text-slate-500">
          <Sparkles className="h-3.5 w-3.5 text-brand-300" />
          AI builds the complete course outline
        </span>
        <button type="submit" disabled={isLoading || !prompt.trim()} className="btn-primary shrink-0">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isLoading ? 'Designing course...' : 'Create course'}
          {!isLoading && <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
    </form>
  );
}
