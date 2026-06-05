import { Check, Copy } from "lucide-react";
import { useState } from "react";

/**
 * Renders a syntax-highlighted code block with copy-to-clipboard.
 */
export default function CodeBlock({ block }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(block.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-6 rounded-xl overflow-hidden border border-slate-700/50 bg-slate-900/80 shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700/50">
        <span className="text-xs font-mono text-slate-400 uppercase">
          {block.language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="text-slate-400 hover:text-white transition-colors p-1 rounded"
          title={copied ? "Copied!" : "Copy code"}
        >
          {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono text-brand-200 leading-relaxed">
        <code>{block.code}</code>
      </pre>
    </div>
  );
}