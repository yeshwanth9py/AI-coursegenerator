import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Search } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const [search, setSearch] = useState('');
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  function updateSearch(value) {
    setSearch(value);
    if (location.pathname === '/') {
      navigate(value.trim() ? `/?search=${encodeURIComponent(value.trim())}` : '/', {
        replace: true,
      });
    }
  }

  function submitSearch(event) {
    event.preventDefault();
    navigate(search.trim() ? `/?search=${encodeURIComponent(search.trim())}` : '/');
  }

  async function signOut() {
    await logout();
    navigate('/login');
  }

  return (
    <nav className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950">
      <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-8">
        <button type="button" onClick={() => navigate('/')} className="font-semibold text-white">
          CourseAI
        </button>

        <form onSubmit={submitSearch} className="hidden w-72 items-center gap-2 rounded-lg border border-slate-800 px-3 py-2 sm:flex">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            value={search}
            onChange={(event) => updateSearch(event.target.value)}
            placeholder="Search courses"
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-200 outline-none"
          />
        </form>

        <div className="ml-auto flex items-center gap-4">
          {user && <span className="hidden text-sm text-slate-300 sm:inline">{user.name}</span>}
          <button type="button" onClick={signOut} className="btn-secondary">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
