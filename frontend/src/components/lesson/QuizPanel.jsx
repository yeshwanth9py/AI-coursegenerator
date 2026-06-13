import { useState } from 'react';
import { Brain, CheckCircle2, Loader2, Trophy } from 'lucide-react';
import api from '../../utils/api';

export default function QuizPanel({ lesson, onLessonUpdate, embedded = false }) {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [savingResult, setSavingResult] = useState(false);
  const [error, setError] = useState('');
  const panelClass = embedded
    ? ''
    : 'surface-card mt-8 p-6';

  async function generateQuiz() {
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post(`/courses/lessons/${lesson._id}/generate-quiz`);
      setQuestions(data.questions || []);
      setIndex(0);
      setAnswer(null);
      setChecked(false);
      setScore(0);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Could not generate quiz.');
    } finally {
      setLoading(false);
    }
  }

  function checkAnswer() {
    if (answer === null) return;
    if (answer === questions[index].correctAnswer) setScore((current) => current + 1);
    setChecked(true);
  }

  async function nextQuestion() {
    if (index === questions.length - 1) {
      setSavingResult(true);
      try {
        const { data } = await api.post(`/courses/lessons/${lesson._id}/quiz-result`, { score });
        onLessonUpdate(data);
      } catch {
        setError('Quiz finished, but the score could not be saved.');
      } finally {
        setSavingResult(false);
      }
    }

    setIndex((current) => current + 1);
    setAnswer(null);
    setChecked(false);
  }

  if (loading) {
    return (
      <div className={`${panelClass} flex min-h-32 items-center justify-center gap-3 text-slate-400`}>
        <Loader2 className="h-5 w-5 animate-spin text-brand-300" />
        Designing your quiz...
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className={panelClass}>
        <span className="grid h-11 w-11 place-items-center rounded-xl border border-brand-400/20 bg-brand-500/10 text-brand-200"><Brain className="h-5 w-5" /></span>
        <h2 className="mt-4 font-display text-xl font-bold text-white">Test your understanding</h2>
        <p className="mt-2 text-sm text-slate-500">{error || 'Generate five questions from this lesson.'}</p>
        {lesson.quizAttempts > 0 && (
          <p className="mt-2 text-xs text-slate-500">
            Best score: {lesson.quizBestScore}/5 across {lesson.quizAttempts} attempts
          </p>
        )}
        <button type="button" onClick={generateQuiz} className="btn-primary mt-4">
          Generate quiz
        </button>
      </div>
    );
  }

  if (index >= questions.length) {
    return (
      <div className={panelClass}>
        <span className="grid h-12 w-12 place-items-center rounded-xl border border-amber-400/20 bg-amber-500/10 text-amber-300"><Trophy className="h-6 w-6" /></span>
        <h2 className="mt-4 font-display text-xl font-bold text-white">Quiz complete</h2>
        <p className="mt-2 text-slate-400">You scored <strong className="text-white">{score} out of {questions.length}</strong>.</p>
        {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}
        <button type="button" onClick={generateQuiz} className="btn-secondary mt-4">
          Generate new questions
        </button>
      </div>
    );
  }

  const question = questions[index];

  return (
    <div className={panelClass}>
      <div className="flex items-center justify-between gap-4">
        <p className="eyebrow">Question {index + 1} of {questions.length}</p>
        <p className="text-xs font-semibold text-brand-200">Score {score}</p>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-500" style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
      </div>
      <h2 className="mt-6 font-display text-lg font-bold leading-relaxed text-white">{question.question}</h2>

      <div className="mt-5 space-y-2">
        {question.options.map((option, optionIndex) => {
          const correct = checked && optionIndex === question.correctAnswer;
          const wrong = checked && answer === optionIndex && !correct;
          let optionClass = 'border-white/[0.08] bg-white/[0.025] text-slate-300 hover:border-brand-400/25 hover:bg-brand-500/[0.06]';

          if (correct) optionClass = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300';
          else if (wrong) optionClass = 'border-rose-500/50 bg-rose-500/10 text-rose-300';
          else if (answer === optionIndex) optionClass = 'border-brand-400/50 bg-brand-500/15 text-white';

          return (
            <button
              key={option}
              type="button"
              onClick={() => !checked && setAnswer(optionIndex)}
              className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left text-sm transition ${optionClass}`}
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-current/20 text-xs font-bold">
                {correct ? <CheckCircle2 className="h-4 w-4" /> : String.fromCharCode(65 + optionIndex)}
              </span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>

      {checked && question.explanation && (
        <p className="mt-5 rounded-xl border border-brand-400/15 bg-brand-500/[0.07] p-4 text-sm leading-6 text-slate-300">{question.explanation}</p>
      )}

      <button
        type="button"
        onClick={checked ? nextQuestion : checkAnswer}
        disabled={answer === null || savingResult}
        className="btn-primary mt-5"
      >
        {savingResult ? 'Saving result...' : checked ? 'Next' : 'Check answer'}
      </button>
    </div>
  );
}
