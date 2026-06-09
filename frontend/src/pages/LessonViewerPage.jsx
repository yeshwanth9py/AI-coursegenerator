import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Loader2,
  Play,
  MessageCircle,
  Brain,
  Zap,
  BookOpen,
  GraduationCap,
  Languages,
} from 'lucide-react';
import LessonRenderer from '../components/Ui/LessonRenderer';
import DownloadButton from '../components/DownloadButton';
import LoadingSpinner from '../components/Ui/LoadingSpinner';
import QuizPanel from '../components/lesson/QuizPanel';
import AddVideosModal from '../components/lesson/AddVideosModal';
import AIChatPanel from '../components/lesson/AIChatPanel';
import LessonAudioPlayer from '../components/lesson/LessonAudioPlayer';
import api from '../utils/api';
import toast from 'react-hot-toast';

const DEPTH_OPTIONS = [
  {
    key: 'brief',
    label: 'Brief',
    description: 'Key concepts only - quick overview',
    icon: Zap,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    key: 'standard',
    label: 'Standard',
    description: 'Balanced coverage with examples',
    icon: BookOpen,
    color: 'text-brand-400',
    bg: 'bg-brand-500/10 border-brand-500/20',
  },
  {
    key: 'deep',
    label: 'Deep Dive',
    description: 'Exhaustive with examples and edge cases',
    icon: GraduationCap,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
  },
];

const LANGUAGE_OPTIONS = [
  'English',
  'Hindi',
  'Spanish',
  'French',
  'German',
  'Tamil',
  'Telugu',
  'Bengali',
  'Marathi',
];

