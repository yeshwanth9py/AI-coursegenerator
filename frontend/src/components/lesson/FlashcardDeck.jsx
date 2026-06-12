import { ArrowLeft, ArrowRight, Layers3, Loader2, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import api from '../../utils/api';

export default function FlashcardDeck({ lessonId, embedded = false }) {
  const [flashcards, setFlashcards] = useState([]);
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function generateFlashcards() {
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post(`/courses/lessons/${lessonId}/flashcards`);
      setFlashcards(data.flashcards);
      setIndex(0);
      setShowAnswer(false);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Could not generate flashcards.');
    } finally {
      setLoading(false);
    }
  }

  function move(direction) {
    setIndex((current) => (current + direction + flashcards.length) % flashcards.length);
    setShowAnswer(false);
  }

  if (!flashcards.length) {
    return (
      <div className={embedded ? '' : 'rounded-lg border border-slate-800 p-5'}>
        <h3 className="flex items-center gap-2 font-medium text-white">
          <Layers3 className="h-4 w-4" />
          AI flashcards
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Turn the lesson into a focused eight-card review deck.
        </p>
        {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
        <button
          type="button"
          onClick={generateFlashcards}
          disabled={loading}
          className="btn-primary mt-4"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Creating cards...' : 'Create flashcards'}
        </button>
      </div>
    );
  }

  const card = flashcards[index];

  return (
    <div className={embedded ? '' : 'rounded-lg border border-slate-800 p-5'}>
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-slate-500">Card {index + 1} of {flashcards.length}</p>
        <button
          type="button"
          onClick={generateFlashcards}
          className="text-slate-500 hover:text-white"
          title="Create a new deck"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => setShowAnswer((visible) => !visible)}
        className="mt-4 min-h-44 w-full rounded-lg border border-slate-700 bg-slate-950 p-6 text-left"
      >
        <span className="text-xs uppercase tracking-wide text-brand-400">
          {showAnswer ? 'Answer' : 'Question'}
        </span>
        <span className="mt-3 block text-lg text-white">
          {showAnswer ? card.back : card.front}
        </span>
        <span className="mt-5 block text-xs text-slate-500">Click to flip</span>
      </button>

      <div className="mt-4 flex justify-between">
        <button type="button" onClick={() => move(-1)} className="btn-secondary">
          <ArrowLeft className="h-4 w-4" />
          Previous
        </button>
        <button type="button" onClick={() => move(1)} className="btn-secondary">
          Next
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
