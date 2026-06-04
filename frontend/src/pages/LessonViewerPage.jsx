import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import LessonRenderer from '../components/Ui/LessonRenderer';
import DownloadButton from '../components/DownloadButton';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function LessonViewerPage() {
  const { id: lessonId, courseId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enriching, setEnriching] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    fetchData();
  }, [lessonId, courseId]);

  const fetchData = async () => {
    setLoading(true);

    try {
      if (!courseId) return;

      const { data: courseData } = await api.get(`/courses/${courseId}`);
      setCourse(courseData);

      const expanded = {};
      courseData.modules?.forEach((module) => {
        expanded[module._id] = true;
      });
      setExpandedModules(expanded);

      let foundLesson = null;

      for (const module of courseData.modules || []) {
        for (const les of module.lessons || []) {
          if (les._id === lessonId) {
            foundLesson = les;
            break;
          }
        }
        if (foundLesson) break;
      }

      setLesson(foundLesson);
    } catch (err) {
      toast.error('Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrich = async () => {
    setEnriching(true);

    try {
      const { data } = await api.post(`/courses/lessons/${lessonId}/enrich`);
      setLesson(data);
      toast.success('Lesson content generated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate content');
    } finally {
      setEnriching(false);
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
        <LoadingSpinner size="xl" text="Loading lesson..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-73px)] animate-fade-in">
      {course && (
        <aside
          className={`${
            sidebarOpen ? 'w-80' : 'w-0'
          } flex-shrink-0 border-r border-white/5 bg-dark-900/50 overflow-hidden transition-all duration-300 hidden lg:block`}
        >
          <div className="w-80 h-full overflow-y-auto py-4">
            <div className="px-4 pb-4 border-b border-white/5 mb-2">
              <button
                onClick={() => navigate(`/course/${courseId}`)}
                className="flex items-center gap-2 text-xs text-gray-500 hover:text-accent-light transition-colors mb-2"
              >
                <ArrowLeft className="w-3 h-3" />
                Back to course
              </button>
              <h3 className="text-sm font-semibold text-white truncate">
                {course.title}
              </h3>
            </div>

            {course.modules?.map((mod, modIndex) => (
              <div key={mod._id} className="mb-1">
                <button
                  onClick={() => toggleModule(mod._id)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-white/[0.03] transition-colors"
                >
                  {expandedModules[mod._id] ? (
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                  )}
                  <span className="text-xs font-semibold text-gray-400 truncate">
                    {modIndex + 1}. {mod.title}
                  </span>
                </button>

                {expandedModules[mod._id] &&
                  mod.lessons?.map((les) => (
                    <button
                      key={les._id}
                      onClick={() =>
                        navigate(`/course/${courseId}/lesson/${les._id}`)
                      }
                      className={`w-full text-left pl-10 pr-4 py-2 text-xs transition-colors truncate ${
                        les._id === lessonId
                          ? 'text-accent-light bg-accent/5 border-r-2 border-accent'
                          : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'
                      }`}
                    >
                      {les.title}
                    </button>
                  ))}
              </div>
            ))}
          </div>
        </aside>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 lg:px-12 py-8 max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-8 flex-wrap">
            <button
              onClick={() => navigate('/')}
              className="hover:text-white transition-colors"
            >
              Home
            </button>
            <ChevronRight className="w-3 h-3" />

            {course && (
              <>
                <button
                  onClick={() => navigate(`/course/${courseId}`)}
                  className="hover:text-white transition-colors truncate max-w-[150px]"
                >
                  {course.title}
                </button>
                <ChevronRight className="w-3 h-3" />
              </>
            )}

            <span className="text-gray-300 truncate max-w-[200px]">
              {lesson?.title}
            </span>
          </div>

          {lesson && (
            <div className="glass-card p-8 text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent/20 to-violet-glow/10 flex items-center justify-center border border-accent/10">
                <Sparkles className="w-8 h-8 text-accent-light" />
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">
                {lesson.content && lesson.content.length > 0
                  ? 'Improve / Regenerate Lesson Content'
                  : 'Generate Lesson Content'}
              </h3>

              <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                {lesson.content && lesson.content.length > 0
                  ? 'This lesson already has content. Click below to regenerate or enrich it again with AI.'
                  : "This lesson hasn't been enriched yet. Click below to generate detailed content with AI."}
              </p>

              <button
                onClick={handleEnrich}
                disabled={enriching}
                className="btn-primary inline-flex items-center gap-2"
              >
                {enriching ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating content...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {lesson.content && lesson.content.length > 0
                      ? 'Regenerate Content'
                      : 'Generate Content'}
                  </>
                )}
              </button>
            </div>
          )}

          <LessonRenderer content={lesson?.content} />

          {lesson?.content?.length > 0 && (
            <DownloadButton lessonTitle={lesson.title} />
          )}
        </div>
      </div>
    </div>
  );
}