export default function LessonViewerPage() {
  const { id: lessonId, courseId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enriching, setEnriching] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});

  const [showDepthPicker, setShowDepthPicker] = useState(false);
  const [selectedDepth, setSelectedDepth] = useState('standard');
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const [showQuiz, setShowQuiz] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadLessonData = async () => {
      setLoading(true);

      try {
        const { data: courseData } = await api.get(`/courses/${courseId}`);
        if (cancelled) return;

        setCourse(courseData);

        const expanded = {};
        courseData.modules?.forEach((moduleDoc) => {
          expanded[moduleDoc._id] = true;
        });
        setExpandedModules(expanded);

        const lessons = courseData.modules?.flatMap((moduleDoc) => moduleDoc.lessons || []) || [];
        const currentLesson = lessons.find((item) => item._id === lessonId) || null;
        setLesson(currentLesson);
        setSelectedLanguage(currentLesson?.language || 'English');
      } catch {
        if (!cancelled) toast.error('Failed to load lesson');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadLessonData();

    return () => {
      cancelled = true;
    };
  }, [lessonId, courseId]);

  const handleEnrich = async () => {
    setEnriching(true);
    setShowDepthPicker(false);

    try {
      const { data } = await api.post(`/courses/lessons/${lessonId}/enrich`, {
        depth: selectedDepth,
        language: selectedLanguage,
      });
      setLesson(data);
      toast.success('Lesson content generated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate content');
    } finally {
      setEnriching(false);
    }
  };

  const handleVideoAdded = (updatedLesson) => {
    setLesson(updatedLesson);
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const hasContent = lesson?.content?.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner text="Loading lesson..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-73px)] animate-fade-in">
      {course && (
        <aside
          className="w-80 flex-shrink-0 border-r border-slate-800/40 bg-surface-950/50 overflow-hidden hidden lg:block"
        >
          <div className="w-80 h-full overflow-y-auto py-4">
            <div className="px-4 pb-4 border-b border-slate-800/40 mb-2">
              <button
                onClick={() => navigate(`/course/${courseId}`)}
                className="flex items-center gap-2 text-xs text-slate-500 hover:text-brand-400 transition-colors mb-2"
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
                  {expandedModules[mod._id]
                    ? <ChevronDown className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    : <ChevronRight className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  }
                  <span className="text-xs font-semibold text-slate-400 truncate">
                    {modIndex + 1}. {mod.title}
                  </span>
                </button>

                {expandedModules[mod._id] && mod.lessons?.map((les) => (
                  <button
                    key={les._id}
                    onClick={() => navigate(`/course/${courseId}/lesson/${les._id}`)}
                    className={`w-full text-left pl-10 pr-4 py-2 text-xs transition-colors truncate ${
                      les._id === lessonId
                        ? 'text-brand-400 bg-brand-500/5 border-r-2 border-brand-500'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'
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
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-8 flex-wrap">
            <button onClick={() => navigate('/')} className="hover:text-white transition-colors">
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
            <span className="text-slate-300 truncate max-w-[200px]">
              {lesson?.title}
            </span>
          </div>

          {lesson && (
            <div className="glass-card p-8 text-center mb-8">
              {!showDepthPicker ? (
                <>
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-500/20 to-purple-500/10 flex items-center justify-center border border-brand-500/10">
                    <Brain className="w-7 h-7 text-brand-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {hasContent ? 'Regenerate Lesson Content' : 'Generate Lesson Content'}
                  </h3>
                  <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                    {hasContent
                      ? 'Want fresh content? Choose a depth level and regenerate.'
                      : 'Choose how detailed you want the content to be.'}
                  </p>
                  <button
                    onClick={() => setShowDepthPicker(true)}
                    disabled={enriching}
                    className="btn-primary"
                  >
                    {enriching ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5" />
                        {hasContent ? 'Regenerate' : 'Generate Content'}
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    How detailed should the content be?
                  </h3>
                  <p className="text-sm text-slate-500 mb-6">Pick a depth level</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 max-w-xl mx-auto">
                    {DEPTH_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => setSelectedDepth(opt.key)}
                        className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                          selectedDepth === opt.key
                            ? `${opt.bg} ring-1 ring-current ${opt.color}`
                            : 'border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <opt.icon className={`w-5 h-5 mb-2 ${selectedDepth === opt.key ? opt.color : 'text-slate-500'}`} />
                        <p className="text-sm font-semibold">{opt.label}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{opt.description}</p>
                      </button>
                    ))}
                  </div>

                  <div className="max-w-xl mx-auto mb-6 text-left">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                      <Languages className="w-4 h-4 text-brand-400" />
                      Content language
                    </label>
                    <input
                      type="text"
                      list="lesson-language-options"
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      placeholder="English, Hindi, Japanese..."
                      className="input-field"
                    />
                    <datalist id="lesson-language-options">
                      {LANGUAGE_OPTIONS.map((language) => (
                        <option key={language} value={language}>
                        </option>
                      ))}
                    </datalist>
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <button onClick={() => setShowDepthPicker(false)} className="btn-secondary">
                      Cancel
                    </button>
                    <button onClick={handleEnrich} disabled={enriching} className="btn-primary">
                      {enriching ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        'Generate'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          <LessonRenderer content={lesson?.content} />

          {hasContent && (
            <div className="flex flex-wrap items-center gap-3 mt-8 pt-6 border-t border-slate-800/40">
              <LessonAudioPlayer
                title={lesson.title}
                content={lesson.content}
                language={lesson.language}
              />

              <button
                onClick={() => setShowVideoModal(true)}
                className="btn-secondary"
              >
                <Play className="w-4 h-4" />
                Add Videos
              </button>

              <button
                onClick={() => setShowQuiz(prev => !prev)}
                className="btn-secondary"
              >
                <Brain className="w-4 h-4" />
                {showQuiz ? 'Hide Quiz' : 'Quick Quiz'}
              </button>

              <button
                onClick={() => setShowChat(prev => !prev)}
                className="btn-secondary"
              >
                <MessageCircle className="w-4 h-4" />
                {showChat ? 'Close Chat' : 'Chat with AI'}
              </button>
            </div>
          )}

          {hasContent && showQuiz && (
            <QuizPanel lessonId={lessonId} />
          )}

          {hasContent && <DownloadButton lessonTitle={lesson.title} />}
        </div>
      </div>

      <AddVideosModal
        lessonId={lessonId}
        lessonTitle={lesson?.title || ''}
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        onVideoAdded={handleVideoAdded}
      />

      <AIChatPanel
        lessonId={lessonId}
        lessonTitle={lesson?.title || ''}
        isOpen={showChat}
        onClose={() => setShowChat(false)}
      />
    </div>
  );
}
