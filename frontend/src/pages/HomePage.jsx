import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, Sparkles, X } from 'lucide-react';
import toast from 'react-hot-toast';
import CourseCard from '../components/CourseCard';
import LearningSummary from '../components/LearningSummary';
import PromptForm from '../components/PromptForm';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';

export default function HomePage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const search = searchParams.get('search')?.trim().toLowerCase() || '';

  useEffect(() => {
    api.get('/courses/mine')
      .then(({ data }) => setCourses(data))
      .catch(() => toast.error('Failed to load courses'))
      .finally(() => setLoading(false));
  }, []);

  async function generateCourse(prompt) {
    setGenerating(true);

    try {
      const { data } = await api.post('/courses/generate', { prompt });
      navigate(`/course/${data._id}`);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to generate course');
      return false;
    } finally {
      setGenerating(false);
    }
  }

  async function deleteCourse(courseId) {
    if (!window.confirm('Delete this course?')) return;

    try {
      await api.delete(`/courses/${courseId}`);
      setCourses((current) => current.filter((course) => course._id !== courseId));
    } catch {
      toast.error('Failed to delete course');
    }
  }

  const visibleCourses = search
    ? courses.filter((course) => (
      course.title?.toLowerCase().includes(search)
      || course.description?.toLowerCase().includes(search)
    ))
    : courses;

  return (
    <div className="page-shell">
      <section className="relative mb-10 overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[radial-gradient(circle_at_80%_10%,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_10%_90%,rgba(124,58,237,0.20),transparent_35%),linear-gradient(145deg,rgba(20,24,46,0.94),rgba(7,9,22,0.9))] px-5 py-10 shadow-2xl shadow-black/20 sm:px-8 lg:px-12 lg:py-14">
        <div className="soft-grid pointer-events-none absolute inset-0 opacity-30 [mask-image:linear-gradient(to_right,black,transparent_75%)]" />
        <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border border-cyan-300/10 bg-cyan-400/[0.04] shadow-[0_0_80px_rgba(34,211,238,0.12)]" />
        <div className="relative max-w-3xl animate-enter">
          <p className="eyebrow"><Sparkles className="h-3.5 w-3.5" /> Built around your curiosity</p>
          <h1 className="gradient-text mt-5 max-w-2xl font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
            What will you master next?
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Describe a goal, topic, or skill. CourseAI turns it into a focused learning journey with lessons, practice, quizzes, and an AI tutor.
          </p>
        </div>
        <div className="relative mt-8 max-w-4xl animate-enter-delay">
          <PromptForm onSubmit={generateCourse} isLoading={generating} />
        </div>
      </section>

      {!loading && <LearningSummary courses={courses} />}

      <section className="animate-enter-delay">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Your library</p>
            <h2 className="mt-2 flex items-center gap-2 font-display text-2xl font-bold text-white">
              <BookOpen className="h-5 w-5 text-brand-300" />
              {search ? 'Search results' : 'My courses'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{visibleCourses.length} learning journeys</p>
          </div>
          {search && (
            <button type="button" onClick={() => setSearchParams({})} className="btn-secondary">
              <X className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-16"><LoadingSpinner text="Loading courses..." /></div>
        ) : visibleCourses.length ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleCourses.map((course, index) => (
              <CourseCard key={course._id} course={course} onDelete={deleteCourse} index={index} />
            ))}
          </div>
        ) : (
          <div className="surface-card py-16 text-center text-slate-500">
            <BookOpen className="mx-auto h-8 w-8 text-brand-300" />
            <p className="mt-4">{search ? 'No courses match this search.' : 'Your first learning journey starts above.'}</p>
          </div>
        )}
      </section>
    </div>
  );
}
