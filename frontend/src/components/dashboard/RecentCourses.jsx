import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, ChevronRight } from 'lucide-react';
import api from '../../utils/api';

export default function RecentCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/courses/mine');
      setCourses(data.slice(0, 5)); // Show last 5
    } catch (err) {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Courses</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-slate-800/50 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-400" />
          Recent Courses
        </h3>
        <button
          onClick={() => navigate('/')}
          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
        >
          View All →
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-8">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No courses yet</p>
          <p className="text-xs text-slate-600 mt-1">
            Generate your first course from the home page!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {courses.map((course) => (
            <button
              key={course._id}
              onClick={() => navigate(`/course/${course._id}`)}
              className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/50 transition-all duration-200 group text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/15 to-purple-500/15 flex items-center justify-center border border-indigo-500/10 flex-shrink-0">
                <BookOpen className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">
                  {course.title}
                </p>
                <p className="text-xs text-slate-500">
                  {course.createdAt
                    ? new Date(course.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    : ''}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
