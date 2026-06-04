import { useState, useEffect } from 'react';
import { BookOpen, Layers, FileText, Sparkles } from 'lucide-react';
import api from '../../utils/api';

export default function StatsSection() {
  const [stats, setStats] = useState({ courses: 0, modules: 0, lessons: 0, enriched: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: courses } = await api.get('/courses/mine');
      let totalModules = 0;
      let totalLessons = 0;
      let totalEnriched = 0;

      // Count from course data (modules are populated in the overview, but listing may not have them)
      // We'll just count courses here since the list endpoint may not populate deeply
      setStats({
        courses: courses.length,
        modules: totalModules,
        lessons: totalLessons,
        enriched: totalEnriched,
      });
    } catch (err) {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  const statItems = [
    {
      label: 'Total Courses',
      value: stats.courses,
      icon: BookOpen,
      color: 'text-indigo-400',
      bgColor: 'from-indigo-500/10 to-indigo-500/5',
      borderColor: 'border-indigo-500/10',
    },
    {
      label: 'Modules',
      value: stats.modules || '—',
      icon: Layers,
      color: 'text-purple-400',
      bgColor: 'from-purple-500/10 to-purple-500/5',
      borderColor: 'border-purple-500/10',
    },
    {
      label: 'Lessons',
      value: stats.lessons || '—',
      icon: FileText,
      color: 'text-emerald-400',
      bgColor: 'from-emerald-500/10 to-emerald-500/5',
      borderColor: 'border-emerald-500/10',
    },
    {
      label: 'Enriched',
      value: stats.enriched || '—',
      icon: Sparkles,
      color: 'text-amber-400',
      bgColor: 'from-amber-500/10 to-amber-500/5',
      borderColor: 'border-amber-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statItems.map((stat) => (
        <div
          key={stat.label}
          className={`rounded-2xl border ${stat.borderColor} bg-gradient-to-br ${stat.bgColor} backdrop-blur-sm p-5 transition-all duration-300 hover:scale-[1.02]`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-10 h-10 rounded-xl bg-slate-900/50 flex items-center justify-center border ${stat.borderColor}`}
            >
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            {loading ? '...' : stat.value}
          </p>
          <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
