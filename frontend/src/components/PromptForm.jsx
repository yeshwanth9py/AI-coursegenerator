import { useState } from 'react';
import { Loader2 } from 'lucide-react';

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
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <label className="block text-sm font-medium text-slate-300">
        What course do you want to create?
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Describe the topic, audience, and level"
          disabled={isLoading}
          maxLength={2000}
          rows={4}
          className="input-field mt-2 resize-none"
        />
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setPrompt(example)}
            disabled={isLoading}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:text-white"
          >
            {example}
          </button>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <span className="text-xs text-slate-500">{prompt.length}/2000</span>
        <button type="submit" disabled={isLoading || !prompt.trim()} className="btn-primary">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isLoading ? 'Generating course...' : 'Generate course'}
        </button>
      </div>
    </form>
  );
}
