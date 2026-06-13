import { Check, FlaskConical, Loader2, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import api from '../../utils/api';

export default function PracticeLab({ lessonId, embedded = false }) {
  const [lab, setLab] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHint, setShowHint] = useState(false);

  async function generateLab() {
    setLoading(true);
    setError('');
    setShowHint(false);

    try {
      const { data } = await api.post(`/courses/lessons/${lessonId}/practice-lab`);
      setLab(data.lab);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Could not create a practice lab.');
    } finally {
      setLoading(false);
    }
  }

  if (!lab) {
    return (
      <div className={embedded ? '' : 'rounded-lg border border-slate-800 p-5'}>
        <h3 className="flex items-center gap-2 font-display text-lg font-bold text-white">
          <FlaskConical className="h-4 w-4" />
          Practice lab
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Generate a small project that applies this lesson in a realistic way.
        </p>
        {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
        <button type="button" onClick={generateLab} disabled={loading} className="btn-primary mt-4">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Designing lab...' : 'Create practice lab'}
        </button>
      </div>
    );
  }

  return (
    <div className={embedded ? '' : 'rounded-lg border border-slate-800 p-5'}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-brand-400">20-40 minute challenge</p>
          <h3 className="mt-2 text-lg font-semibold text-white">{lab.title}</h3>
        </div>
        <button
          type="button"
          onClick={generateLab}
          className="text-slate-500 hover:text-white"
          title="Create a different lab"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-300">{lab.brief}</p>

      <h4 className="mt-6 text-sm font-medium text-white">Steps</h4>
      <ol className="mt-3 space-y-3 text-sm text-slate-400">
        {lab.steps.map((step, index) => <li key={step} className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3"><span className="mr-2 font-semibold text-brand-300">{index + 1}.</span>{step}</li>)}
      </ol>

      <h4 className="mt-6 text-sm font-medium text-white">Definition of done</h4>
      <ul className="mt-3 space-y-2 text-sm text-slate-400">
        {lab.successCriteria.map((item) => <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />{item}</li>)}
      </ul>

      <button type="button" onClick={() => setShowHint((visible) => !visible)} className="btn-secondary mt-6">
        {showHint ? 'Hide hint' : 'Show hint'}
      </button>
      {showHint && <p className="mt-3 text-sm text-slate-400">{lab.hint}</p>}
    </div>
  );
}
