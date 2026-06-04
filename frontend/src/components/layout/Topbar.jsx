import { useAuth } from '../../hooks/useAuth';
import { Sparkles } from 'lucide-react';

export default function Topbar() {
  const { user } = useAuth();

  return (
    <div className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60">
      <div className="flex items-center justify-between px-6 h-14">
        <div className="flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-sm text-slate-400">
            Welcome back{user?.name ? `, ${user.name}` : ''}!
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </div>
  );
}