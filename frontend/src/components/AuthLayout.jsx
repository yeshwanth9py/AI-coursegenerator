import { ArrowRight, BookOpen, Check, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const COURSE_STEPS = [
  { label: 'Core concepts', detail: '6 min read', complete: true },
  { label: 'Guided practice', detail: 'Interactive', complete: true },
  { label: 'Build a project', detail: 'Up next', complete: false },
];

export function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.55h3.24c1.9-1.75 2.98-4.33 2.98-7.42Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.35l-3.25-2.55c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.77-5.61-4.14H3.03v2.62A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.39 13.92A6.01 6.01 0 0 1 6.07 12c0-.67.11-1.32.32-1.92V7.46H3.03A10 10 0 0 0 2 12c0 1.61.39 3.14 1.03 4.54l3.36-2.62Z" />
      <path fill="#EA4335" d="M12 5.94c1.47 0 2.79.5 3.82 1.5l2.88-2.88A9.65 9.65 0 0 0 12 2a10 10 0 0 0-8.97 5.46l3.36 2.62C7.18 7.7 9.39 5.94 12 5.94Z" />
    </svg>
  );
}

export default function AuthLayout({
  children,
  title,
  description,
  footer,
  eyebrow,
}) {
  return (
    <main className="relative min-h-screen overflow-hidden text-slate-200 lg:grid lg:grid-cols-[minmax(0,1.08fr)_minmax(460px,0.92fr)]">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl [animation:glowPulse_7s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute -bottom-44 right-0 h-[30rem] w-[30rem] rounded-full bg-cyan-500/10 blur-3xl [animation:glowPulse_9s_1s_ease-in-out_infinite]" />

      <section className="relative hidden min-h-screen overflow-hidden border-r border-white/5 p-12 lg:flex lg:flex-col xl:p-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.18),transparent_32%),radial-gradient(circle_at_80%_70%,rgba(34,211,238,0.10),transparent_26%)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.4)_1px,transparent_1px)] [background-size:48px_48px]" />

        <Link to="/" className="relative z-10 flex w-fit items-center gap-3 text-white">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-cyan-400 shadow-lg shadow-brand-500/20">
            <BookOpen className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight">CourseAI</span>
        </Link>

        <div className="relative z-10 my-auto max-w-2xl py-12 animate-enter">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-400/20 bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-300">
            <Sparkles className="h-3.5 w-3.5" />
            Learn anything, your way
          </div>
          <h2 className="max-w-xl text-5xl font-semibold leading-[1.08] tracking-tight text-white xl:text-6xl">
            Turn your curiosity into a course.
          </h2>
          <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
            Build a tailored learning path in seconds, then learn through focused lessons, practice, and projects.
          </p>

          <div className="mt-10 max-w-lg rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl [animation:float_7s_ease-in-out_infinite]">
            <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-300">Your learning path</p>
                <h3 className="mt-2 font-semibold text-white">Master UI Design Fundamentals</h3>
              </div>
              <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300">42% done</span>
            </div>

            <div className="mt-4 space-y-2">
              {COURSE_STEPS.map((step, index) => (
                <div
                  key={step.label}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 ${
                    step.complete ? 'bg-white/[0.035]' : 'border border-brand-400/20 bg-brand-500/10'
                  }`}
                >
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-semibold ${
                    step.complete ? 'bg-emerald-400/10 text-emerald-300' : 'bg-brand-500 text-white'
                  }`}
                  >
                    {step.complete ? <Check className="h-3.5 w-3.5" /> : index + 1}
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-medium text-slate-200">{step.label}</span>
                  <span className="text-xs text-slate-500">{step.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-600">
          Thoughtful learning paths, generated around your goals.
        </p>
      </section>

      <section className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-8 lg:px-12">
        <div className="w-full max-w-md animate-enter-delay">
          <Link to="/" className="mb-10 flex w-fit items-center gap-2.5 text-white lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-cyan-400 shadow-lg shadow-brand-500/20">
              <BookOpen className="h-4 w-4" />
            </span>
            <span className="font-semibold tracking-tight">CourseAI</span>
          </Link>

          <div className="rounded-3xl border border-white/10 bg-[linear-gradient(145deg,rgba(18,23,42,0.9),rgba(8,11,25,0.82))] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
            <div className="mb-7">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">{eyebrow}</p>
              <h1 className="text-3xl font-semibold tracking-tight text-white">{title}</h1>
              <p className="mt-2.5 text-sm leading-6 text-slate-400">{description}</p>
            </div>

            {children}

            <div className="mt-7 border-t border-white/5 pt-6 text-center text-sm text-slate-400">
              {footer}
            </div>
          </div>

          <Link
            to="/"
            className="mx-auto mt-6 flex w-fit items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-300"
          >
            Explore CourseAI
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
