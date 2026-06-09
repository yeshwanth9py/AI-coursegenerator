import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { BookOpen, LogOut, Search, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);

    const params = new URLSearchParams(location.search);
    if (value.trim()) {
      params.set('search', value.trim());
    } else {
      params.delete('search');
    }

    if (location.pathname === '/') {
      navigate(`/?${params.toString()}`, { replace: true });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      const params = searchTerm.trim() ? `?search=${encodeURIComponent(searchTerm.trim())}` : '';
      navigate(`/${params}`);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    if (location.pathname === '/') {
      navigate('/', { replace: true });
    }
  };

  return (
    <nav className="sticky top-0 z-30 bg-surface-950/80 backdrop-blur-xl border-b border-slate-800/60">
      <div className="flex items-center justify-between px-4 lg:px-8 h-16">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/courses')}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Open courses"
          >
            <BookOpen className="w-5 h-5" />
          </button>

          <form
            onSubmit={handleSearchSubmit}
            className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border text-sm w-72 transition-all duration-200 ${
              searchFocused
                ? 'bg-slate-900 border-brand-500/40 ring-1 ring-brand-500/20'
                : 'bg-slate-900/80 border-slate-800/60'
            }`}
          >
            <Search className={`w-4 h-4 flex-shrink-0 transition-colors ${searchFocused ? 'text-brand-400' : 'text-slate-500'}`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search courses..."
              className="bg-transparent text-slate-200 placeholder:text-slate-600 outline-none flex-1 text-sm"
              id="navbar-search-input"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={clearSearch}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden sm:flex items-center gap-2">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-brand-500/40"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <span className="text-sm text-slate-300 font-medium">
                {user.name}
              </span>
            </div>
          )}

          <button
            onClick={handleLogout}
            id="navbar-logout-btn"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 text-sm"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
