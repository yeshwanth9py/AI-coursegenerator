import { useState } from 'react';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';

export default function MCQBlock({ block }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  if (!block) return null;

  const question = block.question || block.text || 'Question';
  const options = block.options || [];
  const correctAnswer = block.correctAnswer ?? block.answer ?? null;

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
    <div className="my-6 rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 bg-slate-800/50 border-b border-slate-700/50">
        <HelpCircle className="w-4 h-4 text-indigo-400" />
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
          Quiz Question
        </span>
      </div>

      <div className="p-5">
        {/* Question */}
        <p className="text-base font-medium text-slate-100 mb-4 leading-relaxed">
          {question}
        </p>

        {/* Options */}
        <div className="space-y-2.5 mb-5">
          {options.map((option, index) => {
            const optionText = typeof option === 'string' ? option : option.text || option.label || '';
            const isSelected = selected === index;
            const isCorrect = index === correctAnswer;

            let optionClass =
              'w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 text-sm ';

            if (revealed) {
              if (isCorrect) {
                optionClass +=
                  'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
              } else if (isSelected && !isCorrect) {
                optionClass +=
                  'border-rose-500/40 bg-rose-500/10 text-rose-300';
              } else {
                optionClass +=
                  'border-slate-700/30 bg-slate-800/30 text-slate-500';
              }
            } else {
              optionClass += isSelected
                ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-200'
                : 'border-slate-700/50 bg-slate-800/30 text-slate-300 hover:border-slate-600 hover:bg-slate-800/60 cursor-pointer';
            }

            return (
              <button
                key={index}
                onClick={() => handleSelect(index)}
                className={optionClass}
                disabled={revealed}
              >
                <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{optionText}</span>
                {revealed && isCorrect && (
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                )}
                {revealed && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {!revealed ? (
            <button
              onClick={handleCheck}
              disabled={selected === null}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold transition-all duration-200 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl border border-slate-600 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              Try Again
            </button>
          )}

          {revealed && (
            <span
              className={`text-sm font-medium ${
                selected === correctAnswer
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}
            >
              {selected === correctAnswer
                ? '✓ Correct!'
                : '✗ Incorrect — see the correct answer above.'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
