import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, LockKeyhole, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout, { GoogleIcon } from '../components/AuthLayout';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, loginWithAuth0 } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data);
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not sign in');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Continue learning"
      description="Sign in to pick up where you left off and keep your momentum going."
      footer={(
        <>
          New to CourseAI?{' '}
          <Link to="/signup" className="font-medium text-brand-300 transition hover:text-brand-300/80">
            Create an account
          </Link>
        </>
      )}
    >
      <button
        type="button"
        onClick={loginWithAuth0}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-700 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-slate-900"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <div className="my-6 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-600">
        <span className="h-px flex-1 bg-white/5" />
        or use email
        <span className="h-px flex-1 bg-white/5" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block text-sm font-medium text-slate-300">
          Email address
          <span className="relative mt-2 block">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="input-field h-12 rounded-xl border-slate-700/80 bg-slate-950/70 pl-10 transition placeholder:text-slate-600 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
              placeholder="you@example.com"
              autoComplete="email"
              maxLength={254}
              required
            />
          </span>
        </label>

        <label className="block text-sm font-medium text-slate-300">
          <span className="flex items-center justify-between gap-4">
            Password
            <span className="text-xs font-normal text-slate-500">8+ characters</span>
          </span>
          <span className="relative mt-2 block">
            <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="input-field h-12 rounded-xl border-slate-700/80 bg-slate-950/70 pl-10 pr-11 transition placeholder:text-slate-600 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
              placeholder="Enter your password"
              autoComplete="current-password"
              maxLength={128}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:from-brand-500 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  );
}
