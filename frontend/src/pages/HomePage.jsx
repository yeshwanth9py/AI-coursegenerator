import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, X } from 'lucide-react';
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
      <section className="surface-card mb-10 px-5 py-9 sm:px-8 lg:px-10 lg:py-11">
        <div className="max-w-3xl animate-enter">
          <p className="eyebrow">Create a course</p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
            What do you want to learn?
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Describe a topic or goal. CourseAI will create a structured outline that you can work through lesson by lesson.
          </p>
        </div>
        <div className="mt-7 max-w-4xl animate-enter-delay">
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
            <p className="mt-1 text-sm text-slate-500">{visibleCourses.length} courses</p>
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
            {visibleCourses.map((course) => (
              <CourseCard key={course._id} course={course} onDelete={deleteCourse} />
            ))}
          </div>
        ) : (
          <div className="surface-card py-16 text-center text-slate-500">
            <BookOpen className="mx-auto h-8 w-8 text-brand-300" />
            <p className="mt-4">{search ? 'No courses match this search.' : 'Create your first course above.'}</p>
          </div>
        )}
      </section>
    </div>
  );
}
