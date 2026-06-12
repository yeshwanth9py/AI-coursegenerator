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
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      {!loading && <LearningSummary courses={courses} />}

      <section className="mb-12 max-w-3xl">
        <h1 className="text-3xl font-semibold text-white">Create a course</h1>
        <p className="mt-2 text-slate-400">
          Describe what you want to learn. The course outline is created first, then you can generate each lesson.
        </p>
        <div className="mt-6">
          <PromptForm onSubmit={generateCourse} isLoading={generating} />
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
              <BookOpen className="h-5 w-5" />
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
          <div className="rounded-xl border border-dashed border-slate-800 py-16 text-center text-slate-500">
            {search ? 'No courses match this search.' : 'No courses yet.'}
          </div>
        )}
      </section>
    </div>
  );
}
