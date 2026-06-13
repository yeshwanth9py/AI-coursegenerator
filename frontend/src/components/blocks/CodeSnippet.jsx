import { Copy } from 'lucide-react';

export default function CodeSnippet({ block }) {
  return (
    <div className="my-7 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#070914] shadow-2xl shadow-black/20">
      <div className="flex items-center justify-between border-b border-white/[0.07] bg-white/[0.035] px-4 py-3">
        <span className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500 before:h-2 before:w-2 before:rounded-full before:bg-emerald-400 before:shadow-[0_0_8px_rgba(52,211,153,0.7)]">
          {block.language || 'code'}
        </span>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(block.code)}
          className="icon-button h-8 w-8"
          title="Copy code"
        >
          <Copy size={16} />
        </button>
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-sm leading-7 text-slate-200">
        <code>{block.code}</code>
      </pre>
    </div>
  );
}
