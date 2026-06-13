import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, LockKeyhole, Mail, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout, { GoogleIcon } from '../components/AuthLayout';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, signupWithAuth0 } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      login(data);
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not create account');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Start learning"
      title="Start mastering computer science"
      description="Build a personalized path through DSA, development, core CS subjects, and interview preparation."
      footer={(
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-300 transition hover:text-brand-300/80">
            Sign in
          </Link>
        </>
      )}
    >
      <button
        type="button"
        onClick={signupWithAuth0}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/80 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-slate-900"
      >
        <GoogleIcon />
        Sign up with Google
      </button>

      <div className="my-6 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-600">
        <span className="h-px flex-1 bg-white/5" />
        or use email
        <span className="h-px flex-1 bg-white/5" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-slate-300">
          Full name
          <span className="relative mt-2 block">
            <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="input-field h-12 rounded-xl border-slate-700/80 bg-slate-950/70 pl-10 transition placeholder:text-slate-600 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
              placeholder="Your name"
              autoComplete="name"
              minLength={2}
              maxLength={100}
              required
            />
          </span>
        </label>

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
            <span className="text-xs font-normal text-slate-500">At least 8 characters</span>
          </span>
          <span className="relative mt-2 block">
            <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="input-field h-12 rounded-xl border-slate-700/80 bg-slate-950/70 pl-10 pr-11 transition placeholder:text-slate-600 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
              placeholder="Create a password"
              autoComplete="new-password"
              minLength={8}
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
          className="btn-primary w-full py-3"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-4 text-center text-[11px] leading-5 text-slate-600">
        By creating an account, you agree to use CourseAI responsibly.
      </p>
    </AuthLayout>
  );
}
