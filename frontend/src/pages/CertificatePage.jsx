import { Award, ArrowLeft, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import { courseProgress } from '../utils/courseProgress';

export default function CertificatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/courses/${id}`)
      .then(({ data }) => setCourse(data))
      .catch(() => setCourse(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner text="Preparing certificate..." />;
  if (!course) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold text-white">Course not found</h1>
        <button type="button" onClick={() => navigate('/')} className="btn-secondary mt-6">
          <ArrowLeft className="h-4 w-4" />
          Back to courses
        </button>
      </div>
    );
  }

  const progress = courseProgress(course);

  if (progress.percentage !== 100) {
    const remainingLessons = progress.remainingLessons;

    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <Award className="mx-auto h-10 w-10 text-slate-600" />
        <h1 className="mt-5 text-2xl font-semibold text-white">Certificate not unlocked yet</h1>
        <p className="mt-2 text-slate-400">
          Complete every lesson to unlock it. You have {remainingLessons} {remainingLessons === 1 ? 'lesson' : 'lessons'} left.
        </p>
        <div className="mx-auto mt-6 max-w-md">
          <div className="flex justify-between text-xs text-slate-500">
            <span>{progress.completedLessons} of {progress.totalLessons} complete</span>
            <span>{progress.percentage}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full bg-brand-500" style={{ width: `${progress.percentage}%` }} />
          </div>
        </div>
        <button type="button" onClick={() => navigate(`/course/${id}`)} className="btn-primary mt-8">
          <ArrowLeft className="h-4 w-4" />
          Continue course
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex gap-3">
        <button type="button" onClick={() => navigate(`/course/${id}`)} className="btn-secondary">
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button type="button" onClick={() => window.print()} className="btn-primary">
          <Printer className="h-4 w-4" />
          Print or save PDF
        </button>
      </div>

      <div className="mb-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-5">
        <h1 className="font-semibold text-white">Your certificate is ready</h1>
        <p className="mt-1 text-sm text-slate-400">
          Use Print or save PDF, then choose Save as PDF in the print window to download it.
        </p>
      </div>

      <section
        data-print-content
        className="border-8 border-double border-brand-500 bg-white px-8 py-20 text-center text-slate-900"
      >
        <Award className="mx-auto h-14 w-14 text-brand-600" />
        <p className="mt-8 text-sm uppercase tracking-[0.3em] text-slate-500">Certificate of completion</p>
        <h1 className="mt-8 text-4xl font-semibold">{user.name}</h1>
        <p className="mt-5 text-lg text-slate-600">has completed the course</p>
        <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold">{course.title}</h2>
        <p className="mt-10 text-sm text-slate-500">
          Completed on {new Date(progress.completionDate).toLocaleDateString()}
        </p>
      </section>
    </div>
  );
}
