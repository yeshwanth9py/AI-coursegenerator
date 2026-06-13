import { ArrowRight, Award, Lock } from 'lucide-react';
import { courseProgress, nextIncompleteLesson } from '../utils/courseProgress';

export default function CertificateProgress({
  course,
  onContinue,
  onViewCertificate,
}) {
  const progress = courseProgress(course);
  const nextLesson = nextIncompleteLesson(course);
  const unlocked = progress.totalLessons > 0 && progress.remainingLessons === 0;
  const lessonWord = progress.remainingLessons === 1 ? 'lesson' : 'lessons';

  return (
    <section className={`relative overflow-hidden rounded-2xl border p-5 shadow-xl shadow-black/10 ${
      unlocked
        ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 to-slate-950/60'
        : 'border-brand-500/25 bg-gradient-to-br from-brand-500/10 to-slate-950/60'
    }`}
    >
      <div className={`pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full blur-3xl ${unlocked ? 'bg-emerald-400/15' : 'bg-brand-500/15'}`} />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className={`relative rounded-xl border p-2.5 ${unlocked ? 'border-emerald-400/20 bg-emerald-500/15' : 'border-brand-400/20 bg-brand-500/15'}`}>
            {unlocked
              ? <Award className="h-5 w-5 text-emerald-400" />
              : <Lock className="h-5 w-5 text-brand-400" />}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Course certificate
            </p>
            <h2 className="mt-1 font-semibold text-white">
              {unlocked ? 'Your certificate is unlocked' : `${progress.remainingLessons} ${lessonWord} left to unlock`}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {unlocked
                ? 'You completed every lesson. Your certificate is ready.'
                : 'Open each lesson, finish learning, then click Complete lesson. The certificate unlocks automatically at 100%.'}
            </p>
          </div>
        </div>

        {unlocked && onViewCertificate && (
          <button type="button" onClick={onViewCertificate} className="btn-primary">
            <Award className="h-4 w-4" />
            View certificate
          </button>
        )}
        {!unlocked && nextLesson && onContinue && (
          <button type="button" onClick={() => onContinue(nextLesson._id)} className="btn-secondary">
            Continue course
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
        <span>{progress.completedLessons} of {progress.totalLessons} lessons complete</span>
        <span>{progress.percentage}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className={`h-full rounded-full transition-all duration-700 ${unlocked ? 'bg-gradient-to-r from-emerald-500 to-cyan-400' : 'bg-gradient-to-r from-violet-500 via-brand-400 to-cyan-400'}`}
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
    </section>
  );
}
