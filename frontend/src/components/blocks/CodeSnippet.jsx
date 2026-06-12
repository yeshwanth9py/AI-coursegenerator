import { Copy } from 'lucide-react';

export default function CodeSnippet({ block }) {
  return (
    <div className="my-6 overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/80">
      <div className="flex items-center justify-between border-b border-slate-700/50 bg-slate-800/50 px-4 py-2">
        <span className="font-mono text-xs uppercase text-slate-400">
          {block.language || 'code'}
        </span>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(block.code)}
          className="rounded p-1 text-slate-400 hover:text-white"
          title="Copy code"
        >
          <Copy size={16} />
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-slate-200">
        <code>{block.code}</code>
      </pre>
    </div>
  );
}
