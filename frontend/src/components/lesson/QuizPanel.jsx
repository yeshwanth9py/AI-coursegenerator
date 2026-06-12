import { useState } from 'react';
import { Loader2 } from 'lucide-react';
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
    : 'mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6';

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
      <div className={`${panelClass} flex items-center gap-3 text-slate-400`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        Generating quiz...
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className={panelClass}>
        <h2 className="font-semibold text-white">Quick quiz</h2>
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
        <h2 className="font-semibold text-white">Quiz complete</h2>
        <p className="mt-2 text-slate-400">You scored {score} out of {questions.length}.</p>
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
      <p className="text-xs text-slate-500">Question {index + 1} of {questions.length}</p>
      <h2 className="mt-3 font-medium text-white">{question.question}</h2>

      <div className="mt-5 space-y-2">
        {question.options.map((option, optionIndex) => {
          const correct = checked && optionIndex === question.correctAnswer;
          const wrong = checked && answer === optionIndex && !correct;
          let optionClass = 'border-slate-700 text-slate-300';

          if (correct) optionClass = 'border-emerald-500 text-emerald-300';
          else if (wrong) optionClass = 'border-rose-500 text-rose-300';
          else if (answer === optionIndex) optionClass = 'border-brand-500 text-white';

          return (
            <button
              key={option}
              type="button"
              onClick={() => !checked && setAnswer(optionIndex)}
              className={`w-full rounded-lg border p-3 text-left text-sm ${optionClass}`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {checked && question.explanation && (
        <p className="mt-4 text-sm text-slate-400">{question.explanation}</p>
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
