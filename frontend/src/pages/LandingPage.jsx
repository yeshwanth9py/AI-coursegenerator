import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, BookOpen, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-3xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4" />
          AI-Powered Learning
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
          Create Courses with{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Artificial Intelligence
          </span>
        </h1>

        <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
          Describe any topic and let AI build a complete, structured course with
          modules, lessons, and rich content — in seconds.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 hover:-translate-y-0.5"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-700 text-slate-300 font-semibold hover:bg-slate-800/50 transition-all duration-300"
          >
            Sign In
          </Link>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20">
          {[
            { icon: Sparkles, title: 'AI Generated', desc: 'Full course structure from a prompt' },
            { icon: Zap, title: 'Instant Content', desc: 'Enrich lessons with detailed AI content' },
            { icon: BookOpen, title: 'Learn & Export', desc: 'Study online or download as PDF' },
          ].map((feature) => (
            <div
              key={feature.title}
              className="p-5 rounded-2xl border border-slate-800/60 bg-slate-900/40 text-center"
            >
              <feature.icon className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-white mb-1">{feature.title}</h3>
              <p className="text-xs text-slate-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}