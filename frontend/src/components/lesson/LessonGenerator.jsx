import { Loader2, Sparkles } from 'lucide-react';

export default function LessonGenerator({
  hasContent,
  isGenerating,
  isPickerOpen,
  language,
  onGenerate,
  onLanguageChange,
  onPickerChange,
  onDepthChange,
  selectedDepth,
  streamedCount = 0,
}) {
  const isStreaming = isGenerating && streamedCount > 0;

  return (
    <section className="mb-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="font-semibold text-white">
        {hasContent ? 'Regenerate lesson' : 'Generate lesson'}
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        {isStreaming
          ? `Streaming content... ${streamedCount} block${streamedCount !== 1 ? 's' : ''} received`
          : isGenerating
            ? 'Connecting to AI and starting generation...'
            : 'Choose the lesson depth and language.'}
      </p>

      {isGenerating && (
        <div className="mt-3">
          <div className="stream-pulse-bar" />
        </div>
      )}

      {!isPickerOpen ? (
        <button
          type="button"
          onClick={() => onPickerChange(true)}
          disabled={isGenerating}
          className="btn-primary mt-5"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {isGenerating
            ? isStreaming ? 'Streaming...' : 'Generating...'
            : hasContent ? 'Regenerate' : 'Generate'}
        </button>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-slate-300">
            Depth
            <select
              value={selectedDepth}
              onChange={(event) => onDepthChange(event.target.value)}
              className="input-field mt-2"
            >
              <option value="brief">Brief</option>
              <option value="standard">Standard</option>
              <option value="deep">Deep</option>
            </select>
          </label>

          <label className="text-sm text-slate-300">
            Language
            <input
              type="text"
              value={language}
              onChange={(event) => onLanguageChange(event.target.value)}
              className="input-field mt-2"
              maxLength={80}
              required
            />
          </label>

          <div className="flex gap-3 sm:col-span-2">
            <button type="button" onClick={() => onPickerChange(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="button" onClick={onGenerate} disabled={isGenerating} className="btn-primary">
              {isGenerating ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
