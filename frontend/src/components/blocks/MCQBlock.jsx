import { useState } from 'react';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';

/**
 * Interactive multiple-choice question block.
 * Renders within lesson content — supports check/reveal/retry flow.
 */
export default function MCQBlock({ block }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  if (!block) return null;

  const question    = block.question || block.text || 'Question';
  const options     = block.options || [];
  const correctIdx  = block.correctAnswer ?? block.answer ?? null;
  const explanation = block.explanation || null;

  const handleSelect = (index) => {
    if (revealed) return;
    setSelected(index);
  };

  const handleCheck = () => {
    if (selected === null) return;
    setRevealed(true);
  };

  const handleReset = () => {
    setSelected(null);
    setRevealed(false);
  };

  return (
    <div className="my-6 glass-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 bg-slate-800/50 border-b border-slate-700/50">
        <HelpCircle className="w-4 h-4 text-brand-400" />
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
          Quiz Question
        </span>
      </div>

      <div className="p-5">
        <p className="text-base font-medium text-slate-100 mb-4 leading-relaxed">
          {question}
        </p>

        {/* Options */}
        <div className="space-y-2.5 mb-5">
          {options.map((option, index) => {
            const optionText = typeof option === 'string' ? option : option.text || option.label || '';
            const isSelected = selected === index;
            const isCorrect  = index === correctIdx;

            let classes = 'w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 text-sm ';

            if (revealed) {
              if (isCorrect) {
                classes += 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
              } else if (isSelected && !isCorrect) {
                classes += 'border-rose-500/40 bg-rose-500/10 text-rose-300';
              } else {
                classes += 'border-slate-700/30 bg-slate-800/30 text-slate-500';
              }
            } else {
              classes += isSelected
                ? 'border-brand-500/40 bg-brand-500/10 text-brand-200'
                : 'border-slate-700/50 bg-slate-800/30 text-slate-300 hover:border-slate-600 hover:bg-slate-800/60 cursor-pointer';
            }

            return (
              <button
                key={index}
                onClick={() => handleSelect(index)}
                className={classes}
                disabled={revealed}
              >
                <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{optionText}</span>
                {revealed && isCorrect && <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
                {revealed && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {revealed && explanation && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/30">
            <p className="text-sm text-slate-300">
              <span className="font-semibold text-brand-400">Explanation: </span>
              {explanation}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          {!revealed ? (
            <button
              onClick={handleCheck}
              disabled={selected === null}
              className="btn-primary disabled:opacity-40"
            >
              Check Answer
            </button>
          ) : (
            <button onClick={handleReset} className="btn-secondary">
              Try Again
            </button>
          )}

          {revealed && (
            <span className={`text-sm font-medium ${
              selected === correctIdx ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {selected === correctIdx ? '✓ Correct!' : '✗ Incorrect'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
