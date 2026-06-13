import {
  BookOpen,
  CheckCircle2,
  Layers3,
  MessageCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PRODUCT_POINTS = [
  {
    icon: Layers3,
    title: 'Structured courses',
    description: 'Generate a practical outline, then build lessons as you need them.',
  },
  {
    icon: MessageCircle,
    title: 'Lesson-aware tutor',
    description: 'Ask questions using the current lesson as context.',
  },
  {
    icon: CheckCircle2,
    title: 'Progress that persists',
    description: 'Keep notes, bookmarks, quiz scores, and completion history.',
  },
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
    <main className="min-h-screen bg-[#070916] text-slate-200 lg:grid lg:grid-cols-[1fr_minmax(28rem,0.75fr)]">
      <section className="hidden border-r border-white/[0.07] px-12 py-10 lg:flex lg:flex-col">
        <Link to="/" className="flex w-fit items-center gap-2.5 text-white">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600">
            <BookOpen className="h-4 w-4" />
          </span>
          <span className="font-display font-bold">CourseAI</span>
        </Link>

        <div className="my-auto max-w-xl py-12">
          <p className="eyebrow">AI-assisted learning</p>
          <h2 className="mt-4 font-display text-4xl font-bold leading-tight text-white">
            Build a course around a goal you care about.
          </h2>
          <p className="mt-4 max-w-lg text-base leading-7 text-slate-400">
            CourseAI turns a topic into lessons, study tools, and a clear record of your progress.
          </p>

          <div className="mt-10 space-y-5">
            {PRODUCT_POINTS.map(({ icon: Icon, title: pointTitle, description: pointDescription }) => (
              <div key={pointTitle} className="flex gap-3">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-brand-300">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-white">{pointTitle}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{pointDescription}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex w-fit items-center gap-2.5 text-white lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600">
              <BookOpen className="h-4 w-4" />
            </span>
            <span className="font-display font-bold">CourseAI</span>
          </Link>

          <div className="surface-card p-6 sm:p-8">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="mt-3 font-display text-3xl font-bold text-white">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
            <div className="mt-7">{children}</div>
            <div className="mt-7 border-t border-white/[0.07] pt-6 text-center text-sm text-slate-400">
              {footer}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
