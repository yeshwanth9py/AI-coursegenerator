import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Bookmark, CheckCircle2, Circle, Layers3 } from 'lucide-react';
import toast from 'react-hot-toast';
import CertificateProgress from '../components/CertificateProgress';
import LoadingSpinner from '../components/LoadingSpinner';
import ShareCourseButton from '../components/ShareCourseButton';
import api from '../utils/api';
import { courseProgress } from '../utils/courseProgress';

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

  const progress = courseProgress(course);

  return (
    <div className="page-shell max-w-6xl">
      <button onClick={() => navigate('/')} className="btn-secondary mb-6 animate-enter">
        <ArrowLeft className="h-4 w-4" />
        Back to library
      </button>

      <header className="surface-card mb-8 p-6 animate-enter sm:p-8 lg:p-10">
        <div>
          <p className="eyebrow">Course overview</p>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-bold leading-tight text-white lg:text-5xl">{course.title}</h1>
          {course.description && <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">{course.description}</p>}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <ShareCourseButton course={course} onUpdate={setCourse} />
            <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-xs text-slate-400">
              {course.modules?.length || 0} modules
            </span>
            <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-xs text-slate-400">
              {progress.totalLessons} lessons
            </span>
            <span className="rounded-full border border-brand-400/20 bg-brand-500/10 px-3 py-2 text-xs font-semibold text-brand-200">
              {progress.percentage}% complete
            </span>
          </div>
        </div>
      </header>

      <div className="mb-10 animate-enter-delay">
        <CertificateProgress
          course={course}
          onContinue={(lessonId) => navigate(`/course/${id}/lesson/${lessonId}`)}
          onViewCertificate={() => navigate(`/course/${id}/certificate`)}
        />
      </div>

      <div className="space-y-6 animate-enter-delay">
        <div>
          <p className="eyebrow">Course curriculum</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-white">Modules and lessons</h2>
        </div>
        {course.modules?.map((moduleDoc, moduleIndex) => (
          <section key={moduleDoc._id} className="surface-card overflow-hidden">
            <div className="flex items-center gap-4 border-b border-white/[0.07] bg-white/[0.02] px-5 py-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-brand-400/20 bg-brand-500/10 font-display text-sm font-bold text-brand-200">
                {String(moduleIndex + 1).padStart(2, '0')}
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">Module {moduleIndex + 1}</p>
                <h2 className="mt-0.5 font-display font-bold text-white">{moduleDoc.title}</h2>
              </div>
              <span className="ml-auto hidden items-center gap-1.5 text-xs text-slate-500 sm:flex">
                <Layers3 className="h-3.5 w-3.5" />
                {moduleDoc.lessons?.length || 0} lessons
              </span>
            </div>
            <div>
              {moduleDoc.lessons?.map((lesson, lessonIndex) => (
                <button
                  key={lesson._id}
                  onClick={() => navigate(`/course/${id}/lesson/${lesson._id}`)}
                  className="group flex w-full items-center gap-3 border-b border-white/[0.055] px-5 py-4 text-left text-sm text-slate-300 transition last:border-b-0 hover:bg-brand-500/[0.07]"
                >
                  <span className={`grid h-7 w-7 place-items-center rounded-lg border text-[11px] font-semibold ${
                    lesson.completedAt
                      ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300'
                      : 'border-white/[0.08] bg-white/[0.03] text-slate-500'
                  }`}>{lessonIndex + 1}</span>
                  <span className="flex-1 font-medium transition group-hover:text-white">{lesson.title}</span>
                  {lesson.bookmarked && <Bookmark className="h-4 w-4 text-brand-400" />}
                  {lesson.quizBestScore > 0 && (
                    <span className="text-xs text-slate-500">{lesson.quizBestScore}/5</span>
                  )}
                  <span className={`hidden items-center gap-1.5 text-xs sm:flex ${
                    lesson.completedAt ? 'text-emerald-400' : 'text-slate-600'
                  }`}
                  >
                    {lesson.completedAt
                      ? <CheckCircle2 className="h-4 w-4" />
                      : <Circle className="h-4 w-4" />}
                    {lesson.completedAt ? 'Complete' : 'Not complete'}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-700 transition group-hover:translate-x-1 group-hover:text-brand-300" />
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
