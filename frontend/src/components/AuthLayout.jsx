import {
  ArrowRight,
  Binary,
  BrainCircuit,
  Check,
  Code2,
  Database,
  Network,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DSA_PATH = [
  { label: 'Arrays & Hashing', detail: 'Completed', complete: true },
  { label: 'Binary Search', detail: 'Learning now', active: true },
  { label: 'Graphs & Dynamic Programming', detail: 'Up next' },
];

const CODE_LINES = [
  { number: 1, content: 'def binary_search(nums, target):', color: 'text-violet-200' },
  { number: 2, content: '    left, right = 0, len(nums) - 1', color: 'text-slate-300' },
  { number: 3, content: '    while left <= right:', color: 'text-cyan-200' },
  { number: 4, content: '        mid = (left + right) // 2', color: 'text-slate-300' },
  { number: 5, content: '        if nums[mid] == target:', color: 'text-emerald-200' },
  { number: 6, content: '            return mid', color: 'text-amber-200' },
];

const TOPICS = [
  { icon: Binary, label: 'DSA', position: 'left-[7%] top-[18%]', delay: '0s' },
  { icon: Database, label: 'DBMS', position: 'right-[7%] top-[13%]', delay: '1.1s' },
  { icon: Network, label: 'Networks', position: 'right-[4%] bottom-[18%]', delay: '2.2s' },
  { icon: Code2, label: 'System Design', position: 'left-[5%] bottom-[12%]', delay: '3.3s' },
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

function DsaWorkspace() {
  return (
    <div className="auth-workspace relative mt-9 max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#070a17]/85 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <div className="flex items-center gap-3 border-b border-white/[0.07] bg-white/[0.025] px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        </div>
        <div className="mx-auto flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-1 text-[10px] text-slate-500">
          <Terminal className="h-3 w-3 text-brand-300" />
          binary_search.py
        </div>
        <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
          Running
        </span>
      </div>

      <div className="grid lg:grid-cols-[1.35fr_0.65fr]">
        <div className="border-b border-white/[0.07] p-4 lg:border-b-0 lg:border-r">
          <div className="space-y-1.5 font-mono text-[11px] leading-5 xl:text-xs">
            {CODE_LINES.map((line, index) => (
              <div
                key={line.number}
                className="auth-code-line flex"
                style={{ animationDelay: `${0.55 + index * 0.33}s` }}
              >
                <span className="mr-4 w-3 select-none text-right text-slate-700">{line.number}</span>
                <span className={line.color}>{line.content}</span>
              </div>
            ))}
            <div className="flex">
              <span className="mr-4 w-3 text-right text-slate-700">7</span>
              <span className="auth-code-cursor text-brand-300"> </span>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-white/[0.07] bg-black/20 p-3">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">Array traversal</span>
              <span className="text-[10px] text-cyan-300">target = 23</span>
            </div>
            <div className="flex gap-1.5">
              {[2, 5, 8, 12, 16, 23, 38].map((value, index) => (
                <span
                  key={value}
                  className={`auth-array-cell grid h-8 min-w-8 flex-1 place-items-center rounded-lg border text-[10px] font-bold ${
                    value === 23
                      ? 'border-emerald-400/40 bg-emerald-400/15 text-emerald-200'
                      : 'border-white/[0.08] bg-white/[0.035] text-slate-400'
                  }`}
                  style={{ animationDelay: `${index * 0.35}s` }}
                >
                  {value}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">Complexity</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-cyan-400/15 bg-cyan-400/[0.06] p-2.5">
                <p className="font-mono text-sm font-bold text-cyan-200">O(log n)</p>
                <p className="mt-1 text-[9px] text-slate-600">Time</p>
              </div>
              <div className="rounded-xl border border-violet-400/15 bg-violet-400/[0.06] p-2.5">
                <p className="font-mono text-sm font-bold text-violet-200">O(1)</p>
                <p className="mt-1 text-[9px] text-slate-600">Space</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">Learning path</p>
            <div className="mt-2 space-y-1.5">
              {DSA_PATH.map((step, index) => (
                <div
                  key={step.label}
                  className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 ${
                    step.active
                      ? 'border-brand-400/25 bg-brand-500/10'
                      : 'border-transparent bg-white/[0.025]'
                  }`}
                >
                  <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg text-[9px] font-bold ${
                    step.complete
                      ? 'bg-emerald-400/10 text-emerald-300'
                      : step.active
                        ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                        : 'bg-white/[0.04] text-slate-600'
                  }`}>
                    {step.complete ? <Check className="h-3 w-3" /> : index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[10px] font-semibold text-slate-300">{step.label}</span>
                    <span className="block text-[8px] text-slate-600">{step.detail}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
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
    <main className="auth-stage relative min-h-screen overflow-x-hidden text-slate-200 lg:grid lg:grid-cols-[minmax(0,1.12fr)_minmax(450px,0.88fr)]">
      <div className="auth-aurora auth-aurora-one pointer-events-none absolute" />
      <div className="auth-aurora auth-aurora-two pointer-events-none absolute" />
      <div className="auth-particles pointer-events-none absolute inset-0" />

      {TOPICS.map(({ icon: Icon, label, position, delay }) => (
        <div
          key={label}
          className={`auth-topic-orb pointer-events-none absolute z-10 hidden items-center gap-2 rounded-full border border-white/[0.08] bg-[#0b1022]/60 px-3 py-2 text-[10px] font-semibold text-slate-400 backdrop-blur-xl xl:flex ${position}`}
          style={{ animationDelay: delay }}
        >
          <Icon className="h-3.5 w-3.5 text-brand-300" />
          {label}
        </div>
      ))}

      <section className="relative hidden min-h-screen overflow-hidden border-r border-white/[0.06] p-10 lg:flex lg:flex-col xl:p-14">
        <div className="auth-circuit pointer-events-none absolute inset-0 opacity-50" />

        <Link to="/" className="relative z-20 flex w-fit items-center gap-3 text-white">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-cyan-400 shadow-lg shadow-brand-500/20">
            <BrainCircuit className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">Course<span className="text-brand-300">AI</span></span>
        </Link>

        <div className="relative z-10 my-auto max-w-3xl py-8 animate-enter">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-400/20 bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-300">
            <Sparkles className="h-3.5 w-3.5" />
            Your AI computer science mentor
          </div>
          <h2 className="gradient-text max-w-2xl font-display text-5xl font-extrabold leading-[1.04] tracking-[-0.055em] xl:text-6xl">
            Master DSA. Build real engineering intuition.
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400 xl:text-base">
            Go from arrays to system design with personalized lessons, visual explanations, coding practice, quizzes, and an AI tutor that never gets tired.
          </p>

          <DsaWorkspace />
        </div>

        <div className="relative z-10 flex items-center gap-5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
          <span>Data Structures</span>
          <span className="h-1 w-1 rounded-full bg-brand-400" />
          <span>Algorithms</span>
          <span className="h-1 w-1 rounded-full bg-cyan-400" />
          <span>Core CS</span>
        </div>
      </section>

      <section className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-8 lg:px-10">
        <div className="auth-circuit pointer-events-none absolute inset-0 opacity-20 lg:hidden" />
        <div className="w-full max-w-md animate-enter-delay">
          <Link to="/" className="mb-8 flex w-fit items-center gap-2.5 text-white lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-cyan-400 shadow-lg shadow-brand-500/20">
              <BrainCircuit className="h-4 w-4" />
            </span>
            <span className="font-display font-bold tracking-tight">Course<span className="text-brand-300">AI</span></span>
          </Link>

          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(145deg,rgba(18,23,42,0.91),rgba(8,11,25,0.84))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.4)] backdrop-blur-2xl sm:p-8">
            <div className="pointer-events-none absolute -right-20 -top-24 h-48 w-48 rounded-full bg-brand-500/10 blur-3xl" />
            <div className="relative mb-7">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">{eyebrow}</p>
              <h1 className="font-display text-3xl font-bold tracking-tight text-white">{title}</h1>
              <p className="mt-2.5 text-sm leading-6 text-slate-400">{description}</p>
            </div>

            <div className="relative">{children}</div>

            <div className="relative mt-7 border-t border-white/5 pt-6 text-center text-sm text-slate-400">
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
