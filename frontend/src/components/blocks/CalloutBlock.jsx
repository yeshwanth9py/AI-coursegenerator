export default function CalloutBlock({ block }) {
  return (
    <div className="my-6 flex gap-4 rounded-xl border border-indigo-500/20 bg-indigo-950/30 p-5 backdrop-blur-sm">
      <span className="flex-shrink-0 text-2xl leading-none" aria-hidden="true">
        {block.emoji || '💡'}
      </span>
      <div className="min-w-0">
        {block.title && (
          <p className="mb-1 text-sm font-semibold text-indigo-300">{block.title}</p>
        )}
        <p className="text-sm leading-relaxed text-slate-300">{block.text}</p>
      </div>
    </div>
  );
}
