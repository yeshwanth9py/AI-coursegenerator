import { useState } from 'react';
import { CheckCircle, XCircle, Trophy, RotateCcw, Loader2, Brain } from 'lucide-react';

/**
 * Quiz panel that displays AI-generated MCQ questions.
 * Shows one question at a time with scoring.
 */
export default function QuizPanel({ lessonId, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState(null);

  const fetchQuiz = async () => {
    setLoading(true);
    setError(null);

    try {
      const api = (await import('../../utils/api')).default;
      const { data } = await api.post(`/courses/lessons/${lessonId}/generate-quiz`);
      setQuestions(data.questions || []);
      setCurrentIndex(0);
      setScore(0);
      setFinished(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (index) => {
    if (revealed) return;
    setSelectedAnswer(index);
  };

  const handleCheck = () => {
    if (selectedAnswer === null) return;
    setRevealed(true);

    const current = questions[currentIndex];
    if (selectedAnswer === current.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setRevealed(false);
    }
  };

  const handleRetake = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setRevealed(false);
    setScore(0);
    setFinished(false);
  };

  // Initial state — show start button
  if (questions.length === 0 && !loading && !error) {
    return (
      <div className="glass-card p-8 text-center mt-8">
        <Brain className="w-12 h-12 text-brand-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Quick Quiz</h3>
        <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
          Test your understanding with AI-generated questions based on this lesson.
        </p>
        <button onClick={fetchQuiz} className="btn-primary">
          Generate Quiz
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="glass-card p-8 text-center mt-8">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Generating quiz questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-8 text-center mt-8">
        <p className="text-rose-400 mb-4">{error}</p>
        <button onClick={fetchQuiz} className="btn-secondary">
          Try Again
        </button>
      </div>
    );
  }

  // Finished state — show score
  if (finished) {
    const percentage = Math.round((score / questions.length) * 100);
    const emoji = percentage >= 80 ? '🎉' : percentage >= 50 ? '👍' : '📚';

    return (
      <div className="glass-card p-8 text-center mt-8">
        <div className="text-5xl mb-4">{emoji}</div>
        <Trophy className="w-10 h-10 text-amber-400 mx-auto mb-3" />
        <h3 className="text-2xl font-bold text-white mb-2">
          {score} / {questions.length}
        </h3>
        <p className="text-slate-400 mb-1">{percentage}% correct</p>
        <p className="text-sm text-slate-500 mb-6">
          {percentage >= 80
            ? 'Excellent work! You have a strong grasp of this material.'
            : percentage >= 50
            ? 'Good effort! Review the lesson to strengthen weak areas.'
            : 'Keep studying! Review the lesson and try again.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={handleRetake} className="btn-secondary">
            <RotateCcw className="w-4 h-4" />
            Retake Quiz
          </button>
          <button onClick={fetchQuiz} className="btn-primary">
            New Questions
          </button>
        </div>
      </div>
    );
  }

  // Active question
  const question = questions[currentIndex];

  return (
    <div className="glass-card overflow-hidden mt-8">
      {/* Progress bar */}
      <div className="h-1 bg-slate-800">
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-purple-500 transition-all duration-500"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="text-xs text-brand-400 font-medium">
            Score: {score}/{currentIndex + (revealed ? 1 : 0)}
          </span>
        </div>

        {/* Question */}
        <p className="text-base font-medium text-white mb-5 leading-relaxed">
          {question.question}
        </p>

        {/* Options */}
        <div className="space-y-2.5 mb-5">
          {(question.options || []).map((option, idx) => {
            const isSelected = selectedAnswer === idx;
            const isCorrect = idx === question.correctAnswer;
            const optionText = typeof option === 'string' ? option : option.text || '';

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
                key={idx}
                onClick={() => handleSelect(idx)}
                className={classes}
                disabled={revealed}
              >
                <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1">{optionText}</span>
                {revealed && isCorrect && <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
                {revealed && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Explanation (after reveal) */}
        {revealed && question.explanation && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/30">
            <p className="text-sm text-slate-300">
              <span className="font-semibold text-brand-400">Explanation: </span>
              {question.explanation}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          {!revealed ? (
            <button
              onClick={handleCheck}
              disabled={selectedAnswer === null}
              className="btn-primary disabled:opacity-40"
            >
              Check Answer
            </button>
          ) : (
            <button onClick={handleNext} className="btn-primary">
              {currentIndex + 1 >= questions.length ? 'See Results' : 'Next Question'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
