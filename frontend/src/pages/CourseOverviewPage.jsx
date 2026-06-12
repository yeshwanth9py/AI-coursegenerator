import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bookmark, CheckCircle2, Circle } from 'lucide-react';
import toast from 'react-hot-toast';
import CertificateProgress from '../components/CertificateProgress';
import LoadingSpinner from '../components/LoadingSpinner';
import ShareCourseButton from '../components/ShareCourseButton';
import api from '../utils/api';

export default function CourseOverviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    api.get(`/courses/${id}`)
      .then(({ data }) => {
        if (active) setCourse(data);
      })
      .catch(() => toast.error('Failed to load course'))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading course..." />;
  if (!course) return <p className="py-20 text-center text-slate-400">Course not found.</p>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <button onClick={() => navigate('/')} className="btn-secondary mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <header className="mb-8 border-b border-slate-800 pb-8">
        <h1 className="text-3xl font-semibold text-white">{course.title}</h1>
        {course.description && <p className="mt-3 text-slate-400">{course.description}</p>}
        <div className="mt-6">
          <ShareCourseButton course={course} onUpdate={setCourse} />
        </div>
      </header>

      <div className="mb-8">
        <CertificateProgress
          course={course}
          onContinue={(lessonId) => navigate(`/course/${id}/lesson/${lessonId}`)}
          onViewCertificate={() => navigate(`/course/${id}/certificate`)}
        />
      </div>

      <div className="space-y-5">
        {course.modules?.map((moduleDoc, moduleIndex) => (
          <section key={moduleDoc._id}>
            <h2 className="mb-2 font-medium text-white">{moduleIndex + 1}. {moduleDoc.title}</h2>
            <div className="overflow-hidden rounded-lg border border-slate-800">
              {moduleDoc.lessons?.map((lesson, lessonIndex) => (
                <button
                  key={lesson._id}
                  onClick={() => navigate(`/course/${id}/lesson/${lesson._id}`)}
                  className="flex w-full items-center gap-3 border-b border-slate-800 px-4 py-3 text-left text-sm text-slate-300 last:border-b-0 hover:bg-slate-900"
                >
                  <span className="w-5 text-slate-600">{lessonIndex + 1}</span>
                  <span className="flex-1">{lesson.title}</span>
                  {lesson.bookmarked && <Bookmark className="h-4 w-4 text-brand-400" />}
                  {lesson.quizBestScore > 0 && (
                    <span className="text-xs text-slate-500">{lesson.quizBestScore}/5</span>
                  )}
                  <span className={`flex items-center gap-1.5 text-xs ${
                    lesson.completedAt ? 'text-emerald-400' : 'text-slate-600'
                  }`}
                  >
                    {lesson.completedAt
                      ? <CheckCircle2 className="h-4 w-4" />
                      : <Circle className="h-4 w-4" />}
                    {lesson.completedAt ? 'Complete' : 'Not complete'}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
