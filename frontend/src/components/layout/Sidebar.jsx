import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { BookOpen, ChevronRight, Home, Loader2, LogOut } from 'lucide-react';
import Logo from '../common/Logo';
import api from '../../utils/api';
import { subscribeToCourseListUpdates } from '../../utils/courseEvents';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    let active = true;

    const loadCourses = async () => {
      try {
        const { data } = await api.get('/courses/mine');
        if (active) setCourses(data.slice(0, 6));
      } catch {
        if (active) setCourses([]);
      } finally {
        if (active) setLoadingCourses(false);
      }
    };

    loadCourses();
    const unsubscribe = subscribeToCourseListUpdates(loadCourses);

    return () => {
      active = false;
      unsubscribe();
    };
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home, end: true },
    { name: 'My Courses', path: '/courses', icon: BookOpen, end: true },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col bg-surface-950/80 backdrop-blur-xl border-r border-slate-800/60 min-h-screen">
      <div className="px-6 py-5 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Logo size="sm" />
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text">CourseAI</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">
              Learning workspace
            </p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                isActive
                  ? 'bg-brand-500/10 text-brand-400 border border-brand-500/15 shadow-sm shadow-brand-500/5'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <section className="flex-1 min-h-0 px-4 pb-4">
        <div className="flex items-center justify-between px-2 mb-2">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
            Available courses
          </p>
          <button
            onClick={() => navigate('/courses')}
            className="text-[11px] text-brand-400 hover:text-brand-300 transition-colors"
          >
            View all
          </button>
        </div>

        <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-390px)]">
          {loadingCourses ? (
            <div className="flex items-center gap-2 px-3 py-3 text-xs text-slate-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Loading courses
            </div>
          ) : courses.length === 0 ? (
            <button
              onClick={() => navigate('/')}
              className="w-full text-left px-3 py-3 rounded-lg border border-dashed border-slate-800 text-xs text-slate-500 hover:text-slate-300 hover:border-slate-700 transition-colors"
            >
              No courses yet. Generate your first one.
            </button>
          ) : (
            courses.map((course) => (
              <button
                key={course._id}
                onClick={() => navigate(`/course/${course._id}`)}
                className="group w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
                title={course.title}
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-600 group-hover:text-brand-400 flex-shrink-0" />
                <span className="truncate flex-1">{course.title}</span>
                <ChevronRight className="w-3 h-3 text-slate-700 group-hover:text-slate-400 flex-shrink-0" />
              </button>
            ))
          )}
        </div>
      </section>

      <div className="p-4 border-t border-slate-800/60">
        {user && (
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 text-sm"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
