import { ArrowLeft, Award, BookOpen, CheckCircle2, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import { courseProgress } from '../utils/courseProgress';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export default function CertificatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    api.get(`/courses/${id}`)
      .then(({ data }) => {
        if (active) setCourse(data);
      })
      .catch(() => {
        if (active) setCourse(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <LoadingSpinner text="Preparing certificate..." />;

  if (!course) {
    return (
      <div className="page-shell max-w-2xl py-20 text-center animate-enter">
        <h1 className="text-2xl font-semibold text-white">Course not found</h1>
        <p className="mt-2 text-slate-400">
          We could not load this certificate because the course is missing or unavailable.
        </p>
        <button type="button" onClick={() => navigate('/')} className="btn-secondary mt-6">
          <ArrowLeft className="h-4 w-4" />
          Back to courses
        </button>
      </div>
    );
  }

  const progress = courseProgress(course);
  const learnerName = user?.name || user?.email || 'Learner';
  const completionDate = progress.completionDate
    ? dateFormatter.format(new Date(progress.completionDate))
    : dateFormatter.format(new Date());
  const moduleCount = course.modules?.length || 0;

  if (progress.percentage !== 100) {
    const remainingLessons = progress.remainingLessons;

    return (
      <div className="page-shell max-w-3xl py-12 animate-enter">
        <div className="surface-card p-6 lg:p-8">
          <button type="button" onClick={() => navigate(`/course/${id}`)} className="btn-secondary">
            <ArrowLeft className="h-4 w-4" />
            Back to course
          </button>

          <div className="relative mt-8 overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 p-8">
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300">
              <Award className="h-7 w-7" />
            </div>
            <h1 className="mt-6 text-3xl font-semibold text-white">Certificate not unlocked yet</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Finish every lesson in this course and the certificate will unlock automatically.
              You still have {remainingLessons} {remainingLessons === 1 ? 'lesson' : 'lessons'} left.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Progress</p>
                <p className="mt-2 text-2xl font-semibold text-white">{progress.percentage}%</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Lessons done</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {progress.completedLessons}/{progress.totalLessons}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Modules</p>
                <p className="mt-2 text-2xl font-semibold text-white">{moduleCount}</p>
              </div>
            </div>

            <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-400 via-brand-500 to-emerald-400" style={{ width: `${progress.percentage}%` }} />
            </div>

            <button type="button" onClick={() => navigate(`/course/${id}`)} className="btn-primary mt-8">
              <BookOpen className="h-4 w-4" />
              Continue course
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell max-w-6xl animate-enter">
      <div className="rounded-[2rem] border border-slate-800 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_35%),linear-gradient(180deg,_rgba(15,23,42,0.98),_rgba(2,6,23,0.98))] p-6 shadow-2xl shadow-black/20 lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Certificate unlocked
            </div>
            <h1 className="mt-4 text-3xl font-semibold text-white lg:text-4xl">Your certificate is ready</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Print it directly or save it as a PDF. The printable card below is already formatted for export.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => navigate(`/course/${id}`)} className="btn-secondary">
              <ArrowLeft className="h-4 w-4" />
              Back to course
            </button>
            <button type="button" onClick={() => window.print()} className="btn-primary">
              <Printer className="h-4 w-4" />
              Print or save PDF
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Learner</p>
            <p className="mt-2 text-lg font-semibold text-white">{learnerName}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Course progress</p>
            <p className="mt-2 text-lg font-semibold text-white">{progress.completedLessons} of {progress.totalLessons} lessons completed</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Issued on</p>
            <p className="mt-2 text-lg font-semibold text-white">{completionDate}</p>
          </div>
        </div>

        <section
          data-print-content
          className="relative mt-8 overflow-hidden rounded-[2rem] border border-amber-300/60 bg-white px-6 py-10 text-slate-900 shadow-[0_24px_80px_rgba(15,23,42,0.28)] sm:px-10 sm:py-12 lg:px-16 lg:py-16"
        >
          <div className="pointer-events-none absolute inset-5 rounded-[1.5rem] border border-slate-200" />
          <div className="pointer-events-none absolute left-6 right-6 top-6 h-24 rounded-full bg-[radial-gradient(circle,_rgba(251,191,36,0.24),_transparent_68%)]" />
          <div className="pointer-events-none absolute bottom-8 left-8 h-20 w-20 rounded-full border border-amber-300/50" />
          <div className="pointer-events-none absolute right-8 top-8 h-24 w-24 rounded-full border border-slate-200" />

          <div className="relative text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-amber-300 bg-amber-50 text-amber-600">
              <Award className="h-8 w-8" />
            </div>
            <p className="mt-6 text-xs uppercase tracking-[0.45em] text-slate-500">Certificate of Completion</p>
            <h2 className="mt-8 text-4xl font-semibold tracking-tight sm:text-5xl">{learnerName}</h2>
            <p className="mt-5 text-base text-slate-600 sm:text-lg">has successfully completed the course</p>
            <h1 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
              {course.title}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-slate-500">
              Awarded after completing all {progress.totalLessons} lessons across {moduleCount} {moduleCount === 1 ? 'module' : 'modules'}.
            </p>
          </div>

          <div className="relative mt-12 grid gap-6 border-t border-slate-200 pt-8 text-left sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Issued on</p>
              <p className="mt-2 text-sm font-medium text-slate-900">{completionDate}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Presented to</p>
              <p className="mt-2 text-sm font-medium text-slate-900">{learnerName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Issued by</p>
              <p className="mt-2 text-sm font-medium text-slate-900">CourseAI Learning Studio</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
