import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Zap, Brain } from 'lucide-react';
import Logo from '../components/common/Logo';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-950 text-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-3xl">
        {/* Brand badge */}
        <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-sm font-medium mb-8">
          <Logo size="sm" />
          CourseAI
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
          Create Courses with{' '}
          <span className="gradient-text">
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
            className="btn-primary text-base px-7 py-4"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="btn-secondary text-base px-7 py-4"
          >
            Sign In
          </Link>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20">
          {[
            { icon: Brain,    title: 'AI Generated',    desc: 'Full course structure from a prompt' },
            { icon: Zap,      title: 'Instant Content',  desc: 'Enrich lessons with detailed AI content' },
            { icon: BookOpen, title: 'Learn & Export',    desc: 'Study online or download as PDF' },
          ].map((feature) => (
            <div
              key={feature.title}
              className="glass-card p-6 text-center hover:border-brand-500/20 transition-colors duration-300"
            >
              <feature.icon className="w-8 h-8 text-brand-400 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-white mb-1">{feature.title}</h3>
              <p className="text-xs text-slate-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}