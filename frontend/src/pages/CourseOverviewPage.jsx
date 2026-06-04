import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Loader2,
  Tag,
  Clock,
  Layers,
  FileText,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function CourseOverviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState({});
  const [enrichingLessonId, setEnrichingLessonId] = useState(null);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/courses/${id}`);
      setCourse(data);

      // Expand all modules by default
      const expanded = {};
      data.modules?.forEach((mod) => {
        expanded[mod._id] = true;
      });
      setExpandedModules(expanded);
    } catch (err) {
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrichLesson = async (lessonId) => {
    setEnrichingLessonId(lessonId);
    try {
      await api.post(`/courses/lessons/${lessonId}/enrich`);
      toast.success('Lesson content generated!');
      await fetchCourse(); // Refresh
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate content');
    } finally {
      setEnrichingLessonId(null);
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="xl" text="Loading course..." />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="px-4 lg:px-8 py-12 text-center">
        <p className="text-slate-400 text-lg">Course not found.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-indigo-400 hover:text-indigo-300 transition-colors text-sm"
        >
          ← Back to Home
        </button>
      </div>
    );
  }

  const totalLessons = course.modules?.reduce(
    (acc, mod) => acc + (mod.lessons?.length || 0),
    0
  ) || 0;

  const enrichedLessons = course.modules?.reduce(
    (acc, mod) =>
      acc +
      (mod.lessons?.filter((l) => l.isEnriched || l.content?.length > 0).length || 0),
    0
  ) || 0;

  const createdDate = course.createdAt
    ? new Date(course.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <div className="px-4 lg:px-8 py-8 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-8">
        <button
          onClick={() => navigate('/')}
          className="hover:text-white transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" />
          Home
        </button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-300 truncate">{course.title}</span>
      </div>

      {/* Course Header */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm p-8 mb-8">
        <div className="flex items-start gap-5 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/10 flex-shrink-0">
            <BookOpen className="w-7 h-7 text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
              {course.title}
            </h1>
            {course.description && (
              <p className="text-slate-400 leading-relaxed max-w-3xl">
                {course.description}
              </p>
            )}
          </div>
        </div>

        {/* Tags */}
        {course.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {course.tags.map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/50"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex flex-wrap gap-6 pt-4 border-t border-slate-800/60">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>
              {course.modules?.length || 0} module
              {(course.modules?.length || 0) !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <FileText className="w-4 h-4 text-purple-400" />
            <span>
              {totalLessons} lesson{totalLessons !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>
              {enrichedLessons}/{totalLessons} enriched
            </span>
          </div>
          {createdDate && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Created {createdDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-4">
        {course.modules?.map((mod, modIndex) => (
          <div
            key={mod._id}
            className="rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm overflow-hidden"
          >
            {/* Module Header */}
            <button
              onClick={() => toggleModule(mod._id)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-800/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-sm font-bold text-indigo-400 border border-indigo-500/10">
                  {modIndex + 1}
                </span>
                <h3 className="text-base font-semibold text-white text-left">
                  {mod.title}
                </h3>
                <span className="text-xs text-slate-500 ml-2">
                  {mod.lessons?.length || 0} lesson
                  {(mod.lessons?.length || 0) !== 1 ? 's' : ''}
                </span>
              </div>
              {expandedModules[mod._id] ? (
                <ChevronDown className="w-5 h-5 text-slate-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-500" />
              )}
            </button>

            {/* Lessons */}
            {expandedModules[mod._id] && (
              <div className="border-t border-slate-800/60">
                {mod.lessons?.length === 0 ? (
                  <p className="text-sm text-slate-500 italic px-6 py-4">
                    No lessons in this module yet.
                  </p>
                ) : (
                  mod.lessons?.map((lesson, lessonIndex) => {
                    const isEnriched =
                      lesson.isEnriched || lesson.content?.length > 0;
                    const isEnriching = enrichingLessonId === lesson._id;

                    return (
                      <div
                        key={lesson._id}
                        className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800/30 last:border-b-0 hover:bg-slate-800/20 transition-colors group"
                      >
                        <button
                          onClick={() =>
                            navigate(`/course/${id}/lesson/${lesson._id}`)
                          }
                          className="flex items-center gap-3 flex-1 min-w-0 text-left"
                        >
                          <span className="w-6 h-6 rounded-md bg-slate-800/60 flex items-center justify-center text-xs font-medium text-slate-500 border border-slate-700/50 flex-shrink-0">
                            {lessonIndex + 1}
                          </span>
                          <span className="text-sm text-slate-300 group-hover:text-white transition-colors truncate">
                            {lesson.title}
                          </span>
                          {isEnriched && (
                            <span className="ml-2 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                              <Sparkles className="w-2.5 h-2.5" />
                              Enriched
                            </span>
                          )}
                        </button>

                        {!isEnriched && (
                          <button
                            onClick={() => handleEnrichLesson(lesson._id)}
                            disabled={isEnriching}
                            className="ml-3 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 opacity-0 group-hover:opacity-100"
                          >
                            {isEnriching ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3 h-3" />
                                Enrich
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        ))}

        {(!course.modules || course.modules.length === 0) && (
          <div className="text-center py-16 rounded-2xl border border-slate-700/50 bg-slate-900/40">
            <Layers className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">
              No modules yet
            </h3>
            <p className="text-sm text-slate-500">
              This course doesn't have any modules yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
