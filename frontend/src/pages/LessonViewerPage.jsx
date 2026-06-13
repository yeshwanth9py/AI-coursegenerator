import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import CertificateProgress from '../components/CertificateProgress';
import LoadingSpinner from '../components/LoadingSpinner';
import ReadingProgress from '../components/ReadingProgress';
import AIChatPanel from '../components/lesson/AIChatPanel';
import LessonGenerator from '../components/lesson/LessonGenerator';
import LessonCompletion from '../components/lesson/LessonCompletion';
import LessonAudioPlayer from '../components/lesson/LessonAudioPlayer';
import LessonRenderer from '../components/lesson/LessonRenderer';
import LessonSidebar from '../components/lesson/LessonSidebar';
import StudyTools from '../components/lesson/StudyTools';
import api from '../utils/api';
import { generateLessonStream } from '../utils/lessonStream';

export default function LessonViewerPage() {
  const { id: lessonId, courseId } = useParams();
  const navigate = useNavigate();
  const lessonScrollRef = useRef(null);

  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showDepthPicker, setShowDepthPicker] = useState(false);
  const [selectedDepth, setSelectedDepth] = useState('standard');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [addingVideos, setAddingVideos] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [streamedCount, setStreamedCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadLesson() {
      setLoading(true);

      try {
        const { data } = await api.get(`/courses/${courseId}/lessons/${lessonId}`);
        if (cancelled) return;

        setCourse(data.course);
        setLesson(data.lesson);
        setSelectedLanguage(data.lesson.language || 'English');

        api.patch(`/courses/lessons/${lessonId}/progress`, { opened: true })
          .then(({ data: updatedLesson }) => {
            if (!cancelled) updateCurrentLesson(updatedLesson);
          })
          .catch(() => {});
      } catch {
        if (!cancelled) toast.error('Failed to load lesson');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadLesson();
    lessonScrollRef.current?.scrollTo({ top: 0 });

    return () => {
      cancelled = true;
    };
  }, [courseId, lessonId]);

  async function generateLesson() {
    const previousLesson = lesson;
    setGenerating(true);
    setShowDepthPicker(false);
    setStreamedCount(0);
    setLesson((current) => current ? { ...current, content: [] } : current);

    try {
      const updatedLesson = await generateLessonStream({
        depth: selectedDepth,
        language: selectedLanguage,
        lessonId,
        onBlock(block) {
          setStreamedCount((count) => count + 1);
          setLesson((current) => current
            ? { ...current, content: [...(current.content || []), block] }
            : current);
        },
      });
      updateCurrentLesson(updatedLesson);
      toast.success('Lesson content generated');
    } catch (error) {
      setLesson(previousLesson);
      toast.error(error.message || 'Failed to generate content');
    } finally {
      setGenerating(false);
      setStreamedCount(0);
    }
  }

  async function addVideos() {
    setAddingVideos(true);

    try {
      const { data } = await api.post(`/courses/lessons/${lessonId}/add-videos`);
      updateCurrentLesson(data.lesson);
      toast.success(`${data.videos.length} videos added`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not add videos');
    } finally {
      setAddingVideos(false);
    }
  }

  function updateCurrentLesson(updatedLesson) {
    setLesson(updatedLesson);
    setCourse((currentCourse) => {
      if (!currentCourse) return currentCourse;

      return {
        ...currentCourse,
        modules: currentCourse.modules.map((moduleDoc) => ({
          ...moduleDoc,
          lessons: moduleDoc.lessons.map((item) => (
            item._id === updatedLesson._id ? updatedLesson : item
          )),
        })),
      };
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner text="Loading lesson..." />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="px-4 lg:px-8 py-12 text-center">
        <p className="text-slate-400 text-lg">Lesson not found in this course.</p>
        <button onClick={() => navigate(`/course/${courseId}`)} className="btn-secondary mt-4">
          <ArrowLeft className="w-4 h-4" />
          Back to course
        </button>
      </div>
    );
  }

  const hasContent = lesson.content?.length > 0;

  return (
    <div className="flex h-[calc(100vh-4.5rem)] overflow-hidden">
      <ReadingProgress containerRef={lessonScrollRef} />

      {course && (
        <LessonSidebar
          course={course}
          currentLessonId={lessonId}
          onBack={() => navigate(`/course/${courseId}`)}
          onSelectLesson={(id) => navigate(`/course/${courseId}/lesson/${id}`)}
        />
      )}

      <div ref={lessonScrollRef} className="flex-1 overflow-y-auto">
        <div data-reading-content className="mx-auto max-w-5xl px-4 py-8 lg:px-12 lg:py-10">
          <div className="mb-7 flex flex-wrap items-center gap-2 text-xs text-slate-500 animate-enter">
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
            <span className="text-slate-300 truncate max-w-[200px]">{lesson.title}</span>
          </div>

          <header className="surface-card mb-8 p-6 animate-enter sm:p-8">
            <div>
              <p className="eyebrow"><BookOpen className="h-3.5 w-3.5" /> Lesson</p>
              <h1 className="mt-4 max-w-4xl font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
                {lesson.title}
              </h1>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-brand-400/20 bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-200">
                  {lesson.language || 'English'}
                </span>
                {lesson.completedAt && (
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
                    Lesson complete
                  </span>
                )}
              </div>
            </div>
          </header>


          {course && (
            <div className="mb-8 animate-enter-delay">
              <CertificateProgress
                course={course}
                onViewCertificate={() => navigate(`/course/${courseId}/certificate`)}
              />
            </div>
          )}

          <LessonGenerator
            hasContent={hasContent}
            isGenerating={generating}
            isPickerOpen={showDepthPicker}
            language={selectedLanguage}
            onGenerate={generateLesson}
            onLanguageChange={setSelectedLanguage}
            onPickerChange={setShowDepthPicker}
            onDepthChange={setSelectedDepth}
            selectedDepth={selectedDepth}
            streamedCount={streamedCount}
          />

          <LessonRenderer content={lesson.content} />

          {hasContent && !generating && (
            <StudyTools
              key={lessonId}
              lesson={lesson}
              addingVideos={addingVideos}
              chatOpen={showChat}
              onAddVideos={addVideos}
              onLessonUpdate={updateCurrentLesson}
              onToggleChat={() => setShowChat((visible) => !visible)}
            />
          )}

          {hasContent && !generating && (
            <LessonAudioPlayer key={`audio-${lessonId}`} lesson={lesson} />
          )}

          {hasContent && !generating && course && (
            <LessonCompletion
              course={course}
              courseId={courseId}
              lesson={lesson}
              onLessonUpdate={updateCurrentLesson}
            />
          )}
        </div>
      </div>

      <AIChatPanel
        key={lessonId}
        lessonId={lessonId}
        lessonTitle={lesson.title}
        isOpen={showChat}
        onClose={() => setShowChat(false)}
      />
    </div>
  );
}
